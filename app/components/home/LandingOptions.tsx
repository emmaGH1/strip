import {
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  Check,
  PencilLine,
  X,
} from "lucide-react";
import { useEffect, useId, useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { loadSceneAssets, textMeasurer } from "@/lib/strip-canvas";

import {
  landingDemoStates,
  type LandingDemoStage,
} from "../../../shared/landing-demo";
import { renderStripSvg, type SceneAssets } from "../../../shared/render-strip";
import type { Strip } from "../../../shared/strip";
import { cropPanel } from "../../../shared/studio";
import { posterSpecimen } from "./Poster";

import "../../landing-options.css";

type Direction = "a" | "b" | "c";
const demo = landingDemoStates();

function Cta({ children = "Make a strip" }: { children?: React.ReactNode }) {
  return (
    <Button className="landing-cta" asChild>
      <a href="/home?new=1">
        {children}
        <ArrowRight size={19} />
      </a>
    </Button>
  );
}

/** The actual Studio/export renderer, with non-interactive, uniquely scoped teaching artwork. */
function Comic({
  scene,
  panel,
  className = "",
  label = "Illustrative four-panel comic about Undo",
}: {
  scene?: Strip;
  panel?: number;
  className?: string;
  label?: string;
}) {
  const id = useId().replace(/[^a-z0-9]/giu, "");
  const [assets, setAssets] = useState<SceneAssets>();
  const [failed, setFailed] = useState(false);
  useEffect(() => {
    let active = true;
    loadSceneAssets()
      .then((loaded) => {
        if (active) setAssets(loaded);
      })
      .catch(() => {
        if (active) setFailed(true);
      });
    return () => {
      active = false;
    };
  }, []);
  const svg = useMemo(() => {
    if (!assets) return "";
    const rendered = renderStripSvg(
      scene ?? posterSpecimen(),
      assets,
      textMeasurer(),
    ).svg;
    return (panel === undefined ? rendered : cropPanel(rendered, panel))
      .replace(/id="([^"]+)"/gu, `id="${id}-$1"`)
      .replace(/url\(#([^)]+)\)/gu, `url(#${id}-$1)`)
      .replace(/ role="button" tabindex="0"/gu, "")
      .replace(/cursor:pointer/gu, "cursor:default");
  }, [assets, scene, panel, id]);
  return (
    <div
      className={`landing-comic ${panel === undefined ? "comic-page" : "comic-panel"} ${className}`}
      role="img"
      aria-label={label}
    >
      {svg ? (
        <div aria-hidden="true" dangerouslySetInnerHTML={{ __html: svg }} />
      ) : (
        <p role={failed ? "alert" : "status"}>
          {failed
            ? "The illustrative artwork could not load. Please reload."
            : "Loading the illustrative strip…"}
        </p>
      )}
    </div>
  );
}

function Header({ direction }: { direction: Direction }) {
  return (
    <header className="landing-header landing-width">
      <a className="landing-wordmark" href="/" aria-label="Strip home">
        Strip.
      </a>
      <span className="landing-masthead">
        A COMICS STUDIO FOR WHAT SHIPPED.
      </span>
      <a className="landing-text-link" href="/home">
        Open the studio <ArrowRight size={16} />
      </a>
      <span className="landing-option">
        DIRECTION {direction.toUpperCase()}
      </span>
    </header>
  );
}

function PhoneProof() {
  const [panel, setPanel] = useState(0);
  return (
    <div className="landing-phone-proof">
      <Comic
        panel={panel}
        label={`Illustrative Undo comic, panel ${panel + 1} of 4`}
      />
      <div className="phone-proof-controls">
        <Button
          variant="ghost"
          aria-label="Previous comic panel"
          disabled={panel === 0}
          onClick={() => setPanel(panel - 1)}
        >
          <ArrowLeft size={18} />
        </Button>
        <span aria-live="polite">
          Panel {panel + 1} of 4 ·{" "}
          {["The setup", "The trouble", "The turn", "The punchline"][panel]}
        </span>
        <Button
          variant="ghost"
          aria-label="Next comic panel"
          disabled={panel === 3}
          onClick={() => setPanel(panel + 1)}
        >
          <ArrowRight size={18} />
        </Button>
      </div>
    </div>
  );
}
function Proof({ wide = false }: { wide?: boolean }) {
  return (
    <figure className={`landing-proof ${wide ? "proof-wide" : ""}`}>
      {wide ? (
        <div className="landing-filmstrip landing-desktop-proof">
          {[0, 1, 2, 3].map((panel) => (
            <Comic
              key={panel}
              panel={panel}
              label={`Illustrative Undo comic, panel ${panel + 1}`}
            />
          ))}
        </div>
      ) : (
        <Comic className="landing-desktop-proof" />
      )}
      <PhoneProof />
      <figcaption>
        <span>ILLUSTRATIVE UPDATE · FICTIONAL DIALOGUE</span>
        <span>
          <i className="pencil-key" /> Agent pencil <i className="ink-key" />{" "}
          Your ink
        </span>
      </figcaption>
    </figure>
  );
}

function Hero({ direction }: { direction: Direction }) {
  if (direction === "c")
    return (
      <section className="landing-hero hero-c landing-width">
        <div className="broadside-heading">
          <div>
            <p className="landing-kicker">FROM RELEASE NOTE TO LAUNCH POST.</p>
            <h1>
              Small update.
              <br />
              <em>Good story.</em>
            </h1>
          </div>
          <div className="hero-aside">
            <p>
              Your product did something good. <br />
              Give it four panels, two characters, <br />
              and a punchline worth sharing.
            </p>
            <Cta />
          </div>
        </div>
        <div className="source-slug">
          <span>THE UPDATE</span>
          <p>“Deleted files can now be restored with Undo.”</p>
          <ArrowDown size={20} />
        </div>
        <Proof wide />
        <p className="broadside-bottom">
          Pencilled by your agent. Inked by you.{" "}
          <span>Export a 1200 × 1200 PNG.</span>
        </p>
      </section>
    );
  return (
    <section className={`landing-hero hero-${direction} landing-width`}>
      <div className="hero-copy">
        <p className="landing-kicker">
          {direction === "a"
            ? "YOUR NEXT LAUNCH POST, WITH CHARACTER."
            : "YOU MAKE THE CALL. THE AGENT MAKES A DRAFT."}
        </p>
        <h1>
          {direction === "a" ? (
            <>
              Release notes
              <br />
              nobody reads?
              <br />
              <em>Ship a strip.</em>
            </>
          ) : (
            <>
              Good agents
              <br />
              leave your
              <br />
              <em>line alone.</em>
            </>
          )}
        </h1>
        <p className="landing-deck">
          {direction === "a" ? (
            <>
              One product update. Four panels.
              <br />A comic you and your agent make together.
            </>
          ) : (
            <>
              An agent can help write your comic.
              <br />
              It shouldn’t get to rewrite you.
            </>
          )}
        </p>
        <Cta />
        <p className="hero-footnote">
          Real edits. Protected lines. A PNG that’s yours.
        </p>
      </div>
      <div className="hero-art">
        <div className="proof-overline">
          <PencilLine size={17} />
          <span>
            {direction === "a"
              ? "A LITTLE BACK-AND-FORTH MAKES IT YOURS."
              : "BLUE IS A PROPOSAL. INK IS A DECISION."}
          </span>
        </div>
        <Proof />
      </div>
    </section>
  );
}

function LoopA() {
  return (
    <section id="how-it-works" className="landing-loop loop-a landing-width">
      <div className="section-intro">
        <p className="landing-kicker">THE PENCIL → INK LOOP</p>
        <h2>
          Not a one-shot.
          <br />A back-and-forth.
        </h2>
        <p>
          The draft is a starting point.
          <br />
          Your taste gets the last word.
        </p>
      </div>
      <div className="loop-ledger">
        <article>
          <span className="step-number">01</span>
          <div>
            <h3>Start with what shipped.</h3>
            <p>
              Paste a product update. Name your cast. Keep the facts separate
              from the fictional dialogue.
            </p>
            <blockquote>
              “Deleted files can now be restored with Undo.”
            </blockquote>
          </div>
        </article>
        <article>
          <span className="step-number pencil-text">02</span>
          <div>
            <h3>The agent pencils it.</h3>
            <p>
              A four-panel draft in blue. Rewrite a balloon directly, change a
              face, or ask for a focused revision.
            </p>
          </div>
          <Comic panel={2} />
        </article>
        <article>
          <span className="step-number">03</span>
          <div>
            <h3>You make it ink.</h3>
            <p>
              Ink the changes you want. Erase the ones you don’t. Pick an ending
              and export your launch post.
            </p>
          </div>
          <Comic panel={3} />
        </article>
      </div>
    </section>
  );
}

const demoDescriptions: Record<LandingDemoStage, string> = {
  pencil:
    "A prepared agent proposal is blue. Nothing is final until you decide.",
  mine: "You inked this line and stamped it MINE. The agent cannot change it.",
  revised:
    "The expression and pose change in blue. Your protected line stays exactly the same.",
  ink: "Inked. You kept the new expression and pose; they now render in solid ink.",
  erase:
    "Erased. The original expression and pose return. Your MINE line never moved.",
};
function InkingDemo() {
  const [stage, setStage] = useState<LandingDemoStage>("pencil");
  return (
    <section id="how-it-works" className="landing-loop loop-b landing-width">
      <div className="demo-art">
        <Comic
          scene={demo[stage]}
          panel={0}
          label="Prepared interactive panel showing pencil, protection and review"
        />
        <p className="landing-disclosure">
          PREPARED INTERACTIVE EXAMPLE · NO AI REQUEST
        </p>
      </div>
      <div className="demo-copy">
        <p className="landing-kicker">TRY THE PENCIL → INK LOOP</p>
        <h2>
          A collaborator.
          <br />
          Not an eraser.
        </h2>
        <p>
          In the studio, paste an update and ask your connected agent for a
          draft. Here, explore prepared states from the real comic renderer.
        </p>
        <div
          className="demo-stages"
          aria-label="Explore prepared example states"
        >
          {(
            [
              ["pencil", "1. Pencil"],
              ["mine", "2. Stamp MINE"],
              ["revised", "3. Revise around it"],
            ] as const
          ).map(([value, text]) => (
            <Button
              key={value}
              variant="outline"
              aria-pressed={stage === value}
              onClick={() => setStage(value)}
            >
              {text}
            </Button>
          ))}
        </div>
        <p className="demo-status" aria-live="polite">
          {demoDescriptions[stage]}
        </p>
        <div className="demo-review">
          <Button
            variant="outline"
            disabled={stage !== "revised"}
            onClick={() => setStage("ink")}
          >
            <Check size={17} /> Ink
          </Button>
          <Button
            variant="outline"
            disabled={stage !== "revised"}
            onClick={() => setStage("erase")}
          >
            <X size={17} /> Erase
          </Button>
          <span>Review the blue changes.</span>
        </div>
        <p className="demo-after">
          Then choose one of three endings and take home a 1200 × 1200 PNG.
        </p>
      </div>
    </section>
  );
}
function LoopC() {
  return (
    <section id="how-it-works" className="landing-loop loop-c landing-width">
      <div className="loop-c-heading">
        <p className="landing-kicker">A LITTLE COMIC CRAFT</p>
        <h2>
          Keep the fact.
          <br />
          Find the funny.
        </h2>
        <p>
          The source says what shipped.
          <br />
          The characters make it a story.
        </p>
      </div>
      <div className="loop-c-body">
        <Comic panel={3} />
        <ol>
          <li>
            <b>Paste the update.</b>
            <span>
              Name your cast. Give your connected agent the facts, not a blank
              page.
            </span>
          </li>
          <li>
            <b>Pencil it together.</b>
            <span>
              Get four structured panels. Edit the lettering and expressions, or
              ask for a revision.
            </span>
          </li>
          <li>
            <b>Ink your favourite.</b>
            <span>
              Accept or erase changes. Choose from three endings. Export a
              square PNG for your post.
            </span>
          </li>
        </ol>
      </div>
    </section>
  );
}

function Protection({ direction }: { direction: Direction }) {
  return (
    <section className={`landing-protection protection-${direction}`}>
      <div className="landing-width protection-layout">
        <div className="protection-copy">
          <p className="landing-kicker">HUMAN INK HAS THE FINAL SAY.</p>
          <h2>
            Your line
            <br />
            stays yours.
          </h2>
          <p>
            Wrote a line you love? Stamp it{" "}
            <strong className="mine-inline">MINE</strong>. Protection is
            enforced in the shared actions, not just a note in a prompt. The
            agent can work around it, never over it.
          </p>
          <div className="review-explainer">
            <span>
              <Check size={18} /> <b>Ink</b> what works.
            </span>
            <span>
              <X size={18} /> <b>Erase</b> what doesn’t.
            </span>
          </div>
          <p className="protection-small">
            You can still edit or unlock your own work. Changed items stay blue
            until you review them.
          </p>
        </div>
        <div className="protection-example">
          <div className="protected-quote">
            <span className="mine-stamp">MINE</span>
            <p>
              “Just clearing
              <br />
              the old drafts.”
            </p>
            <span>YOUR LINE · SOLID INK</span>
          </div>
          <Comic scene={demo.revised} panel={0} />
          <p className="landing-disclosure">
            ILLUSTRATIVE REVISION · SAME LINE, DIFFERENT EXPRESSION
          </p>
        </div>
      </div>
    </section>
  );
}

function Agents({ direction }: { direction: Direction }) {
  return (
    <section className={`landing-agents agents-${direction} landing-width`}>
      <div className="agents-title">
        <p className="landing-kicker">SAME STUDIO. YOUR AGENT.</p>
        <h2>
          Works with
          <br />
          your agents.
        </h2>
        <p>
          Make the comic here. Or let an MCP-connected agent, such as Claude
          Code, author it and save it straight into Strip.
        </p>
        <a className="landing-text-link" href="/mcp/connect">
          Connect over MCP <ArrowRight size={17} />
        </a>
      </div>
      <div className="agents-flow">
        <div className="agent-path">
          <span>Your agent</span>
          <ArrowRight size={24} />
          <span>Shared actions</span>
          <ArrowRight size={24} />
          <span>Your Library</span>
        </div>
        <h3>
          It appears in the open app.
          <br />
          No refresh ritual.
        </h3>
        <p>
          The UI, in-app agent and MCP use the same validated actions. Sign in
          to the same account and workspace; the saved strip arrives through
          framework live sync.
        </p>
        <p className="agents-note">
          MCP transport and live sync are tested with illustrative data. A real
          Claude Code model session is not yet verified. Your agent host’s model
          connection and billing are separate.
        </p>
      </div>
    </section>
  );
}
function Closing({ direction }: { direction: Direction }) {
  return (
    <>
      <section className={`landing-closing closing-${direction}`}>
        <div className="landing-width closing-content">
          <p className="landing-kicker">
            SOMETHING SHIPPED. MAKE SOMETHING OF IT.
          </p>
          <h2>
            {direction === "b" ? (
              <>
                Your agent pencils.
                <br />
                You hold the pen.
              </>
            ) : direction === "c" ? (
              <>
                The update is out.
                <br />
                Now give it a story.
              </>
            ) : (
              <>
                Less release note.
                <br />
                More comic strip.
              </>
            )}
          </h2>
          <Cta />
          <p>
            Connect an AI engine in the studio to draft.
            <br />
            No connection? We’ll help you set one up, not fake a result.
          </p>
        </div>
      </section>
      <footer className="landing-footer landing-width">
        <a className="landing-wordmark" href="/">
          Strip.
        </a>
        <p>
          Built with <a href="https://agent-native.dev">Agent-Native</a>
          <br />
          <a href="https://www.openpeeps.com/">Open Peeps</a> CC0 · Bricolage
          Grotesque &amp; Comic Neue OFL
        </p>
        <span>
          A SMALL COMIC.
          <br />
          MADE TOGETHER.
        </span>
      </footer>
    </>
  );
}

export default function LandingOptions({
  direction,
}: {
  direction: Direction;
}) {
  return (
    <main className={`landing-option-page direction-${direction}`}>
      <a className="landing-skip" href="#how-it-works">
        Skip to how it works
      </a>
      <div className="landing-top">
        <Header direction={direction} />
        <Hero direction={direction} />
      </div>
      {direction === "a" ? (
        <LoopA />
      ) : direction === "b" ? (
        <InkingDemo />
      ) : (
        <LoopC />
      )}
      <Protection direction={direction} />
      <Agents direction={direction} />
      <Closing direction={direction} />
    </main>
  );
}
