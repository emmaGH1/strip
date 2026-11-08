import {
  sendToAgentChat,
  requestAgentSidebarOpen,
  useAgentEngineConfigured,
  useAgentChatRunningThreads,
  getAgentChatSubmitTarget,
  AGENT_CHAT_SUBMIT_TARGET_EVENT,
} from "@agent-native/core/client/agent-chat";
import {
  useActionMutation,
  useActionQuery,
} from "@agent-native/core/client/hooks";
import { buildSettingsRoute } from "@agent-native/core/client/navigation";
import {
  selectAgentSelectable,
  useAgentSelectable,
  useAgentSelectableSource,
} from "@agent-native/toolkit/app/agent-select";
import { useQueryClient } from "@tanstack/react-query";
import {
  ArrowRight,
  ArrowDownToLine,
  Check,
  Copy,
  MessageSquare,
  PencilLine,
  Shield,
  Smile,
  PersonStanding,
  Eraser,
  Plus,
  LibraryBig,
  X,
} from "lucide-react";
import {
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type MouseEvent,
  type KeyboardEvent,
} from "react";
import { Link, useNavigate, useSearchParams } from "react-router";

import { Library } from "@/components/home/Library";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { exportPng, loadSceneAssets, textMeasurer } from "@/lib/strip-canvas";

import { preparedExamples } from "../../shared/examples";
import { renderStripSvg, type SceneAssets } from "../../shared/render-strip";
import {
  cast,
  expressionSchema,
  poseSchema,
  screenStateSchema,
  type Edit,
  type Strip,
} from "../../shared/strip";
import {
  cropPanel,
  draftRequest,
  selectionAnchor,
  sourceCoverage,
} from "../../shared/studio";

export function meta() {
  return [
    { title: "Strip — One update. Four panels." },
    {
      name: "description",
      content: "A four-panel comic, pencilled by your agent. Inked by you.",
    },
  ];
}
const errorMessage = (error: unknown) =>
  error instanceof Error
    ? error.message
    : "That change could not be saved. Try again.";
const sampleStrip = (): Strip => ({
  id: "unsaved-example",
  revision: 0,
  draft: preparedExamples[0]!,
  protectedIds: [],
  origin: "prepared-example",
  lastEditedBy: "human",
  updatedAt: "",
});

