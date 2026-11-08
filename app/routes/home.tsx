import { sendToAgentChat } from "@agent-native/core/client/agent-chat";
import {
  useActionMutation,
  useActionQuery,
} from "@agent-native/core/client/hooks";
import {
  selectAgentSelectable,
  useAgentSelectable,
  useAgentSelectableSource,
} from "@agent-native/toolkit/app/agent-select";
import { useQueryClient } from "@tanstack/react-query";
import {
  ArrowDownToLine,
  ArrowUpRight,
  Check,
  ChevronLeft,
  LockKeyhole,
  PencilLine,
  UnlockKeyhole,
  WandSparkles,
} from "lucide-react";
import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type FormEvent,
  type KeyboardEvent,
  type MouseEvent,
} from "react";
import { Link, useNavigate, useSearchParams } from "react-router";

import { exportPng, loadSceneAssets, textMeasurer } from "@/lib/strip-canvas";

import { preparedExamples } from "../../shared/examples";
import { renderStripSvg, type SceneAssets } from "../../shared/render-strip";
import {
  cast,
  expressionSchema,
  type Edit,
  type Strip,
} from "../../shared/strip";

export function meta() {
  return [
    { title: "Strip — One update. Four panels." },
    {
      name: "description",
      content:
        "Turn one product update into an editable four-panel comic, made with you.",
    },
  ];
}

function message(error: unknown): string {
  return error instanceof Error
    ? error.message
    : "That change could not be saved. Try again.";
}
function sampleStrip(index: number): Strip {
  return {
    id: "unsaved-example",
    revision: 0,
    draft: preparedExamples[index]!,
    protectedIds: [],
    origin: "prepared-example",
    lastEditedBy: "human",
    updatedAt: "",
  };
}

function BalloonEditor({
  text,
  busy,
  onSave,
}: {
  text: string;
  busy: boolean;
  onSave: (text: string) => Promise<void>;
}) {
  const [value, setValue] = useState(text);
  const [dirty, setDirty] = useState(false);
  useEffect(() => {
    if (!dirty) setValue(text);
  }, [text, dirty]);
  const words = value.trim().split(/\s+/u).filter(Boolean).length;
  return (
    <form
      onSubmit={async (e) => {
        e.preventDefault();
        try {
          await onSave(value);
          setDirty(false);
        } catch {
          /* Parent keeps the error and unsaved text visible. */
        }
      }}
    >
      <label className="strip-field-label" htmlFor="balloon-text">
        Your line
      </label>
      <textarea
        id="balloon-text"
        value={value}
        maxLength={120}
        onChange={(e) => {
          setDirty(true);
          setValue(e.target.value);
        }}
        rows={4}
      />
      <div className="strip-field-foot">
        <span className={words > 12 ? "strip-error" : ""}>
          {words}/12 words{dirty ? " · unsaved" : ""}
        </span>
        <button
          className="strip-button strip-button-small"
          disabled={busy || !dirty || words < 1 || words > 12}
          type="submit"
        >
          <Check size={14} />
          Save line
        </button>
      </div>
    </form>
  );
}

