import { ArrowRight, Check, PencilLine, X } from "lucide-react";
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
import { posterSpecimen } from "./specimen";

import "../../landing.css";

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

/** Approved path-only wordmark: the custom upright S is the first letter. */
export function HeaderLogo() {
  return (
    <a className="landing-wordmark" href="/" aria-label="Strip home">
      <img src="/logo.svg" width="253" height="95" alt="Strip" />
    </a>
  );
}

function Header() {
  return (
    <header className="landing-header landing-width">
      <HeaderLogo />
      <span className="landing-masthead">
        A COMICS STUDIO FOR WHAT SHIPPED.
      </span>
      <a className="landing-text-link" href="/home">
        Open the studio <ArrowRight size={16} />
      </a>
    </header>
  );
}

function Hero() {
  return (
    <section className="landing-hero landing-width">
      <div className="hero-copy">
        <p className="landing-kicker">YOUR NEXT LAUNCH POST, WITH CHARACTER.</p>
        <h1>
          Release notes
          <br />
          nobody reads?
          <br />
          <em>Ship a strip.</em>
        </h1>
        <p className="landing-deck">
          One product update. Four panels.
          <br />A comic you and your agent make together.
        </p>
        <Cta />
        <p className="hero-footnote">
          Real edits. Protected lines. A PNG that’s yours.
        </p>
      </div>
      <figure className="hero-art">
        <Comic />
        <figcaption>
          <span>ILLUSTRATIVE UPDATE · FICTIONAL DIALOGUE</span>
          <span className="proof-key">
            <i className="pencil-key" /> Agent pencil <i className="ink-key" />{" "}
            Your ink
          </span>
        </figcaption>
      </figure>
    </section>
  );
}

function Loop() {
  return (
    <section id="how-it-works" className="l-section tone-paper-2">
      <div className="landing-width loop-grid">
        <div className="section-intro">
          <p className="landing-kicker">THE PENCIL → INK LOOP</p>
          <h2>
            Not a one-shot.
            <br />A back-and-forth.
          </h2>
          <p className="section-lede">
            The draft is a starting point.
            <br />
            Your taste gets the last word.
          </p>
        </div>
        <ol className="loop-ledger">
          <li>
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
          </li>
          <li>
            <span className="step-number pencil-text">02</span>
            <div>
              <h3>The agent pencils it.</h3>
              <p>
                A four-panel draft in blue. Rewrite a balloon directly, change a
                face, or ask for a focused revision.
              </p>
            </div>
            <Comic panel={2} className="loop-thumb" />
          </li>
          <li>
            <span className="step-number">03</span>
            <div>
              <h3>You make it ink.</h3>
              <p>
                Ink the changes you want. Erase the ones you don’t. Pick an
                ending and export your launch post.
              </p>
            </div>
            <Comic panel={3} className="loop-thumb" />
          </li>
        </ol>
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
    <section className="l-section tone-paper">
      <div className="landing-width demo-grid">
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
          <p className="section-lede">
            In the studio, paste an update and ask your connected agent for a
            draft. Here, explore prepared states from the real comic renderer.
          </p>
          <div
            className="demo-stages"
            role="group"
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
      </div>
    </section>
  );
}

function Protection() {
  return (
    <section className="l-section tone-ink">
      <div className="landing-width two-col protection-layout">
        <div className="protection-example">
          <Comic scene={demo.revised} panel={0} />
          <p className="landing-disclosure">
            ILLUSTRATIVE REVISION · SAME LINE, DIFFERENT EXPRESSION
          </p>
        </div>
        <div className="protection-copy">
          <p className="landing-kicker">HUMAN INK HAS THE FINAL SAY.</p>
          <h2>
            Your line
            <br />
            stays yours.
          </h2>
          <p className="section-lede">
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
          <p className="small-print">
            You can still edit or unlock your own work. Changed items stay blue
            until you review them.
          </p>
        </div>
      </div>
    </section>
  );
}

function Agents() {
  return (
    <section className="l-section tone-paper-2">
      <div className="landing-width two-col agents-layout">
        <div className="agents-title">
          <p className="landing-kicker">SAME STUDIO. YOUR AGENT.</p>
          <h2>
            Works with
            <br />
            your agents.
          </h2>
          <p className="section-lede">
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
            <ArrowRight size={22} />
            <span>Shared actions</span>
            <ArrowRight size={22} />
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
          <p className="small-print">
            Connect Claude Code over MCP with your own Strip account; the saved
            strip arrives through live sync. Your agent host’s model and billing
            are separate.
          </p>
        </div>
      </div>
    </section>
  );
}

function Closing() {
  return (
    <>
      <section className="l-section tone-signal">
        <div className="landing-width closing-content">
          <div>
            <p className="landing-kicker">
              SOMETHING SHIPPED. MAKE SOMETHING OF IT.
            </p>
            <h2>
              Your agent pencils.
              <br />
              You hold the pen.
            </h2>
            <Cta />
          </div>
          <p className="small-print">
            Connect an AI engine in the studio to draft.
            <br />
            No connection? We’ll help you set one up, not fake a result.
          </p>
        </div>
      </section>
      <footer className="landing-footer landing-width">
        <HeaderLogo />
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

export default function Landing() {
  return (
    <main className="landing-page">
      <a className="landing-skip" href="#how-it-works">
        Skip to how it works
      </a>
      <div className="tone-paper">
        <Header />
        <Hero />
      </div>
      <Loop />
      <InkingDemo />
      <Protection />
      <Agents />
      <Closing />
    </main>
  );
}
