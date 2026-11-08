# Agent-Native primitives

Documentation-derived opportunities, not tested integration claims. Sources read during ideation; APIs must be pinned/proven before implementation.

- Semantic selection context: the agent knows the selected record or canvas object, not just the chat transcript. Source: https://www.agent-native.com/docs/context-awareness/
- Shared typed actions: direct manipulation and agent tool calls execute the same validated capability. Source: https://www.agent-native.com/docs/client-data/
- Conditional per-call human approval: pause a consequential action for approval of its exact arguments. Source: https://www.agent-native.com/docs/actions-access-control/
- Agent-readable anchored review threads: pin feedback to a domain object and route a root thread to the agent. Source: https://www.agent-native.com/docs/toolkit-comments-review/
- Consumption is not resolution: agent feedback can be consumed without closing the human-visible review thread. Source: https://www.agent-native.com/docs/toolkit-comments-review/
- Resource snapshots and restore actions: app-owned JSON versions with human-versus-agent attribution; restore is a new action. Source: https://www.agent-native.com/docs/toolkit-history/
- Scoped local undo: CRDT or inverse-operation undo need not erase other people's changes. Source: https://www.agent-native.com/docs/toolkit-history/
- Automatic action audit trail: mutating actions record actor, calling surface, and agent thread/turn. Source: https://www.agent-native.com/docs/actions-access-control/
- Explicit live-sync opt-in: shared actions and agent edits update the UI, with optional remote-change sync. Source: https://www.agent-native.com/docs/client-data/
- Durable resume journal: completed identical writes from prior interrupted chunks return journaled results, while unknown outcomes need verification. Source: https://www.agent-native.com/docs/durable-resume/
- Context X-Ray: show context segment provenance and token budget, with app-supplied manifest and pin/evict callbacks. Source: https://www.agent-native.com/docs/toolkit-context-knowledge/
- Browser recorder: a redacted two-minute action/state/error timeline that can be explicitly attached to a report or Clips recording. Source: https://www.agent-native.com/docs/recorder/
- Action access policies shared across surfaces: the same resource permissions protect UI, agent, HTTP, MCP, A2A, and CLI calls. Source: https://www.agent-native.com/docs/actions-access-control/
- Opt-in public agent tools: explicitly expose only safe chosen actions to public agent surfaces rather than exposing an entire app. Source: https://www.agent-native.com/docs/actions-access-control/
