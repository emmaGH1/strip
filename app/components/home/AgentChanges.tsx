import {
  useActionMutation,
  useActionQuery,
  actionErrorCode,
  actionErrorMessage,
} from "@agent-native/core/client/hooks";
import { useState } from "react";
import { useSearchParams } from "react-router";

import { HistoryList } from "@/components/home/HistoryList";
import { Button } from "@/components/ui/button";

export function AgentChanges() {
  const [params, setParams] = useSearchParams();
  const id = params.get("id") ?? "";
  const [error, setError] = useState("");
  const [historyOpen, setHistoryOpen] = useState(false);
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
        actionErrorCode(e) === "stale_revision"
          ? "This strip changed elsewhere — showing the latest"
          : (actionErrorMessage(e) ??
              "Could not save. Reloading the latest strip."),
      );
      await query.refetch();
    }
  }
  return (
    <section className="agent-change-log" aria-label="Agent changes">
      <div className="desk-log-tabs" role="group" aria-label="Desk views">
        <Button
          variant={historyOpen ? "ghost" : "secondary"}
          size="sm"
          onClick={() => setHistoryOpen(false)}
        >
          Agent changes · {pencils.length}
        </Button>
        <Button
          variant={historyOpen ? "secondary" : "ghost"}
          size="sm"
          onClick={() => setHistoryOpen(true)}
        >
          History
        </Button>
      </div>
      {strip.agentRejection && (
        <p className="kept-mine" role="status">
          Kept your line — the agent tried to change a MINE item
        </p>
      )}
      {historyOpen ? (
        <HistoryList id={id} />
      ) : pencils.length ? (
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
                  {panel
                    ? `P${strip.draft.panels.indexOf(panel) + 1}`
                    : "Story"}{" "}
                  · {label}
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