export default function Home() {
  const [params, setParams] = useSearchParams();
  const navigate = useNavigate();
  const id = params.get("id") ?? "";
  const [sample, setSample] = useState(0);
  const [source, setSource] = useState(preparedExamples[0]!.source);
  const [illustrative, setIllustrative] = useState(true);
  const [assets, setAssets] = useState<SceneAssets>();
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [exporting, setExporting] = useState(false);
  const [pngUrl, setPngUrl] = useState("");
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
  const saved = query.data;
  const strip: Strip = saved ?? sampleStrip(sample);
  const isSaved = Boolean(id && saved);
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
  const directProtection = strip.protectedIds.includes(selectedId);
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
          )
        : undefined,
    [strip, assets, measure, selectedId, isSaved],
  );
  const label = (objectId: string) =>
    objectId === selectedPanel.id
      ? `Panel ${strip.draft.panels.indexOf(selectedPanel) + 1}`
      : selectedBalloon
        ? `${cast[selectedBalloon.speaker].name}'s line`
        : "Character";

  useEffect(() => {
    loadSceneAssets()
      .then(setAssets)
      .catch((e) => setError(message(e)));
  }, []);
  useEffect(
    () => () => {
      if (pngUrl) URL.revokeObjectURL(pngUrl);
    },
    [pngUrl],
  );
  useAgentSelectable(
    isSaved
      ? {
          kind: "comic",
          id: strip.id,
          title: strip.draft.title,
          getContext: () =>
            `Strip ${strip.id}, revision ${strip.revision}. Use get-strip then update-strip. Source kind: ${strip.draft.inputKind}.`,
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
              `Selected object ${objectId} in strip ${strip.id}. Read current revision; use update-strip only for this selection.`,
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
        title:
          objectId === panel.id
            ? `Panel ${strip.draft.panels.indexOf(panel) + 1}`
            : `Comic object: ${objectId}`,
        getContext: () =>
          `Selected object ${objectId}, panel ${panel.id}, strip ${strip.id}. Read current revision with get-strip, then update only this object/panel unless asked otherwise.`,
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
      setNotice("Change saved.");
    } catch (e) {
      setError(message(e));
      throw e;
    }
  }
  async function openExample() {
    setError("");
    try {
      const result = await create.mutateAsync(preparedExamples[sample]!);
      navigate(`/home?id=${result.id}`);
    } catch (e) {
      setError(message(e));
    }
  }
  function draftWithAgent(e: FormEvent) {
    e.preventDefault();
    sendToAgentChat({
      message: `Make a four-panel comic from this ${illustrative ? "illustrative" : "user-provided"} product update. Compose it with create-strip and show it in the editor. Keep every claim within this source, distinguish fictional dialogue and include one wordless visual beat.\n\nSOURCE:\n${source}`,
      openSidebar: true,
      submit: true,
    });
  }
  function revise() {
    sendToAgentChat({
      message: `Improve the comic's selected ${selectedBalloon ? "balloon" : "panel"}: ${selectedId}, in strip ${strip.id}. Make it clearer and more charming. Read get-strip for the current revision. Preserve all protected human contributions and use focused update-strip edits, not a replacement comic.`,
      openSidebar: true,
      submit: true,
    });
  }
  async function toggleProtection() {
    setError("");
    setNotice("");
    try {
      await protect.mutateAsync({
        id: strip.id,
        expectedRevision: strip.revision,
        targetId: selectedId,
        protected: !directProtection,
      });
      setNotice(
        directProtection
          ? "Protection removed by you."
          : "Protected from agent edits.",
      );
    } catch (e) {
      setError(message(e));
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
      setPngUrl(url);
      const link = document.createElement("a");
      link.href = url;
      link.download = "strip-comic.png";
      link.click();
      setNotice("PNG created from the current comic. Open it below to check.");
    } catch (e) {
      setError(message(e));
    } finally {
      setExporting(false);
    }
  }

  if (id && query.isLoading)
    return (
      <main className="strip-page">
        <p role="status">Opening your saved comic…</p>
      </main>
    );
  if (id && query.error)
    return (
      <main className="strip-page">
        <h1>We couldn’t open this strip.</h1>
        <p role="alert">{message(query.error)}</p>
        <Link to="/home">Back to Strip</Link>
      </main>
    );
  return (
    <main
      className={`strip-page ${isSaved ? "strip-workspace" : "strip-entry"}`}
    >
      <header className="strip-masthead">
        <Link to="/home" className="strip-wordmark" aria-label="Strip home">
          Strip<span>.</span>
        </Link>
        <span className="strip-edition">ONE UPDATE. FOUR PANELS.</span>
        <span className="strip-proof-tag">PROOF / 001</span>
      </header>
      {error ? (
        <div className="strip-alert" role="alert">
          {error}
        </div>
      ) : null}
      {notice ? (
        <p className="strip-notice" role="status">
          {notice}
          {pngUrl ? (
            <>
              {" "}
              <a href={pngUrl} target="_blank" rel="noreferrer">
                Open actual PNG ↗
              </a>
            </>
          ) : null}
        </p>
      ) : null}
      {!isSaved ? (
        <div className="strip-entry-grid">
          <section className="strip-intro">
            <p className="strip-eyebrow">A LITTLE LESS CHANGELOG.</p>
            <h1>
              Make your update
              <br />
              worth a<br />
              <span>second look.</span>
            </h1>
            <p className="strip-deck">
              A four-panel comic, made with you.
              <br />
              Bring the update. Give it a little character.
            </p>
            <form className="strip-source-form" onSubmit={draftWithAgent}>
              <label htmlFor="source" className="strip-field-label">
                What changed?
              </label>
              <textarea
                id="source"
                value={source}
                onChange={(e) => setSource(e.target.value)}
                maxLength={4000}
                rows={3}
                required
                placeholder="One specific product update. Nothing invented."
              />
              <label className="strip-check">
                <input
                  type="checkbox"
                  checked={illustrative}
                  onChange={(e) => setIllustrative(e.target.checked)}
                />
                This is an illustrative update
              </label>
              <button
                className="strip-button strip-button-primary"
                type="submit"
                disabled={!source.trim()}
              >
                <WandSparkles size={17} />
                Draft with agent
                <ArrowUpRight size={17} />
              </button>
              <p className="strip-fine">
                Requires a connected model. No model output is shown here yet.
              </p>
            </form>
            <div className="strip-how">
              <span>01 / BRING A CHANGE</span>
              <span>02 / MAKE IT YOURS</span>
              <span>03 / TAKE IT WITH YOU</span>
            </div>
          </section>
          <section className="strip-example">
            <div className="strip-preview-label">
              <span>THE DRAWING BOARD</span>
              <span>HAND-AUTHORED EXAMPLE</span>
            </div>
            <div
              className="strip-canvas"
              ref={canvasRef}
              data-testid="comic-canvas"
              dangerouslySetInnerHTML={{ __html: rendered?.svg ?? "" }}
            />
            {!assets ? <p role="status">Loading local artwork…</p> : null}
            <div className="strip-sample-tabs" aria-label="Prepared examples">
              {["Undo", "Smarter search", "Scheduled send"].map((name, i) => (
                <button
                  key={name}
                  aria-pressed={sample === i}
                  onClick={() => {
                    setSample(i);
                    setSource(preparedExamples[i]!.source);
                    setIllustrative(true);
                  }}
                >
                  {name}
                </button>
              ))}
            </div>
            <div className="strip-preview-foot">
              <p>
                Real scene objects.
                <br />
                Not one uneditable image.
              </p>
              <button
                className="strip-text-button"
                onClick={openExample}
                disabled={busy}
              >
                Try editing this example <ArrowUpRight size={16} />
              </button>
            </div>
          </section>
        </div>
      ) : (
        <>
          <div className="strip-workspace-heading">
            <div>
              <button className="strip-back" onClick={() => navigate("/home")}>
                <ChevronLeft size={15} />
                New strip
              </button>
              <h1>{strip.draft.title}</h1>
              <p>
                <span className="strip-origin">
                  {strip.origin === "prepared-example"
                    ? "Prepared example"
                    : strip.origin === "agent-draft"
                      ? "Agent draft"
                      : "Human-authored"}
                </span>{" "}
                · Revision {strip.revision} · Last edit: {strip.lastEditedBy}
              </p>
            </div>
            <button
              className="strip-button strip-button-primary"
              onClick={download}
              disabled={
                exporting || !assets || Boolean(rendered?.overflow.length)
              }
            >
              <ArrowDownToLine size={17} />
              {exporting ? "Creating PNG…" : "Export PNG"}
            </button>
          </div>
          <div className="strip-workspace-grid">
            <section>
              <div
                className="strip-canvas"
                ref={canvasRef}
                data-testid="comic-canvas"
                onClick={canvasClick}
                onKeyDown={canvasClick}
                dangerouslySetInnerHTML={{ __html: rendered?.svg ?? "" }}
              />
              <p className="strip-canvas-note">
                Click a line, character or panel. Your changes are real scene
                edits.
              </p>
              {rendered?.overflow.length ? (
                <p role="alert" className="strip-error">
                  Text needs more room: {rendered.overflow.join(", ")}. Shorten
                  it before exporting.
                </p>
              ) : null}
            </section>
            <aside className="strip-inspector">
              <div className="strip-inspector-heading">
                <span className="strip-eyebrow">MAKE IT YOURS</span>
                <PencilLine size={17} />
              </div>
              <div className="strip-panel-tabs" aria-label="Select panel">
                {strip.draft.panels.map((panel, i) => (
                  <button
                    key={panel.id}
                    aria-pressed={panel.id === selectedPanel.id}
                    onClick={() => select(panel.id)}
                  >
                    {String(i + 1).padStart(2, "0")}
                  </button>
                ))}
              </div>
              <h2>{label(selectedId)}</h2>
              <p className="strip-muted">
                {selectedBalloon
                  ? "Keep the good line. Change the rest."
                  : "Direct the moment, then let the agent work around it."}
              </p>
              {selectedPanel.balloons.length ? (
                <div className="strip-lines">
                  {selectedPanel.balloons.map((balloon) => (
                    <button
                      key={balloon.id}
                      className={selectedId === balloon.id ? "is-selected" : ""}
                      onClick={() => select(balloon.id)}
                    >
                      <span>{cast[balloon.speaker].name}</span>“{balloon.text}”
                    </button>
                  ))}
                </div>
              ) : (
                <p className="strip-wordless">
                  A wordless beat. Let the picture do the talking.
                </p>
              )}
              {selectedBalloon ? (
                <BalloonEditor
                  key={selectedBalloon.id}
                  text={selectedBalloon.text}
                  busy={busy}
                  onSave={(text) =>
                    edit([{ kind: "balloon", id: selectedBalloon.id, text }])
                  }
                />
              ) : null}
              <div className="strip-characters">
                {selectedPanel.actors.map((actor) => (
                  <label key={actor.id}>
                    <span className="strip-field-label">
                      {cast[actor.character].name}'s expression
                    </span>
                    <select
                      value={actor.expression}
                      disabled={busy}
                      onChange={(e) => {
                        void edit([
                          {
                            kind: "expression",
                            id: actor.id,
                            expression: expressionSchema.parse(e.target.value),
                          },
                        ]).catch(() => {});
                      }}
                    >
                      {expressionSchema.options.map((expression) => (
                        <option key={expression} value={expression}>
                          {expression}
                        </option>
                      ))}
                    </select>
                  </label>
                ))}
              </div>
              <button
                className={`strip-protection ${directProtection ? "is-protected" : ""}`}
                onClick={toggleProtection}
                disabled={busy}
              >
                {directProtection ? (
                  <LockKeyhole size={17} />
                ) : (
                  <UnlockKeyhole size={17} />
                )}
                <span>
                  {directProtection
                    ? "Protected from the agent"
                    : `Protect this ${selectedBalloon ? "line" : "selection"}`}
                  <small>
                    {directProtection
                      ? "You can still edit. Only you can release it."
                      : "Your contribution stays yours."}
                  </small>
                </span>
              </button>
              <button
                className="strip-button strip-button-outline"
                onClick={revise}
                disabled={busy}
              >
                <WandSparkles size={16} />
                Revise this selection
                <ArrowUpRight size={16} />
              </button>
              <p className="strip-fine">
                Agent revision needs a connected model. Protected edits and
                version checks are enforced by the app.
              </p>
              <details className="strip-endings">
                <summary>Three ways to end it</summary>
                {strip.draft.endings.map((ending, i) => (
                  <button
                    key={`${i}-${ending}`}
                    disabled={busy}
                    onClick={() => {
                      void edit([{ kind: "choose-ending", index: i }]).catch(
                        () => {},
                      );
                    }}
                  >
                    <span>{String(i + 1).padStart(2, "0")}</span>
                    {ending}
                    <ArrowUpRight size={14} />
                  </button>
                ))}
              </details>
              <details className="strip-source-note">
                <summary>Source & fictional dialogue</summary>
                <p>{strip.draft.source}</p>
                <small>
                  {strip.draft.inputKind === "illustrative"
                    ? "Illustrative product update, not a claimed real release."
                    : "User-provided statement, not independently verified by Strip."}{" "}
                  All character dialogue is fictional.
                </small>
              </details>
            </aside>
          </div>
        </>
      )}
      <footer className="strip-footer">
        <span>BUILT WITH AGENT-NATIVE</span>
        <span>HUMAN TASTE. SHARED TOOLS.</span>
        <span>ART: OPEN PEEPS</span>
      </footer>
    </main>
  );
}
