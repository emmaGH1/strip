import {
  useActionMutation,
  useActionQuery,
} from "@agent-native/core/client/hooks";
import { PencilLine } from "lucide-react";
import { useState } from "react";
import { useSearchParams } from "react-router";

import { Button } from "@/components/ui/button";

export function AgentChanges() {
  const [params, setParams] = useSearchParams();
  const id = params.get("id") ?? "";
  const [error, setError] = useState("");
  const query = useActionQuery("get-strip", { id }, { enabled: Boolean(id) });
  const update = useActionMutation("update-strip");
  const strip = query.data;
  if (!strip) return null;
  const pencils = Object.entries(strip.pencils ?? {});
  async function review(key: string, decision: "ink" | "erase") {
    setError("");
    try {
      await update.mutateAsync({
        id,
        expectedRevision: strip!.revision,
        edits: [{ kind: "review", key, decision }],
      });
    } catch (e) {
      setError(
        e instanceof Error
          ? e.message
          : "Could not save. Reloading the latest strip.",
      );
      await query.refetch();
    }
  }
  return (
    <section className="agent-change-log" aria-label="Agent changes">
      <h2>
        <PencilLine size={15} /> Agent changes <span>{pencils.length}</span>
      </h2>
      {pencils.length ? (
        <div className="change-list">
          {pencils.map(([key, proposal]) => {
            const panel = strip.draft.panels.find(
              (p) =>
                p.id === proposal.targetId ||
                p.actors.some((a) => a.id === proposal.targetId) ||
                p.balloons.some((b) => b.id === proposal.targetId),
            );
            const balloon = panel?.balloons.find(
              (b) => b.id === proposal.targetId,
            );
            const label = balloon
              ? `“${balloon.text}”`
              : (proposal.before?.kind ?? "New draft");
            return (
              <div className="change-entry" key={key}>
                <button
                  title={label}
                  onClick={() =>
                    setParams(
                      { id, panel: panel?.id ?? "", object: proposal.targetId },
                      { replace: true },
                    )
                  }
                >
                  P{strip.draft.panels.indexOf(panel!) + 1} · {label}
                </button>
                <Button
                  size="sm"
                  disabled={update.isPending}
                  onClick={() => review(key, "ink")}
                >
                  Ink
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  disabled={update.isPending || !proposal.before}
                  title={
                    !proposal.before
                      ? "New draft item: no earlier value to restore"
                      : "Restore previous value"
                  }
                  onClick={() => review(key, "erase")}
                >
                  Erase
                </Button>
              </div>
            );
          })}
        </div>
      ) : (
        <p>No unreviewed changes. Your ink, your call.</p>
      )}
      {error && <p role="alert">{error}</p>}
    </section>
  );
}
