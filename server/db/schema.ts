import { integer, jsonb, pgTable, text, timestamp } from "drizzle-orm/pg-core";

import type { AnglePlan } from "../../shared/angles.js";
import type { Strip } from "../../shared/strip.js";

export const stripPlans = pgTable("strip_angle_plans", {
  id: text("id").primaryKey(),
  ownerEmail: text("owner_email").notNull(),
  orgId: text("org_id"),
  revision: integer("revision").notNull().default(0),
  plan: jsonb("plan").$type<AnglePlan>().notNull(),
});

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
