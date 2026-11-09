import { runMigrations } from "@agent-native/core/db";

export default runMigrations(
  [
    {
      version: 1,
      name: "strip-comics-initial-v1",
      sql: `CREATE TABLE IF NOT EXISTS strip_comics (
      id TEXT PRIMARY KEY,
      owner_email TEXT NOT NULL,
      org_id TEXT,
      revision INTEGER NOT NULL DEFAULT 0,
      scene JSONB NOT NULL,
      updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
    CREATE INDEX IF NOT EXISTS strip_comics_owner_idx ON strip_comics(owner_email, org_id);`,
    },
    {
      version: 2,
      name: "strip-angle-plans-v2",
      sql: `CREATE TABLE IF NOT EXISTS strip_angle_plans (
        id TEXT PRIMARY KEY, owner_email TEXT NOT NULL, org_id TEXT,
        revision INTEGER NOT NULL DEFAULT 0, plan JSONB NOT NULL
      ); CREATE INDEX IF NOT EXISTS strip_angle_plans_owner_idx ON strip_angle_plans(owner_email, org_id);`,
    },
  ],
  { table: "strip_app_migrations" },
);
