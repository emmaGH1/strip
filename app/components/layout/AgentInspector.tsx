import {
  navigateWithAgentChatViewTransition,
  requestAgentSidebarOpen,
} from "@agent-native/core/client/agent-chat";
import { focusAgentChat } from "@agent-native/toolkit/app/chat";
import { AgentSidebar } from "@agent-native/toolkit/app/chat";
import { useEffect, type ReactNode } from "react";
import { useLocation, useNavigate } from "react-router";

import { ChatComposerContextProvider } from "@/components/ChatComposerContext";
import { chatThreadPath } from "@/lib/chat-paths";
import { TAB_ID } from "@/lib/tab-id";

interface AgentInspectorProps {
  children: ReactNode;
  chatHomeHandoffActive: boolean;
  chatHomeHandoffPending: boolean;
}

/** Contextual inspector shell used on secondary chat routes. */
export function AgentInspector({
  children,
  chatHomeHandoffActive,
  chatHomeHandoffPending,
}: AgentInspectorProps) {
  const navigate = useNavigate();
  const { pathname, search } = useLocation();
  const editing = pathname === "/home" && new URLSearchParams(search).has("id");
  useEffect(() => {
    if (editing && window.matchMedia("(min-width: 1024px)").matches)
      requestAgentSidebarOpen();
  }, [editing]);

  function openAskAgentFullscreen(threadId?: string) {
    focusAgentChat();
    navigateWithAgentChatViewTransition(navigate, chatThreadPath(threadId));
  }

  return (
    <AgentSidebar
      composerContextProvider={ChatComposerContextProvider}
      position="right"
      defaultSidebarWidth={320}
      chatViewTransition
      chatViewTransitionHandoff={chatHomeHandoffPending}
      storageKey="chat"
      browserTabId={TAB_ID}
      openOnChatRunning={chatHomeHandoffActive}
      onFullscreenRequest={openAskAgentFullscreen}
      emptyStateText="The agent’s desk. A little back-and-forth makes it yours."
      agentPageHref="/settings/agent"
      suggestions={[
        "Help me sharpen this strip",
        "Make the selected panel funnier",
        "What can we change without touching MINE?",
      ]}
    >
      {children}
    </AgentSidebar>
  );
}
