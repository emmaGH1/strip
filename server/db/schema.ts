import { integer, jsonb, pgTable, text, timestamp } from "drizzle-orm/pg-core";

import type { Strip } from "../../shared/strip.js";

export const strips = pgTable("strip_comics", {
  id: text("id").primaryKey(),
  ownerEmail: text("owner_email").notNull(),
  orgId: text("org_id"),
  revision: integer("revision").notNull().default(0),
  scene: jsonb("scene").$type<Strip>().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});
