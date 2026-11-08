import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@agent-native/core/client/agent-chat", () => ({
  listAgentChatContext: vi.fn(() => [
    {
      key: "agent-chat-prefill-context:thread-1",
      title: "Cast & source type",
      context: "cast",
    },
    {
      key: "agent-select:comic-object:line-1",
      title: "Current line",
      context: "selection",
    },
  ]),
  removeAgentChatContextItem: vi.fn(),
  sendToAgentChat: vi.fn(),
}));
import {
  removeAgentChatContextItem,
  sendToAgentChat,
} from "@agent-native/core/client/agent-chat";

import { clearStripHandoff, stripHandoffTarget } from "./strip-agent-context";

describe("Strip's setup-only handoff lifecycle", () => {
  beforeEach(() => vi.clearAllMocks());
  it("distinguishes compose, strips, and selections", () => {
    expect(stripHandoffTarget("", "p1")).toBe("compose");
    expect(stripHandoffTarget("a", "p1")).not.toBe(
      stripHandoffTarget("b", "p1"),
    );
    expect(stripHandoffTarget("a", "p1")).not.toBe(
      stripHandoffTarget("a", "p2"),
    );
  });
  it("leaves an unchanged target or unrelated user draft alone", () => {
    expect(clearStripHandoff(undefined, "studio:a:p1")).toBe(false);
    expect(clearStripHandoff("studio:a:p1", "studio:a:p1")).toBe(false);
    expect(sendToAgentChat).not.toHaveBeenCalled();
    expect(removeAgentChatContextItem).not.toHaveBeenCalled();
  });
  it.each([
    ["compose", "studio:a:p1"],
    ["studio:a:p1", "studio:a:p2"],
    ["studio:a:p1", "studio:b:p1"],
  ])("clears stale %s when navigating to %s without submitting", (from, to) => {
    expect(clearStripHandoff(from, to)).toBe(true);
    expect(removeAgentChatContextItem).toHaveBeenCalledExactlyOnceWith(
      "agent-chat-prefill-context:thread-1",
    );
    expect(sendToAgentChat).toHaveBeenCalledExactlyOnceWith({
      message: " ",
      submit: false,
      openSidebar: false,
    });
  });
});
