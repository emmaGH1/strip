import { ArrowRight, PencilLine } from "lucide-react";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { loadSceneAssets, textMeasurer } from "@/lib/strip-canvas";

import { preparedExamples } from "../../../shared/examples";
import { renderStripSvg } from "../../../shared/render-strip";
import { applyEdits, type Strip } from "../../../shared/strip";

// A labelled illustrative specimen, using the same attribution and rendering as Studio.
export function posterSpecimen(): Strip {
  const base: Strip = {
    id: "illustrative-poster",
    revision: 0,
    draft: structuredClone(preparedExamples[0]!),
    protectedIds: [preparedExamples[0]!.panels[0]!.balloons[0]!.id],
    origin: "prepared-example",
    lastEditedBy: "human",
    updatedAt: "",
  };
  const panel = base.draft.panels[2]!;
  panel.screenState = "undo";
  return applyEdits(
    base,
    0,
    [{ kind: "screen-state", id: panel.id, screenState: "restored" }],
    "agent",
  );
}
export default function Poster() {
  const [svg, setSvg] = useState("");
  const [error, setError] = useState("");
  useEffect(() => {
    loadSceneAssets()
      .then((assets) =>
        setSvg(renderStripSvg(posterSpecimen(), assets, textMeasurer()).svg),
      )
      .catch(() => setError("The illustrative artwork could not load."));
  }, []);
  return (
    <main className="poster">
      <header className="poster-header">
        <a className="strip-wordmark" href="/" aria-label="Strip home">
          Strip<span>.</span>
        </a>
        <span>A SMALL COMIC. A BIGGER POINT.</span>
      </header>
      <div className="poster-body">
        <section className="poster-copy">
          <p className="eyebrow">YOUR NEXT LAUNCH POST, WITH CHARACTER.</p>
          <h1>
            Release notes
            <br />
            nobody reads?
            <br />
            <em>Ship a strip.</em>
          </h1>
          <p className="poster-deck">
            One product update. Four panels.
            <br />
            Pencilled by your agent. Inked by you.
          </p>
          <Button className="print-button" asChild>
            <a href="/sign-in">
              Make a strip <ArrowRight size={20} />
            </a>
          </Button>
        </section>
        <section className="poster-proof" aria-label="Illustrative comic">
          <div className="proof-note">
            <PencilLine size={16} /> A little back-and-forth makes it yours.
          </div>
          <div
            className="poster-art"
            dangerouslySetInnerHTML={{ __html: svg }}
          />
          {error && <p role="alert">{error}</p>}
          <p className="specimen-label">
            ILLUSTRATIVE STRIP · FICTIONAL DIALOGUE
          </p>
        </section>
      </div>
      <footer className="poster-loop">
        <span>
          <b>01</b> Paste an update
        </span>
        <ArrowRight />
        <span>
          <b>02</b> The agent pencils it
        </span>
        <ArrowRight />
        <span>
          <b>03</b> You ink it
        </span>
      </footer>
    </main>
  );
}
