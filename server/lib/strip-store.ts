import { randomUUID } from "node:crypto";

import { fail, type ActionRunContext } from "@agent-native/core/action";
import { and, desc, eq, isNull } from "drizzle-orm";

import { changedSummary } from "../../shared/history.js";
import {
  StripError,
  stripSchema,
  type Actor,
  type Draft,
  type Strip,
} from "../../shared/strip.js";
import { getDb } from "../db/index.js";
import { strips } from "../db/schema.js";

export function owner(ctx?: ActionRunContext) {
  if (!ctx?.userEmail)
    fail("Sign in to work on a strip.", {
      statusCode: 401,
      errorCode: "sign_in_required",
    });
  return ctx!.userEmail!;
}
export function callerActor(ctx?: ActionRunContext): Actor {
  // The server dispatcher sets caller; there is deliberately no actor/force input.
  return ctx?.caller === "frontend" &&
    !ctx.automation &&
    !ctx.networkProtocol &&
    !ctx.mcpDirectoryWidgetWrite &&
    !ctx.mcpDirectoryWidgetReadOnly
    ? "human"
    : "agent";
}
export function revisionWho(
  ctx?: ActionRunContext,
): "human" | "agent" | "external-agent" {
  return callerActor(ctx) === "human"
    ? "human"
    : ctx?.caller === "mcp" ||
        ctx?.networkProtocol === "mcp" ||
        ctx?.caller === "webmcp" ||
        ctx?.caller === "a2a"
      ? "external-agent"
      : "agent";
}
function scope(id: string, ctx?: ActionRunContext) {
  return and(
    eq(strips.id, id),
    eq(strips.ownerEmail, owner(ctx)),
    ctx?.orgId ? eq(strips.orgId, ctx.orgId) : isNull(strips.orgId),
  );
}
export async function listStrips(ctx?: ActionRunContext): Promise<Strip[]> {
  const rows = await getDb()
    .select({ scene: strips.scene })
    .from(strips)
    .where(
      and(
        eq(strips.ownerEmail, owner(ctx)),
        ctx?.orgId ? eq(strips.orgId, ctx.orgId) : isNull(strips.orgId),
      ),
    )
    .orderBy(desc(strips.updatedAt));
  return rows.map((row) => stripSchema.parse(row.scene));
}
export async function getStrip(
  id: string,
  ctx?: ActionRunContext,
): Promise<Strip> {
  const [row] = await getDb()
    .select({ scene: strips.scene })
    .from(strips)
    .where(scope(id, ctx))
    .limit(1);
  if (!row)
    fail("Strip not found in your workspace.", {
      statusCode: 404,
      errorCode: "not_found",
    });
  return stripSchema.parse(row!.scene);
}
export async function createStrip(
  draft: Draft,
  ctx?: ActionRunContext,
): Promise<Strip> {
  const actor = callerActor(ctx);
  const scene: Strip = {
    id: randomUUID(),
    revision: 0,
    draft,
    protectedIds: [],
    origin:
      actor === "agent"
        ? "agent-draft"
        : draft.inputKind === "illustrative"
          ? "prepared-example"
          : "human-authored",
    lastEditedBy: actor,
    ...(actor === "agent"
      ? {
          pencils: Object.fromEntries(
            draft.panels
              .flatMap((panel) => [
                panel.id,
                ...panel.actors.map((a) => a.id),
                ...panel.balloons.map((b) => b.id),
              ])
              .map((targetId) => [
                `draft:${targetId}`,
                { targetId, before: null },
              ]),
          ),
        }
      : {}),
    updatedAt: new Date().toISOString(),
  };
  scene.history = [
    {
      revision: 0,
      draft: structuredClone(draft),
      who: revisionWho(ctx),
      summary: "Created strip",
      at: scene.updatedAt,
    },
  ];
  await getDb()
    .insert(strips)
    .values({
      id: scene.id,
      ownerEmail: owner(ctx),
      orgId: ctx?.orgId ?? null,
      scene,
    });
  return getStrip(scene.id, ctx);
}
export async function saveStrip(
  previous: Strip,
  next: Strip,
  ctx?: ActionRunContext,
  summary?: string,
): Promise<Strip> {
  // Snapshots and scene share the same compare-and-swap statement: no orphan history on conflict.
  next = {
    ...next,
    history: [
      ...(previous.history ?? [
        {
          revision: previous.revision,
          draft: structuredClone(previous.draft),
          who: previous.lastEditedBy,
          summary: "First retained revision (older history unavailable)",
          at: previous.updatedAt,
        },
      ]),
      {
        revision: next.revision,
        draft: structuredClone(next.draft),
        who: revisionWho(ctx),
        summary: summary ?? changedSummary(previous, next),
        at: next.updatedAt,
      },
    ],
  };
  const changed = await getDb()
    .update(strips)
    .set({ scene: next, revision: next.revision, updatedAt: new Date() })
    .where(and(scope(previous.id, ctx), eq(strips.revision, previous.revision)))
    .returning({ id: strips.id });
  if (changed.length !== 1)
    fail(
      "A newer edit arrived while this change was being saved. Read the strip and try again.",
      { statusCode: 409, errorCode: "stale_revision" },
    );
  return getStrip(previous.id, ctx);
}
export function domainError(error: unknown): never {
  if (error instanceof StripError)
    fail(error.message, {
      errorCode: error.code,
      statusCode:
        error.code === "stale_revision"
          ? 409
          : error.code === "human_only"
            ? 403
            : 400,
    });
  throw error;
}
