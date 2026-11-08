import {
  listAgentChatContext,
  removeAgentChatContextItem,
  sendToAgentChat,
} from "@agent-native/core/client/agent-chat";

/** Clear only a Strip handoff when its target leaves, never submit a turn. */
export function clearStripHandoff(
  stagedTarget: string | undefined,
  currentTarget: string,
) {
  if (stagedTarget === undefined || stagedTarget === currentTarget)
    return false;
  // Framework handoffs are persisted with a thread suffix. Removing only the
  // unscoped base key leaves the actual chip behind in a mounted composer.
  for (const item of listAgentChatContext()) {
    if (
      item.key === "agent-chat-prefill-context" ||
      item.key.startsWith("agent-chat-prefill-context:")
    )
      removeAgentChatContextItem(item.key);
  }
  // The framework ignores an empty message. A whitespace prefill replaces the
  // old lettering with a visually empty draft through the normal composer path.
  sendToAgentChat({ message: " ", submit: false, openSidebar: false });
  return true;
}

export function stripHandoffTarget(id: string, selectedId: string) {
  return id ? `studio:${id}:${selectedId}` : "compose";
}