export default function Home() {
  const [params, setParams] = useSearchParams();
  const navigate = useNavigate();
  const engine = useAgentEngineConfigured();
  const id = params.get("id") ?? "";
  const [assets, setAssets] = useState<SceneAssets>();
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [exporting, setExporting] = useState(false);
  const [source, setSource] = useState("");
  const [illustrative, setIllustrative] = useState(false);
  const [castDraft, setCastDraft] = useState({
    ari: { name: cast.ari.name as string, role: cast.ari.role as string },
    sam: { name: cast.sam.name as string, role: cast.sam.role as string },
  });
  const [askText, setAskText] = useState("");
  const [askOpen, setAskOpen] = useState(false);
  const [phoneAskOpen, setPhoneAskOpen] = useState(false);
  const [phoneFocus, setPhoneFocus] = useState(false);
  const [anchor, setAnchor] = useState({ left: 200, top: 100, flip: true });
  const [editing, setEditing] = useState(false);
  const [line, setLine] = useState("");
  const [phoneTab, setPhoneTab] = useState("edit");
  const [agentRequest, setAgentRequest] = useState<{
    submitId: string;
    stripId: string;
    panelId: string;
    threadId?: string;
  }>();
  const { workingThreadIds } = useAgentChatRunningThreads();
  const drafting =
    !id &&
    agentRequest?.stripId === "" &&
    Boolean(
      agentRequest.threadId && workingThreadIds.has(agentRequest.threadId),
    );
  const workingPanelId =
    agentRequest?.stripId === id &&
    agentRequest.threadId &&
    workingThreadIds.has(agentRequest.threadId)
      ? agentRequest.panelId
      : undefined;
  useEffect(() => {
    if (!agentRequest) return;
    const resolve = () => {
      const target = getAgentChatSubmitTarget(agentRequest.submitId);
      if (target?.threadId)
        setAgentRequest((current) =>
          current?.submitId === agentRequest.submitId
            ? { ...current, threadId: target.threadId! }
            : current,
        );
    };
    resolve();
    window.addEventListener(AGENT_CHAT_SUBMIT_TARGET_EVENT, resolve);
    return () =>
      window.removeEventListener(AGENT_CHAT_SUBMIT_TARGET_EVENT, resolve);
  }, [agentRequest?.submitId]);
  const canvasRef = useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();
  async function observeScene(scene: Strip) {
    const queryKey = ["action", "get-strip", { id: scene.id }];
    await queryClient.cancelQueries({ queryKey, exact: true });
    queryClient.setQueryData<Strip>(queryKey, (current) =>
      current && current.revision > scene.revision ? current : scene,
    );
  }
  const create = useActionMutation("create-strip");
  const update = useActionMutation("update-strip", { onSuccess: observeScene });
  const protect = useActionMutation("set-strip-protection", {
    onSuccess: observeScene,
  });
  const query = useActionQuery("get-strip", { id }, { enabled: Boolean(id) });
  const strip = query.data ?? sampleStrip();
  const isSaved = Boolean(id && query.data);
  const selectedId =
    params.get("object") ?? params.get("panel") ?? strip.draft.panels[0]!.id;
  const selectedPanel =
    strip.draft.panels.find(
      (p) =>
        p.id === selectedId ||
        p.actors.some((a) => a.id === selectedId) ||
        p.balloons.some((b) => b.id === selectedId),
    ) ?? strip.draft.panels[0]!;
  const selectedBalloon = selectedPanel.balloons.find(
    (b) => b.id === selectedId,
  );
  const selectedActor = selectedPanel.actors.find((a) => a.id === selectedId);
  const directProtection = strip.protectedIds.includes(selectedId);
  const inheritedProtection =
    selectedId !== selectedPanel.id &&
    strip.protectedIds.includes(selectedPanel.id);
  const busy = create.isPending || update.isPending || protect.isPending;
  const measure = useMemo(
    () =>
      typeof document !== "undefined" && assets ? textMeasurer() : undefined,
    [assets],
  );
  const rendered = useMemo(
    () =>
      assets && measure
        ? renderStripSvg(
            strip,
            assets,
            measure,
            isSaved ? selectedId : undefined,
            workingPanelId,
          )
        : undefined,
    [strip, assets, measure, selectedId, isSaved, workingPanelId],
  );
  const endings = useMemo(
    () =>
      assets && measure
        ? strip.draft.endings.map((text) => {
            const preview = structuredClone(strip);
            preview.draft.panels[3]!.balloons.slice(-1)[0]!.text = text;
            // Same renderer, cropped to the actual alternative fourth panel.
            return cropPanel(renderStripSvg(preview, assets, measure).svg, 3);
          })
        : [],
    [strip, assets, measure],
  );
  const panelNumber = strip.draft.panels.indexOf(selectedPanel) + 1;
  const selectionLabel = selectedBalloon
    ? `${(strip.draft.cast ?? cast)[selectedBalloon.speaker].name}'s line`
    : selectedActor
      ? (strip.draft.cast ?? cast)[selectedActor.character].name
      : `Panel ${panelNumber}`;
  const pencils = Object.entries(strip.pencils ?? {});
  const coverage = sourceCoverage(strip.draft);
  const people = strip.draft.cast ?? cast;
  const focusedSvg = rendered ? cropPanel(rendered.svg, panelNumber - 1) : "";
  useLayoutEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !isSaved) return;
    const position = () => {
      const element = Array.from(
        canvas.querySelectorAll<SVGGraphicsElement>("[data-object]"),
      ).find((el) => el.getAttribute("data-object") === selectedId);
      if (!element) return;
      const rect = element.getBoundingClientRect();
      const page = canvas.getBoundingClientRect();
      setAnchor(
        selectionAnchor(
          {
            x: rect.x - page.x,
            y: rect.y - page.y,
            width: rect.width,
            height: rect.height,
          },
          page.width,
        ),
      );
    };
    position();
    const observer = new ResizeObserver(position);
    observer.observe(canvas);
    return () => observer.disconnect();
  }, [selectedId, rendered?.svg, isSaved]);
  useEffect(() => {
    loadSceneAssets()
      .then(setAssets)
      .catch((e) => setError(errorMessage(e)));
  }, []);
  useEffect(() => {
    setEditing(false);
    setLine(selectedBalloon?.text ?? "");
  }, [selectedId, selectedBalloon?.text]);
  useAgentSelectable(
    isSaved
      ? {
          kind: "comic",
          id: strip.id,
          title: strip.draft.title,
          getContext: () =>
            `Strip ${strip.id}, revision ${strip.revision}. Read get-strip then update-strip.`,
          getElement: () => canvasRef.current,
        }
      : null,
  );
  useAgentSelectableSource(
    isSaved
      ? (target) => {
          const element = target.closest("[data-object]");
          if (!element || !canvasRef.current?.contains(element)) return null;
          const objectId = element.getAttribute("data-object")!;
          return {
            kind: "comic-object",
            id: objectId,
            title: `Comic object: ${objectId}`,
            getContext: () =>
              `Object ${objectId} in strip ${strip.id}. Read current revision; use focused update-strip.`,
            getElement: () =>
              Array.from(
                canvasRef.current?.querySelectorAll("[data-object]") ?? [],
              ).find((el) => el.getAttribute("data-object") === objectId) ??
              null,
            parent: { kind: "comic", id: strip.id },
          };
        }
      : null,
  );
  function select(objectId: string) {
    const panel = strip.draft.panels.find(
      (p) =>
        p.id === objectId ||
        p.balloons.some((b) => b.id === objectId) ||
        p.actors.some((a) => a.id === objectId),
    );
    if (!panel || !isSaved) return;
    setParams(
      { id: strip.id, panel: panel.id, object: objectId },
      { replace: true },
    );
    selectAgentSelectable(
      {
        kind: "comic-object",
        id: objectId,
        title: `Panel ${strip.draft.panels.indexOf(panel) + 1}: ${objectId}`,
        getContext: () =>
          `Selected ${objectId}, panel ${panel.id}, strip ${strip.id}. Read get-strip and update only this selection.`,
      },
      { exclusive: true, openSidebar: false, focus: false },
    );
  }
  function canvasClick(
    e: MouseEvent<HTMLDivElement> | KeyboardEvent<HTMLDivElement>,
  ) {
    if ("key" in e && !["Enter", " "].includes(e.key)) return;
    const objectId = (e.target as Element)
      .closest("[data-object]")
      ?.getAttribute("data-object");
    if (objectId) {
      e.preventDefault();
      select(objectId);
      if (window.matchMedia("(max-width: 700px)").matches) setPhoneFocus(true);
    }
  }
  async function edit(edits: Edit[]) {
    setError("");
    setNotice("");
    try {
      await update.mutateAsync({
        id: strip.id,
        expectedRevision: strip.revision,
        edits,
      });
      setNotice("Saved in ink.");
    } catch (e) {
      setError(errorMessage(e));
      await query.refetch();
      throw e;
    }
  }
  function safeEdit(edits: Edit[]) {
    void edit(edits).catch(() => {});
  }
  async function openExample() {
    setError("");
    try {
      const result = await create.mutateAsync(preparedExamples[0]!);
      navigate(`/home?id=${result.id}`);
    } catch (e) {
      setError(errorMessage(e));
    }
  }
  function askAgent(request: string) {
    setPhoneTab("agent");
    const submitId = crypto.randomUUID();
    if (engine.canChat)
      setAgentRequest({
        submitId,
        stripId: isSaved ? strip.id : "",
        panelId: isSaved ? selectedPanel.id : "",
      });
    sendToAgentChat({
      submitMessageId: submitId,
      message: request,
      context: isSaved
        ? JSON.stringify({
            stripId: strip.id,
            selectedId,
            panelId: selectedPanel.id,
            expectedRevision: strip.revision,
          })
        : "New strip",
      openSidebar: true,
      submit: engine.canChat,
    });
  }
  function revise(
    instruction = "Make this selection clearer and more charming.",
  ) {
    askAgent(
      `${instruction} Selected ${selectionLabel}: ${selectedId}, strip ${strip.id}. Read get-strip for the current revision, preserve protected contributions and use focused update-strip edits. Do not replace the comic.`,
    );
  }
  async function toggleProtection() {
    setError("");
    try {
      await protect.mutateAsync({
        id: strip.id,
        expectedRevision: strip.revision,
        targetId: selectedId,
        protected: !directProtection,
      });
      setNotice(
        directProtection
          ? "Back on the drawing board. Protection removed."
          : "Stamped MINE. The agent cannot change this.",
      );
    } catch (e) {
      setError(errorMessage(e));
      await query.refetch();
    }
  }
  async function download() {
    if (!assets || !measure) return;
    setExporting(true);
    setError("");
    try {
      const output = renderStripSvg(strip, assets, measure);
      if (output.overflow.length)
        throw new Error(
          "Some text does not fit. Shorten the highlighted lines before exporting.",
        );
      const blob = await exportPng(output.svg);
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "strip-comic.png";
      link.click();
      setTimeout(() => URL.revokeObjectURL(url), 60000);
      setNotice("Your 1200 × 1200 PNG is ready.");
    } catch (e) {
      setError(errorMessage(e));
    } finally {
      setExporting(false);
    }
  }
  async function copyCaption() {
    try {
      await navigator.clipboard.writeText(
        `${strip.draft.title}\n\n${strip.draft.source}${strip.draft.sourceUrl ? `\n${strip.draft.sourceUrl}` : ""}\n\n${strip.draft.inputKind === "illustrative" ? "Illustrative product update. " : ""}Fictional dialogue. Made with Strip.`,
      );
      setNotice("Post caption copied.");
    } catch {
      setError("Clipboard unavailable. Allow clipboard access and try again.");
    }
  }
  const script = (
    <section className="script-content">
      <div className="rail-heading">
        <span>Script</span>
        <PencilLine size={18} />
      </div>
      <p className="eyebrow">THE SOURCE UPDATE</p>
      <p className="source-quote">{strip.draft.source}</p>
      {strip.draft.sourceUrl && (
        <a href={strip.draft.sourceUrl} target="_blank" rel="noreferrer">
          Read source ↗
        </a>
      )}
      <span className="source-kind">
        {strip.draft.inputKind === "illustrative"
          ? "Illustrative / seeded"
          : "Your source"}
      </span>
      <div className="rail-rule" />
      <p className="eyebrow">FACTS → PANELS</p>
      <ol className="claims-list">
        {coverage.facts.map((fact) => (
          <li key={fact.quote}>
            <p>{fact.quote}</p>
            <div className="fact-panels">
              {fact.panels.map((number) => (
                <button
                  key={number}
                  onClick={() => select(strip.draft.panels[number - 1]!.id)}
                  className="panel-number"
                >
                  Panel {number}
                </button>
              ))}
            </div>
          </li>
        ))}
      </ol>
      {coverage.fictional.length > 0 && (
        <p className="fiction-note">
          Panels {coverage.fictional.join(", ")} are fictional set-up.
        </p>
      )}
      <div className="rail-rule" />
      <p className="eyebrow">THE CAST</p>
      {Object.entries(people).map(([key, person]) => (
        <div className="cast-person" key={key}>
          <img src={`/peeps/${key}-happy-standing.svg`} alt="" />
          <div>
            <b>{person.name}</b>
            <p>{person.role}</p>
          </div>
        </div>
      ))}
      <p className="rail-footnote">
        Facts stay in the script.
        <br />
        The characters get to be fictional.
      </p>
    </section>
  );
  const contextBar = (phone = false) => (
    <div className="context-bar" aria-label="Selection actions">
      <span className="selection-label">{selectionLabel}</span>
      <Button
        variant="ghost"
        size="sm"
        disabled={!selectedBalloon || busy}
        onClick={() => {
          setEditing(!editing);
          setPhoneTab("edit");
        }}
      >
        <PencilLine size={16} />
        Edit
      </Button>
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="ghost" size="sm" disabled={!selectedActor || busy}>
            <Smile size={16} />
            Face
          </Button>
        </PopoverTrigger>
        <PopoverContent>
          <p className="eyebrow">EXPRESSION</p>
          <div className="option-list">
            {expressionSchema.options.map((expression) => (
              <Button
                key={expression}
                variant={
                  selectedActor?.expression === expression
                    ? "secondary"
                    : "ghost"
                }
                onClick={() =>
                  safeEdit([{ kind: "expression", id: selectedId, expression }])
                }
              >
                {expression}
              </Button>
            ))}
          </div>
        </PopoverContent>
      </Popover>
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="ghost" size="sm" disabled={!selectedActor || busy}>
            <PersonStanding size={16} />
            Pose
          </Button>
        </PopoverTrigger>
        <PopoverContent>
          <p className="eyebrow">BODY LANGUAGE</p>
          <div className="option-list">
            {poseSchema.options.map((pose) => (
              <Button
                key={pose}
                variant={selectedActor?.pose === pose ? "secondary" : "ghost"}
                onClick={() =>
                  safeEdit([{ kind: "pose", id: selectedId, pose }])
                }
              >
                {pose}
              </Button>
            ))}
          </div>
        </PopoverContent>
      </Popover>
      <Button
        variant="ghost"
        size="sm"
        disabled={busy || inheritedProtection}
        onClick={toggleProtection}
      >
        <Shield size={16} />
        {directProtection ? "Unprotect" : "Protect"}
      </Button>
      <Popover
        open={phone ? phoneAskOpen : askOpen}
        onOpenChange={phone ? setPhoneAskOpen : setAskOpen}
      >
        <PopoverTrigger asChild>
          <Button variant="ghost" size="sm" className="agent-action">
            <MessageSquare size={16} />
            Ask agent
          </Button>
        </PopoverTrigger>
        <PopoverContent
          className="ask-popover"
          side={anchor.flip ? "bottom" : "top"}
          align="center"
          sideOffset={10}
        >
          <p className="eyebrow">A NOTE FOR THE AGENT</p>
          <div className="option-list">
            {["Funnier", "Shorter", "More innocent", "Show the feature"].map(
              (chip) => (
                <Button
                  variant="outline"
                  key={chip}
                  onClick={() => setAskText(chip)}
                >
                  {chip}
                </Button>
              ),
            )}
          </div>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (!askText.trim()) return;
              revise(askText.trim());
              setAskOpen(false);
              setPhoneAskOpen(false);
            }}
          >
            <label htmlFor={phone ? "phone-selection-ask" : "selection-ask"}>
              About {selectionLabel}
            </label>
            <Textarea
              id={phone ? "phone-selection-ask" : "selection-ask"}
              value={askText}
              onChange={(e) => setAskText(e.target.value)}
              maxLength={600}
              placeholder="Keep my line, but make the reaction drier…"
              rows={3}
              required
            />
            <Button
              type="submit"
              disabled={!askText.trim() || Boolean(workingPanelId)}
            >
              Send to agent <ArrowRight size={16} />
            </Button>
            {!engine.canChat && (
              <p className="setup-note">
                No AI connected. Opens your note in the real desk without
                submitting.
              </p>
            )}
          </form>
        </PopoverContent>
      </Popover>
    </div>
  );
  const editControls = (
    <div className="selection-details">
      <p className="eyebrow">
        PANEL {panelNumber} / {selectionLabel}
      </p>
      {(directProtection || inheritedProtection) && (
        <p className="mine-note">
          <span className="mine-stamp">MINE</span>
          {inheritedProtection
            ? "The whole panel is protected."
            : "This contribution is protected."}
        </p>
      )}
      {selectedBalloon ? (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            void edit([{ kind: "balloon", id: selectedId, text: line }])
              .then(() => setEditing(false))
              .catch(() => {});
          }}
        >
          <label htmlFor="phone-line">Lettering · 12 words max</label>
          <Textarea
            id="phone-line"
            value={line}
            onChange={(e) => setLine(e.target.value)}
            maxLength={120}
          />
          <Button type="submit" disabled={busy || !line.trim()}>
            <Check size={16} />
            Save line
          </Button>
        </form>
      ) : selectedActor ? (
        <p>Choose Face or Pose to change {selectionLabel}.</p>
      ) : (
        <>
          <p>
            Tap a balloon to rewrite it, or a character to change their
            expression.
          </p>
          <label htmlFor="screen-state">Feature on screen</label>
          <select
            id="screen-state"
            value={selectedPanel.screenState}
            disabled={busy}
            onChange={(e) =>
              safeEdit([
                {
                  kind: "screen-state",
                  id: selectedPanel.id,
                  screenState: screenStateSchema.parse(e.target.value),
                },
              ])
            }
          >
            {screenStateSchema.options.map((state) => (
              <option key={state} value={state}>
                {state}
              </option>
            ))}
          </select>
        </>
      )}
      {pencils
        .filter(([, p]) => p.targetId === selectedId)
        .map(([key, proposal]) => (
          <div className="review-actions" key={key}>
            <span>
              <PencilLine size={15} /> In blue pencil
            </span>
            <Button
              size="sm"
              disabled={busy}
              onClick={() =>
                safeEdit([{ kind: "review", key, decision: "ink" }])
              }
            >
              Ink
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={busy || !proposal.before}
              title={
                !proposal.before
                  ? "New draft item: no earlier value to restore"
                  : "Restore the previous value"
              }
              onClick={() =>
                safeEdit([{ kind: "review", key, decision: "erase" }])
              }
            >
              <Eraser size={14} />
              Erase
            </Button>
          </div>
        ))}
    </div>
  );
  if (id && query.isLoading)
    return (
      <main className="studio-loading" role="status">
        Opening your drawing board…
      </main>
    );
  if (id && query.error)
    return (
      <main className="studio-loading">
        <h1>We couldn’t open this strip.</h1>
        <p role="alert">{errorMessage(query.error)}</p>
        <Link to="/home">Back to Strip</Link>
      </main>
    );
  if (!isSaved && !params.has("new")) return <Library assets={assets} />;
  if (!isSaved)
    return (
      <main className="new-strip">
        <header className="studio-topbar">
          <Link className="strip-wordmark" to="/">
            Strip<span>.</span>
          </Link>
          <span>NEW STRIP</span>
          <Button variant="ghost" asChild>
            <Link to="/home">
              <LibraryBig size={16} /> Library
            </Link>
          </Button>
          <Button variant="ghost" onClick={requestAgentSidebarOpen}>
            <MessageSquare size={16} />
            Agent
          </Button>
        </header>
        {drafting && (
          <section
            className="drafting-page"
            role="status"
            aria-label="Agent pencilling your strip"
          >
            <p>
              <PencilLine size={20} /> The agent is pencilling your page…
            </p>
            <div className="pencil-page">
              {[1, 2, 3, 4].map((n) => (
                <div className="pencil-panel" key={n}>
                  <span>0{n}</span>
                  <svg viewBox="0 0 300 240" aria-hidden="true">
                    <path d="M24 32h180m-180 12h150M45 185q12-100 60-18l18 40m35-6q-18-90 45-95M30 220h240" />
                  </svg>
                </div>
              ))}
            </div>
            <p>The real request is running in the agent’s desk.</p>
          </section>
        )}
        <section className="new-strip-body" hidden={drafting}>
          <p className="eyebrow">START WITH SOMETHING REAL.</p>
          <h1>What shipped?</h1>
          <p>
            Bring one small product change. We’ll give it a little character.
          </p>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              askAgent(draftRequest(source, illustrative, castDraft));
            }}
          >
            <label htmlFor="new-source">
              What shipped? · The source update
            </label>
            <Textarea
              id="new-source"
              value={source}
              onChange={(e) => setSource(e.target.value)}
              maxLength={4000}
              rows={5}
              placeholder="We added Undo. Deleted files can now be restored…"
              required
            />
            <label className="illustrative-check">
              <input
                type="checkbox"
                checked={illustrative}
                onChange={(e) => setIllustrative(e.target.checked)}
              />
              This is an illustrative update
            </label>
            <fieldset className="compose-cast">
              <legend>The cast</legend>
              <p>Two fictional characters. Give them your kind of chemistry.</p>
              <div className="compose-cast-grid">
                {(["ari", "sam"] as const).map((key) => (
                  <div className="compose-person" key={key}>
                    <img src={`/peeps/${key}-happy-standing.svg`} alt="" />
                    <div>
                      <label htmlFor={`${key}-name`}>Name</label>
                      <Input
                        id={`${key}-name`}
                        value={castDraft[key].name}
                        maxLength={30}
                        required
                        onChange={(e) =>
                          setCastDraft({
                            ...castDraft,
                            [key]: { ...castDraft[key], name: e.target.value },
                          })
                        }
                      />
                      <label htmlFor={`${key}-trait`}>Trait</label>
                      <Input
                        id={`${key}-trait`}
                        value={castDraft[key].role}
                        maxLength={120}
                        required
                        onChange={(e) =>
                          setCastDraft({
                            ...castDraft,
                            [key]: { ...castDraft[key], role: e.target.value },
                          })
                        }
                      />
                    </div>
                  </div>
                ))}
              </div>
            </fieldset>
            <Button
              className="print-button"
              disabled={source.trim().length < 5 || drafting}
              type="submit"
            >
              Pencil it <PencilLine size={18} />
            </Button>
          </form>
          {engine.missing && (
            <p className="setup-note">
              No AI connected yet. Your request will open in the real agent
              composer.{" "}
              <Link to={buildSettingsRoute("model")}>Connect AI →</Link>
            </p>
          )}
          <div className="try-example">
            <span>Just looking around?</span>
            <Button variant="outline" disabled={busy} onClick={openExample}>
              Open illustrative Undo strip <ArrowRight size={16} />
            </Button>
          </div>
          {error && <p role="alert">{error}</p>}
        </section>
      </main>
    );
  return (
    <main className="studio" data-phone-focus={phoneFocus ? "true" : undefined}>
      <header className="studio-topbar">
        <Link className="strip-wordmark" to="/home">
          Strip<span>.</span>
        </Link>
        <div className="title-field">
          <Input
            key={strip.id + strip.draft.title}
            aria-label="Strip title"
            defaultValue={strip.draft.title}
            maxLength={70}
            onBlur={(e) => {
              if (e.target.value.trim() && e.target.value !== strip.draft.title)
                safeEdit([{ kind: "title", text: e.target.value }]);
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") e.currentTarget.blur();
            }}
          />
          <span>
            {strip.origin === "prepared-example"
              ? "ILLUSTRATIVE / SEEDED"
              : "YOUR STRIP"}{" "}
            · REV {strip.revision}
          </span>
        </div>
        <div className="topbar-actions">
          <Button variant="ghost" size="sm" asChild aria-label="Library">
            <Link to="/home">
              <LibraryBig size={16} />
              <span className="nav-label">Library</span>
            </Link>
          </Button>
          <Button variant="ghost" size="sm" asChild aria-label="New strip">
            <Link to="/home?new=1">
              <Plus size={16} />
              <span className="nav-label">New strip</span>
            </Link>
          </Button>
          <Button
            variant="ghost"
            className="caption-button"
            onClick={copyCaption}
          >
            <Copy size={16} />
            Copy caption
          </Button>
          <Button
            className="print-button"
            onClick={download}
            disabled={
              !assets || exporting || Boolean(rendered?.overflow.length)
            }
          >
            <ArrowDownToLine size={16} />
            <span>{exporting ? "Exporting…" : "Export PNG"}</span>
          </Button>
        </div>
      </header>
      {(error || notice) && (
        <div
          className={error ? "studio-alert" : "studio-notice"}
          role={error ? "alert" : "status"}
        >
          {error || notice}
        </div>
      )}
      {phoneFocus && (
        <section className="phone-focus">
          <div className="focus-heading">
            <span>Panel {panelNumber} of 4</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setPhoneFocus(false)}
            >
              <X size={16} /> Full page
            </Button>
          </div>
          <div
            className="strip-canvas focused-canvas"
            onClick={canvasClick}
            onKeyDown={canvasClick}
            dangerouslySetInnerHTML={{ __html: focusedSvg }}
          />
          <div className="focus-pager">
            {strip.draft.panels.map((panel, index) => (
              <Button
                key={panel.id}
                variant={index === panelNumber - 1 ? "secondary" : "ghost"}
                size="sm"
                onClick={() => select(panel.id)}
                aria-label={`Focus panel ${index + 1}`}
              >
                {index + 1}
              </Button>
            ))}
          </div>
        </section>
      )}
      <div className="studio-grid">
        <aside className="script-rail">{script}</aside>
        <section className="drawing-desk">
          <div className="desk-heading">
            <span>THE PAGE</span>
            <div>
              <span className="ink-key">━ Your ink</span>
              <span className="pencil-key">┄ Agent pencil</span>
            </div>
          </div>
          <div className="artboard-wrap">
            <div
              className="desktop-context"
              style={{
                left: anchor.left,
                top: anchor.top,
                transform: `translate(-50%, ${anchor.flip ? "0" : "-100%"})`,
              }}
            >
              {contextBar()}
            </div>
            <div
              className="strip-canvas artboard"
              ref={canvasRef}
              data-testid="comic-canvas"
              onClick={canvasClick}
              onKeyDown={canvasClick}
              dangerouslySetInnerHTML={{ __html: rendered?.svg ?? "" }}
            />
            {editing && selectedBalloon && (
              <form
                className="inline-lettering"
                onSubmit={(e) => {
                  e.preventDefault();
                  void edit([{ kind: "balloon", id: selectedId, text: line }])
                    .then(() => setEditing(false))
                    .catch(() => {});
                }}
                style={{
                  top: panelNumber < 3 ? "14%" : "57%",
                  left: panelNumber % 2 ? "5%" : "51%",
                }}
              >
                <Textarea
                  aria-label="Edit balloon inline"
                  autoFocus
                  value={line}
                  maxLength={120}
                  onChange={(e) => setLine(e.target.value)}
                />
                <Button size="sm" disabled={busy} type="submit">
                  <Check size={14} />
                  Ink line
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setEditing(false)}
                >
                  Cancel
                </Button>
              </form>
            )}
          </div>
          <div className="page-foot">
            <span>TAP THE PAGE TO MAKE IT YOURS.</span>
            <span>1200 × 1200</span>
          </div>
          <section className="endings-tray">
            <div className="endings-heading">
              <h2>Stick the landing.</h2>
              <span>THREE WAYS TO END IT. PICK YOURS.</span>
            </div>
            <div className="ending-options">
              {strip.draft.endings.map((ending, index) => (
                <button
                  className="ending-choice"
                  aria-pressed={
                    strip.draft.panels[3]!.balloons.slice(-1)[0]!.text ===
                    ending
                  }
                  key={index}
                  disabled={busy}
                  onClick={() => safeEdit([{ kind: "choose-ending", index }])}
                >
                  <div
                    className="ending-thumbnail"
                    dangerouslySetInnerHTML={{ __html: endings[index] ?? "" }}
                  />
                  <span>
                    <b>0{index + 1}</b>
                    {index === 0
                      ? "The callback"
                      : index === 1
                        ? "The dry one"
                        : "The left turn"}
                    {strip.draft.panels[3]!.balloons.slice(-1)[0]!.text ===
                      ending && <Check size={14} />}
                  </span>
                </button>
              ))}
            </div>
          </section>
          <div className="desktop-selection">{editControls}</div>
        </section>
      </div>
      <section className="phone-sheet">
        <Tabs
          value={phoneTab}
          onValueChange={(value) => {
            setPhoneTab(value);
            if (value === "agent") requestAgentSidebarOpen();
          }}
        >
          <TabsList>
            <TabsTrigger value="edit">
              <PencilLine size={16} />
              Edit
            </TabsTrigger>
            <TabsTrigger value="agent">
              <MessageSquare size={16} />
              Agent
            </TabsTrigger>
            <TabsTrigger value="script">Script</TabsTrigger>
          </TabsList>
          <TabsContent value="edit">
            {contextBar(true)}
            {editControls}
          </TabsContent>
          <TabsContent value="agent">
            <Button variant="outline" onClick={requestAgentSidebarOpen}>
              Open agent’s desk <ArrowRight size={16} />
            </Button>
          </TabsContent>
          <TabsContent value="script">{script}</TabsContent>
        </Tabs>
      </section>
      <section className="agent-change-log">
        <h2>Agent changes</h2>
        {pencils.length ? (
          pencils.map(([key, proposal]) => (
            <div className="change-entry" key={key}>
              <button onClick={() => select(proposal.targetId)}>
                <PencilLine size={14} />
                {proposal.before?.kind ?? "New draft"} · {proposal.targetId}
              </button>
              <Button
                size="sm"
                disabled={busy}
                onClick={() =>
                  safeEdit([{ kind: "review", key, decision: "ink" }])
                }
              >
                Ink
              </Button>
              <Button
                variant="ghost"
                size="sm"
                disabled={busy || !proposal.before}
                title={
                  !proposal.before
                    ? "New draft item: no earlier value to restore"
                    : "Restore the previous value"
                }
                onClick={() =>
                  safeEdit([{ kind: "review", key, decision: "erase" }])
                }
              >
                Erase
              </Button>
            </div>
          ))
        ) : (
          <p>No unreviewed revisions. Your ink, your call.</p>
        )}
        {engine.missing && (
          <p>
            No AI connected.{" "}
            <Link to={buildSettingsRoute("model")}>Connect AI →</Link>
          </p>
        )}
      </section>
    </main>
  );
}
