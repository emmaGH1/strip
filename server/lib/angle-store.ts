import { randomUUID } from "node:crypto";

import { fail, type ActionRunContext } from "@agent-native/core/action";
import { and, eq, isNull } from "drizzle-orm";
import type { z } from "zod";

import {
  anglePlanSchema,
  selectPlanAngle,
  type AnglePlan,
  type planEditSchema,
} from "../../shared/angles.js";
import { getDb } from "../db/index.js";
import { stripPlans } from "../db/schema.js";
import { owner } from "./strip-store.js";
function scope(id: string, ctx?: ActionRunContext) {
  return and(
    eq(stripPlans.id, id),
    eq(stripPlans.ownerEmail, owner(ctx)),
    ctx?.orgId ? eq(stripPlans.orgId, ctx.orgId) : isNull(stripPlans.orgId),
  );
}
export async function getPlan(
  id: string,
  ctx?: ActionRunContext,
  db = getDb(),
  lock = false,
): Promise<AnglePlan> {
  const query = db
    .select({ plan: stripPlans.plan })
    .from(stripPlans)
    .where(scope(id, ctx))
    .limit(1);
  const [row] = await (lock ? query.for("share") : query);
  if (!row)
    fail("Angle plan not found in your workspace.", {
      statusCode: 404,
      errorCode: "not_found",
    });
  return anglePlanSchema.parse(row!.plan);
}
export async function proposeAngles(
  input: Omit<AnglePlan, "id" | "revision" | "selectedAngleId">,
  ctx?: ActionRunContext,
) {
  const plan = anglePlanSchema.parse({
    ...input,
    id: randomUUID(),
    revision: 0,
  });
  await getDb()
    .insert(stripPlans)
    .values({
      id: plan.id,
      ownerEmail: owner(ctx),
      orgId: ctx?.orgId ?? null,
      plan,
    });
  return getPlan(plan.id, ctx);
}
export async function chooseAngle(
  id: string,
  expected: number,
  edit: z.infer<typeof planEditSchema>,
  ctx?: ActionRunContext,
) {
  const current = await getPlan(id, ctx);
  if (current.revision !== expected)
    fail("This angle plan changed. Read it again before choosing.", {
      statusCode: 409,
      errorCode: "stale_revision",
    });
  if (!current.angles.some((a) => a.id === edit.angleId))
    fail("Choose an existing angle.", { errorCode: "not_found" });
  const next = selectPlanAngle(current, expected, edit);
  const rows = await getDb()
    .update(stripPlans)
    .set({ plan: next, revision: next.revision })
    .where(and(scope(id, ctx), eq(stripPlans.revision, expected)))
    .returning({ id: stripPlans.id });
  if (rows.length !== 1)
    fail("A newer angle choice arrived. Read the plan again.", {
      statusCode: 409,
      errorCode: "stale_revision",
    });
  return getPlan(id, ctx);
}
