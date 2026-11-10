#!/usr/bin/env bash
# Build without reading local .env files or touching Docker's .output/dist.
set +x
set -euo pipefail
cd "$(dirname "$0")/.."
if [[ $# != 0 && ( $# != 2 || $1 != --migrate ) ]]; then
  printf 'Usage: bash scripts/build-vercel.sh [--migrate DATABASE_URL_FILE]\n' >&2
  exit 2
fi
database_file=''
if [[ $# == 2 ]]; then database_file=$(realpath "$2"); fi
node -e 'const [a,b]=process.versions.node.split(".").map(Number); if(a!==22 || b<22) throw Error("Use Node 22.22+")'
stage=$(mktemp -d "${TMPDIR:-/tmp}/strip-vercel-build.XXXXXXXX")
trap 'rm -rf "$stage"' EXIT
# Only non-ignored source; never copy local credentials, databases or outputs.
git ls-files -z --cached --others --exclude-standard |
  tar --exclude='.env*' --exclude='*/.env*' --null -T - -cf - |
  tar -xf - -C "$stage"
ln -s "$PWD/node_modules" "$stage/node_modules"
(
  cd "$stage"
  if [[ -n "$database_file" ]]; then
    # A clean environment and no .env prevent a local/per-app DB override from
    # sending release migrations to Docker instead of the supplied Neon DB.
    env -i PATH="$PATH" HOME="$HOME" NODE_ENV=production \
      DATABASE_URL="$(<"$database_file")" pnpm migrate:production
  fi
  # Daily sweep is compatible with Hobby. Strip does not promise automations.
  AGENT_NATIVE_VERCEL_CRON_SCHEDULE='0 9 * * *' NITRO_PRESET=vercel pnpm build
)
test -f "$stage/.vercel/output/config.json"
node scripts/verify-vercel-function.mjs \
  "$stage/.vercel/output/functions/__server.func/.vc-config.json"
mkdir -p .vercel
rm -rf .vercel/output
cp -a "$stage/.vercel/output" .vercel/output
printf 'Vercel Build Output API artifacts: .vercel/output (Docker output unchanged)\n'
