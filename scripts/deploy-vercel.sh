#!/usr/bin/env bash
# PUBLIC DEPLOYMENT: run only after approval. Inputs are private files, not values.
set +x
set -Eeuo pipefail
umask 077
# Keep error summaries visible even when a failing command redirects stderr.
exec 3>&2
if [[ $# != 2 ]]; then
  printf 'Usage: bash scripts/deploy-vercel.sh DATABASE_URL_FILE VERCEL_TOKEN_FILE\n' >&2
  exit 2
fi
# Resolve before changing directory or invoking other tools. Never source inputs.
database_file=$(realpath "$1")
token_file=$(realpath "$2")
cd "$(dirname "$0")/.."
for file in "$database_file" "$token_file"; do
  case "$file" in "$PWD"/*) printf 'Keep secret input files outside the checkout.\n' >&2; exit 2;; esac
  [[ -f "$file" && -r "$file" && -s "$file" ]] || { printf 'Secret input file missing, empty or unreadable.\n' >&2; exit 2; }
done
node -e 'const fs=require("fs"); try { const u=new URL(fs.readFileSync(process.argv[1],"utf8").trim()); if(!["postgres:","postgresql:"].includes(u.protocol)||!u.hostname.endsWith(".neon.tech")||!u.hostname.includes("-pooler.")||u.searchParams.get("sslmode")!=="require") throw Error(); } catch { console.error("Expected a Neon pooled PostgreSQL URL with sslmode=require."); process.exit(2); }' "$database_file"
command -v flock >/dev/null || { printf 'Install util-linux (flock) before deploying.\n' >&2; exit 2; }
# Private stable keys survive relinking/redeploying and never enter the checkout.
state="$(dirname "$database_file")/deploy-state"
mkdir -p "$state"
chmod 700 "$state"
exec 9>"$state/lock"
flock -n 9 || { printf 'Another deployment is running.\n' >&2; exit 1; }
log="$state/last-run.log"
: >"$log"
step='initialization'
trap 'printf "Deployment stopped during: %s. Private redacted diagnostics: %s (review before sharing; do not commit). Rerun with the same state directory.\n" "$step" "$log" >&3' ERR
vc() {
  # Token is deliberately read from a file; never enable shell tracing.
  # --scope is optional, non-secret, and disambiguates a team-owned project.
  local scope_args=()
  if [[ -n ${VERCEL_SCOPE:-} ]]; then scope_args=(--scope "$VERCEL_SCOPE"); fi
  npx --yes vercel@65.14.0 "$@" --token "$(cat "$token_file")" "${scope_args[@]}"
}
put_env() {
  vc env add "$1" --environment production --force --yes --sensitive <"$2" >&4 2>&1
}
step='generating stable secrets'
for name in BETTER_AUTH_SECRET OAUTH_STATE_SECRET A2A_SECRET WORKSPACE_SECRETS_ENCRYPTION_KEY CRON_SECRET; do
  if [[ ! -e "$state/$name" ]]; then
    openssl rand -hex 32 >"$state/$name"
  fi
  [[ -s "$state/$name" ]] || { printf 'Stored secret file is empty; refusing rotation.\n' >&2; exit 1; }
  chmod 600 "$state/$name"
done
# Redact supplied/generated values and DB password even if a provider echoes
# them in an error. Never send raw command output to the persistent log.
exec 4> >(node scripts/redact-deploy-log.mjs "$database_file" "$token_file" "$state" >>"$log")
step='linking/creating Vercel project strip'
# A failed inspection may mean not found OR access/network failure. Creation
# must succeed before linking; never deploy to an unintended default project.
if ! vc project inspect strip --json >/dev/null 2>&4; then
  vc project create strip >&4 2>&1
fi
vc link --project strip --yes >&4 2>&1
node -e 'const p=JSON.parse(require("fs").readFileSync(".vercel/project.json")); if(p.projectName!=="strip") throw Error("Unexpected linked project; refusing deployment")' >&4 2>&1
step='saving production environment'
put_env DATABASE_URL "$database_file"
for name in BETTER_AUTH_SECRET OAUTH_STATE_SECRET A2A_SECRET WORKSPACE_SECRETS_ENCRYPTION_KEY CRON_SECRET; do
  put_env "$name" "$state/$name"
done
if [[ -s "$state/canonical-url" ]]; then
  put_env APP_URL "$state/canonical-url"
  put_env BETTER_AUTH_URL "$state/canonical-url"
fi
step='isolated Neon migrations and Vercel build'
bash scripts/build-vercel.sh --migrate "$database_file" >&4 2>&1
step='first production upload'
vc deploy --prebuilt --prod --yes >"$state/deployment-url" 2>&4
deployment=$(node -e 'const raw=require("fs").readFileSync(process.argv[1],"utf8").trim(); let s=raw; if(raw.startsWith("{")) { const d=JSON.parse(raw); s=d.deployment?.url; if(s&&!s.startsWith("https://")) s="https://"+s; } if(!/^https:\/\/[a-z0-9.-]+\.vercel\.app$/.test(s)) throw Error("Expected Vercel deployment URL"); process.stdout.write(s)' "$state/deployment-url" 2>&4)
step='discovering stable production alias'
vc inspect "$deployment" --json >"$state/deployment.json" 2>&4
node --input-type=module - "$state/deployment.json" "$state/canonical-url.next" <<'NODE' 2>&4
import fs from 'node:fs';
const d = JSON.parse(fs.readFileSync(process.argv[2], 'utf8'));
const aliases = d.alias ?? d.aliases ?? [];
const hosts = aliases.map(a => typeof a === 'string' ? a : a.alias)
  .map(a => a?.replace(/^https:\/\//, ''))
  .filter(a => /^[a-z0-9.-]+\.vercel\.app$/.test(a) && !a.includes('-git-'))
  .sort((a,b) => a.length-b.length);
if (!hosts.length) throw Error('No stable vercel.app production alias found; inspect alias assignment in Vercel before retrying.');
fs.writeFileSync(process.argv[3], `https://${hosts[0]}`);
NODE
if ! cmp -s "$state/canonical-url.next" "$state/canonical-url"; then
  mv "$state/canonical-url.next" "$state/canonical-url"
  step='pinning public OAuth origin and redeploying'
  put_env APP_URL "$state/canonical-url"
  put_env BETTER_AUTH_URL "$state/canonical-url"
  # Runtime env is attached on upload; the prebuilt server reads these at runtime.
  vc deploy --prebuilt --prod --yes --force >"$state/deployment-url" 2>&4
fi
printf 'Production URL: %s\n' "$(<"$state/canonical-url")"
printf 'Run docs/DEPLOY.md smoke checks before sharing. Keep deploy-state secrets backed up privately.\n'
