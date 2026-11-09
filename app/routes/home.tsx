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
  useReconciledState,
  actionErrorCode,
  actionErrorMessage,
} from "@agent-native/core/client/hooks";
import { buildSettingsRoute } from "@agent-native/core/client/navigation";
import {
  selectAgentSelectable,
  deselectAgentSelectable,
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
  useMemo,
  useRef,
  useState,
  type MouseEvent,
  type KeyboardEvent,
} from "react";
import { Link, useNavigate, useSearchParams } from "react-router";

import "../strip-v2.css";

import { AngleComposer, AngleCards } from "@/components/home/AngleComposer";
import { CastCards } from "@/components/home/CastCards";
import { Library } from "@/components/home/Library";
import { SelectionNote } from "@/components/home/SelectionNote";
import { StageEditor } from "@/components/home/StageEditor";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverAnchor,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import {
  clearStripHandoff,
  stripHandoffTarget,
} from "@/lib/strip-agent-context";
import { exportPng, loadSceneAssets, textMeasurer } from "@/lib/strip-canvas";

import { personFor, type Cast, type CharacterId } from "../../shared/casting";
import { preparedExamples } from "../../shared/examples";
import { launchCaption, exportFilename } from "../../shared/launch-post";
import { renderStripSvg, type SceneAssets } from "../../shared/render-strip";
import {
  cast,
  expressionSchema,
  poseSchema,
  applyEdits,
  type Edit,
  type Strip,
} from "../../shared/strip";
import { cropPanel, objectLabel, sourceCoverage } from "../../shared/studio";
import { illustrativeSlack } from "../../shared/v2-fixture";

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
  actionErrorMessage(error) ?? "That change could not be saved. Try again.";
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
  const [exportOpen, setExportOpen] = useState(false);
  const [exportPreview, setExportPreview] = useState("");
  const [exportName, setExportName] = useState("");
  const [caption, setCaption] = useState("");
  const [exportNotice, setExportNotice] = useState("");
  useEffect(
    () => () => {
      if (exportPreview) URL.revokeObjectURL(exportPreview);
    },
    [exportPreview],
  );
  const [source, setSource] = useState("");
  const [illustrative, setIllustrative] = useState(false);
  const [angleOpen, setAngleOpen] = useState(false);
  const [askText, setAskText] = useState("");
  const [askOpen, setAskOpen] = useState(false);
  const [phoneAskOpen, setPhoneAskOpen] = useState(false);
  const [phoneFocus, setPhoneFocus] = useState(false);
  const [editing, setEditing] = useState(false);
  const [lineDirty, setLineDirty] = useState(false);
  const lineRevision = useRef(0);
  const [phoneTab, setPhoneTab] = useState("edit");
  const [agentRequest, setAgentRequest] = useState<{
    submitId: string;
    stripId: string;
    panelId: string;
    phase: "angles" | "draft" | "revision";
    threadId?: string;
  }>();
  const { workingThreadIds } = useAgentChatRunningThreads();
  const seenWorking = useRef<string | undefined>(undefined);
  useEffect(() => {
    if (!agentRequest?.threadId) return;
    if (workingThreadIds.has(agentRequest.threadId))
      seenWorking.current = agentRequest.submitId;
    else if (seenWorking.current === agentRequest.submitId) {
      setAgentRequest(undefined);
      seenWorking.current = undefined;
    }
  }, [agentRequest, workingThreadIds]);
  const drafting =
    !id &&
    agentRequest?.stripId === "" &&
    agentRequest.phase === "draft" &&
    Boolean(
      agentRequest.threadId && workingThreadIds.has(agentRequest.threadId),
    );
  const findingAngles =
    agentRequest?.phase === "angles" &&
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
  const stagedHandoff = useRef<string | undefined>(undefined);
  const handoffTarget = params.get("plan")
    ? `plan:${params.get("plan")}`
    : stripHandoffTarget(id, selectedId);
  useEffect(() => {
    if (clearStripHandoff(stagedHandoff.current, handoffTarget))
      stagedHandoff.current = undefined;
  }, [handoffTarget]);
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
  const [line, setLine] = useReconciledState(selectedBalloon?.text ?? "", {
    active: lineDirty,
  });
  function changeLine(text: string) {
    if (!lineDirty) lineRevision.current = strip.revision;
    setLineDirty(true);
    setLine(text);
  }
  async function saveLine() {
    await edit(
      [{ kind: "balloon", id: selectedId, text: line }],
      lineDirty ? lineRevision.current : strip.revision,
    );
    setLineDirty(false);
    setEditing(false);
  }
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
        ? strip.draft.endings.map((_, index) => {
            const preview = applyEdits(
              strip,
              strip.revision,
              [{ kind: "choose-ending", index }],
              "human",
            );
            // Same renderer, cropped to the actual alternative fourth panel.
            return cropPanel(renderStripSvg(preview, assets, measure).svg, 3);
          })
        : [],
    [strip, assets, measure],
  );
  const panelNumber = strip.draft.panels.indexOf(selectedPanel) + 1;
  const selectionLabel = selectedBalloon
    ? `${personFor(strip.draft, selectedBalloon.speaker).name}'s line`
    : selectedActor
      ? personFor(strip.draft, selectedActor.character).name
      : `Panel ${panelNumber}`;
  const pencils = Object.entries(strip.pencils ?? {});
  const coverage = sourceCoverage(strip.draft);
  const people = strip.draft.cast ?? cast;
  const focusedSvg = rendered ? cropPanel(rendered.svg, panelNumber - 1) : "";
  useEffect(() => {
    let active = true;
    loadSceneAssets(strip.draft)
      .then((loaded) => {
        if (active) setAssets(loaded);
      })
      .catch((e) => {
        if (active) setError(errorMessage(e));
      });
    return () => {
      active = false;
    };
  }, [strip.id, strip.revision]);
  useEffect(() => {
    setEditing(false);
    setLine(selectedBalloon?.text ?? "");
    setLineDirty(false);
  }, [selectedId, strip.id]);
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
            title: objectLabel(strip.draft, objectId),
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
  // Plain-click chips are not source-registered objects; release them when their screen/selection leaves.
  useEffect(() => {
    if (!isSaved) return;
    return () => deselectAgentSelectable("comic-object", selectedId);
  }, [isSaved, strip.id, selectedId]);
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
        title: objectLabel(strip.draft, objectId),
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
  async function edit(edits: Edit[], expectedRevision = strip.revision) {
    setError("");
    setNotice("");
    try {
      const saved = await update.mutateAsync({
        id: strip.id,
        expectedRevision,
        edits,
      });
      setNotice("Saved in ink.");
      return saved;
    } catch (e) {
      if (actionErrorCode(e) === "stale_revision") {
        setNotice("This strip changed elsewhere — showing the latest");
        // A rejected save must reveal the latest canvas, not leave a stale
        // textarea above it or retain its editing-base revision for the next edit.
        setEditing(false);
        setLineDirty(false);
        const latest = await query.refetch();
        const balloon = latest.data?.draft.panels
          .flatMap((p) => p.balloons)
          .find((b) => b.id === selectedId);
        setLine(balloon?.text ?? "");
      } else {
        setError(errorMessage(e));
        await query.refetch();
      }
      throw e;
    }
  }
  function safeEdit(edits: Edit[]) {
    void edit(edits).catch(() => {});
  }
  async function openExample(slack = false) {
    setError("");
    try {
      const result = await create.mutateAsync(
        slack ? illustrativeSlack : preparedExamples[0]!,
      );
      navigate(`/home?id=${result.id}`);
    } catch (e) {
      setError(errorMessage(e));
    }
  }
  function askAgent(request: string, context?: Record<string, unknown>) {
    // The handoff already carries the complete target/revision. Do not also
    // stage a picked-object chip describing that same target.
    deselectAgentSelectable("comic-object", selectedId);
    stagedHandoff.current = engine.canChat ? undefined : handoffTarget;
    setPhoneTab("agent");
    const submitId = crypto.randomUUID();
    if (engine.canChat)
      setAgentRequest({
        submitId,
        stripId: isSaved ? strip.id : "",
        panelId: isSaved ? selectedPanel.id : "",
        phase: isSaved ? "revision" : context?.planId ? "draft" : "angles",
      });
    sendToAgentChat({
      submitMessageId: submitId,
      message: request,
      contextLabel: context
        ? isSaved
          ? "Story direction"
          : "Angle & source"
        : isSaved
          ? selectionLabel
          : "Cast & source type",
      context: context
        ? JSON.stringify(context)
        : isSaved
          ? JSON.stringify({
              stripId: strip.id,
              selectedId,
              panelId: selectedPanel.id,
              expectedRevision: strip.revision,
            })
          : JSON.stringify({
              inputKind: illustrative ? "illustrative" : "user-provided",
              workflow: "angles-first",
            }),
      openSidebar: true,
      submit: engine.canChat,
    });
  }
  async function recast(people: Cast, character: CharacterId) {
    try {
      const saved = await edit([{ kind: "cast", cast: people }]);
      askAgent(
        `Adapt only ${people[character]?.name}'s affected, unprotected dialogue for this recast. Leave all other lines, art and MINE contributions untouched.`,
        {
          stripId: saved.id,
          expectedRevision: saved.revision,
          recastCharacterId: character,
          scope: "affected-unprotected-balloons-only",
        },
      );
    } catch {
      /* Shared edit handler reports the error. */
    }
  }
  async function changeAngle(angleId: string) {
    const angle = strip.draft.angles?.find((a) => a.id === angleId);
    if (!angle) return;
    try {
      const saved = await edit([
        { kind: "angle", angleId },
        { kind: "cast", cast: { ...people, ...angle.cast } },
      ]);
      setAngleOpen(false);
      askAgent(
        "Adapt this strip to my chosen angle. Keep protected work untouched; use focused update-strip edits, never replace this strip.",
        {
          stripId: saved.id,
          expectedRevision: saved.revision,
          selectedAngleId: angleId,
          scope: "angle-revision",
        },
      );
    } catch {
      /* Shared edit handler reports the error. */
    }
  }
  function revise(
    instruction = "Make this selection clearer and more charming.",
  ) {
    askAgent(instruction);
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
      if (actionErrorCode(e) === "stale_revision")
        setNotice("This strip changed elsewhere — showing the latest");
      else setError(errorMessage(e));
      await query.refetch();
    }
  }
  async function openExport() {
    if (!assets || !measure) return;
    setExporting(true);
    setError("");
    try {
      const exportAssets = await loadSceneAssets(strip.draft);
      const output = renderStripSvg(
        strip,
        exportAssets,
        measure,
        undefined,
        undefined,
        false,
      );
      if (output.overflow.length)
        throw new Error(
          "Some text does not fit. Shorten the highlighted lines before exporting.",
        );
      const blob = await exportPng(output.svg);
      setExportPreview(URL.createObjectURL(blob));
      setExportName(exportFilename(strip.draft.title));
      setCaption(launchCaption(strip.draft));
      setExportNotice("");
      setExportOpen(true);
    } catch (e) {
      setError(
        e instanceof Error
          ? e.message
          : "Could not prepare the PNG. Try again.",
      );
    } finally {
      setExporting(false);
    }
  }
  async function copyCaption() {
    try {
      await navigator.clipboard.writeText(caption);
      setExportNotice("Post caption copied.");
    } catch {
      setExportNotice(
        "Clipboard unavailable. Select and copy the caption below.",
      );
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
      <p className="eyebrow">THE ANGLE</p>
      <p>
        {strip.draft.angles?.find((a) => a.id === strip.draft.selectedAngleId)
          ?.premise ?? "A new way to find the funny."}
      </p>
      <Button
        variant="outline"
        size="sm"
        onClick={() =>
          strip.draft.angles
            ? setAngleOpen(!angleOpen)
            : askAgent(
                "Propose three story-specific angles for this existing strip through update-strip's angles edit. Do not draft or replace it; let me choose.",
                {
                  stripId: strip.id,
                  expectedRevision: strip.revision,
                  workflow: "change-angle",
                },
              )
        }
      >
        Change angle
      </Button>
      <div className="rail-rule" />
      <p className="eyebrow">CAST FOR THIS STORY</p>
      <CastCards
        people={people}
        editable
        saved
        onSave={(people, character) => void recast(people, character)}
      />
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
      {phone ? (
        <Button
          variant="ghost"
          size="sm"
          className="agent-action"
          onClick={() => setPhoneAskOpen(!phoneAskOpen)}
        >
          <MessageSquare size={16} />
          Ask agent
        </Button>
      ) : (
        <Popover open={askOpen} onOpenChange={setAskOpen}>
          {!phone && (
            <PopoverAnchor
              virtualRef={{
                current: {
                  getBoundingClientRect: () => {
                    const panel = Array.from(
                      canvasRef.current?.querySelectorAll<SVGGraphicsElement>(
                        "[data-object]",
                      ) ?? [],
                    ).find(
                      (el) =>
                        el.getAttribute("data-object") === selectedPanel.id,
                    );
                    return (
                      panel?.getBoundingClientRect() ??
                      canvasRef.current?.getBoundingClientRect() ??
                      new DOMRect()
                    );
                  },
                },
              }}
            />
          )}
          <PopoverTrigger asChild>
            <Button variant="ghost" size="sm" className="agent-action">
              <MessageSquare size={16} />
              Ask agent
            </Button>
          </PopoverTrigger>
          <PopoverContent
            className="ask-popover"
            side={phone ? "top" : panelNumber % 2 ? "right" : "left"}
            align={phone ? "center" : "start"}
            sideOffset={10}
          >
            <SelectionNote
              label={selectionLabel}
              value={askText}
              onChange={setAskText}
              onSend={revise}
              onClose={() => setAskOpen(false)}
              working={Boolean(workingPanelId)}
              canChat={engine.canChat}
            />
          </PopoverContent>
        </Popover>
      )}
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
            void saveLine().catch(() => {});
          }}
        >
          <label htmlFor="phone-line">Lettering · 12 words max</label>
          <Textarea
            id="phone-line"
            value={line}
            onChange={(e) => changeLine(e.target.value)}
            onKeyDown={(e) => {
              if (
                e.key === "Enter" &&
                !e.shiftKey &&
                !e.nativeEvent.isComposing
              ) {
                e.preventDefault();
                void saveLine().catch(() => {});
              }
            }}
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
          <StageEditor
            key={`${selectedPanel.id}:${strip.revision}`}
            panel={selectedPanel}
            busy={busy}
            onSave={safeEdit}
          />
        </>
      )}
      {pencils
        .filter(([, p]) => p.targetId === selectedId)
        .map(([key, proposal]) => (
          <div className="review-actions" key={key}>
            <span>
              <PencilLine size={15} /> Agent proposal
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
            <img src="/logo.svg" width="253" height="95" alt="Strip" />
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
        {findingAngles && (
          <p className="studio-notice" role="status">
            The agent is finding three angles for your update…
          </p>
        )}
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
          <AngleComposer
            source={source}
            onSource={setSource}
            illustrative={illustrative}
            onIllustrative={setIllustrative}
            onAsk={askAgent}
          />
          {engine.missing && (
            <p className="setup-note">
              No AI connected yet. Your request will open in the real agent
              composer.{" "}
              <Link to={buildSettingsRoute("model")}>Connect AI →</Link>
            </p>
          )}
          <div className="try-example">
            <span>Just looking around?</span>
            <Button
              variant="outline"
              disabled={busy}
              onClick={() => void openExample()}
            >
              Open illustrative Undo strip <ArrowRight size={16} />
            </Button>
            <Button
              variant="outline"
              disabled={busy}
              onClick={() => void openExample(true)}
            >
              Open illustrative Slack strip
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
          <img src="/logo.svg" width="253" height="95" alt="Strip" />
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
            className="print-button"
            onClick={openExport}
            disabled={
              !assets || exporting || Boolean(rendered?.overflow.length)
            }
          >
            <ArrowDownToLine size={16} />
            <span>{exporting ? "Preparing…" : "Export"}</span>
          </Button>
        </div>
      </header>
      {angleOpen && strip.draft.angles && (
        <section className="studio-angle-picker">
          <div className="endings-heading">
            <h2>Change the angle.</h2>
            <Button variant="ghost" onClick={() => setAngleOpen(false)}>
              Close
            </Button>
          </div>
          <p>
            Revisions respect MINE. Choose the cast for this story; the agent
            adapts the unprotected scene.
          </p>
          <AngleCards
            angles={strip.draft.angles}
            selectedId={strip.draft.selectedAngleId}
            onChoose={(id) => void changeAngle(id)}
          />
        </section>
      )}
      {Boolean(rendered?.overflow.length) && (
        <p className="studio-alert" role="alert">
          Some lettering cannot fit and has been hidden. Shorten{" "}
          {rendered?.overflow.join(", ")} before exporting.
        </p>
      )}
      <Sheet open={exportOpen} onOpenChange={setExportOpen}>
        <SheetContent className="launch-export" showClose={false}>
          <div className="export-heading">
            <SheetTitle>Your launch post</SheetTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setExportOpen(false)}
            >
              <X size={16} /> Close
            </Button>
          </div>
          <SheetDescription>
            The page, ready to share. Caption from your source update — no AI.
          </SheetDescription>
          <img
            className="export-preview"
            src={exportPreview || undefined}
            alt="PNG preview of your four-panel strip"
          />
          <p className="export-filename">{exportName} · 1200 × 1200</p>
          <label htmlFor="post-caption">Post caption · editable</label>
          <Textarea
            id="post-caption"
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            rows={5}
          />
          <div className="export-actions">
            <Button className="print-button" asChild>
              <a
                href={exportPreview}
                download={exportName}
                onClick={() => setExportNotice(`Downloaded ${exportName}`)}
              >
                <ArrowDownToLine size={16} />
                Download PNG
              </a>
            </Button>
            <Button variant="outline" onClick={copyCaption}>
              <Copy size={16} />
              Copy caption
            </Button>
          </div>
          <p role="status">{exportNotice}</p>
        </SheetContent>
      </Sheet>
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
              <span className="pencil-key">✎ Agent proposal</span>
            </div>
          </div>
          <div className="artboard-wrap">
            <div className="desktop-context">{contextBar()}</div>
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
                  void saveLine().catch(() => {});
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
                  onChange={(e) => changeLine(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Escape") {
                      setEditing(false);
                      setLineDirty(false);
                      setLine(selectedBalloon?.text ?? "");
                    }
                    if (
                      e.key === "Enter" &&
                      !e.shiftKey &&
                      !e.nativeEvent.isComposing
                    ) {
                      e.preventDefault();
                      void saveLine().catch(() => {});
                    }
                  }}
                />
                <Button size="sm" disabled={busy} type="submit">
                  <Check size={14} />
                  Ink line
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  type="button"
                  onClick={() => {
                    setEditing(false);
                    setLineDirty(false);
                    setLine(selectedBalloon?.text ?? "");
                  }}
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
            {phoneAskOpen && (
              <SelectionNote
                phone
                label={selectionLabel}
                value={askText}
                onChange={setAskText}
                onSend={revise}
                onClose={() => setPhoneAskOpen(false)}
                working={Boolean(workingPanelId)}
                canChat={engine.canChat}
              />
            )}
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
