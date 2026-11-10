import {
  useActionMutation,
  useActionQuery,
  actionErrorCode,
  actionErrorMessage,
} from "@agent-native/core/client/hooks";
import { useState } from "react";

import { Button } from "@/components/ui/button";

/** Revision history with Restore, shared by the agent desk, the Studio History sheet and the phone tab. */
export function HistoryList({ id }: { id: string }) {
  const [error, setError] = useState("");
  const query = useActionQuery("get-strip", { id }, { enabled: Boolean(id) });
  const update = useActionMutation("update-strip");
  const strip = query.data;
  if (!strip) return null;
  return (
    <>
      <div className="history-list" aria-label="Revision history">
        {[...(strip.history ?? [])].reverse().map((entry) => (
          <div className="history-entry" key={entry.revision}>
            <div>
              <b>
                Rev {entry.revision} ·{" "}
                {entry.who === "human"
                  ? "You"
                  : entry.who === "external-agent"
                    ? "External agent"
                    : "Agent"}
              </b>
              <p>{entry.summary}</p>
              <time dateTime={entry.at}>
                {new Date(entry.at).toLocaleString()}
              </time>
            </div>
            <Button
              size="sm"
              variant="outline"
              disabled={update.isPending || entry.revision === strip.revision}
              onClick={async () => {
                setError("");
                try {
                  await update.mutateAsync({
                    id,
                    expectedRevision: strip.revision,
                    restoreRevision: entry.revision,
                  });
                } catch (e) {
                  setError(
                    actionErrorCode(e) === "stale_revision"
                      ? "This strip changed elsewhere — showing the latest"
                      : (actionErrorMessage(e) ?? "Restore failed. Reloading."),
                  );
                  await query.refetch();
                }
              }}
            >
              {entry.revision === strip.revision ? "Current" : "Restore"}
            </Button>
          </div>
        ))}
        {!strip.history?.length && (
          <p>
            Earlier revisions were not retained. The next save starts history.
          </p>
        )}
      </div>
      {error && <p role="alert">{error}</p>}
    </>
  );
}
