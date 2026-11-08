import { useActionQuery } from "@agent-native/core/client/hooks";
import { ArrowRight, Plus } from "lucide-react";
import { Link } from "react-router";

import { Button } from "@/components/ui/button";
import { textMeasurer } from "@/lib/strip-canvas";

import { renderStripSvg, type SceneAssets } from "../../../shared/render-strip";
import { posterSpecimen } from "./specimen";

export function Library({ assets }: { assets: SceneAssets | undefined }) {
  const query = useActionQuery("list-strips", {});
  return (
    <main className="strip-library">
      <header className="studio-topbar">
        <Link className="strip-wordmark" to="/">
          <img src="/logo.svg" width="253" height="95" alt="Strip" />
        </Link>
        <h1>Your strips</h1>
        <Button asChild className="print-button">
          <Link to="/home?new=1">
            <Plus size={16} />
            New strip
          </Link>
        </Button>
      </header>
      <section className="library-body">
        <p className="eyebrow">THE WORK, IN INK AND PENCIL.</p>
        {query.isLoading && <p role="status">Opening your library…</p>}
        {query.error && (
          <p role="alert">
            Couldn’t load your strips.{" "}
            <Button variant="ghost" onClick={() => query.refetch()}>
              Try again
            </Button>
          </p>
        )}
        {query.data?.length === 0 && (
          <div className="library-empty">
            <h2>Your first page is waiting.</h2>
            <p>
              One product update. Four panels. Make something worth sharing.
            </p>
            <Button asChild className="print-button">
              <Link to="/home?new=1">
                New strip <ArrowRight size={18} />
              </Link>
            </Button>
            <figure className="library-example">
              <div
                className="library-thumbnail"
                aria-label="Prepared illustrative Undo comic"
                dangerouslySetInnerHTML={{
                  __html: assets
                    ? renderStripSvg(posterSpecimen(), assets, textMeasurer())
                        .svg
                    : "",
                }}
              />
              <figcaption>
                ONE PREPARED EXAMPLE · ILLUSTRATIVE, NOT GENERATED
              </figcaption>
            </figure>
          </div>
        )}
        <div className="library-grid">
          {query.data?.map((strip) => (
            <Link
              className="library-strip"
              key={strip.id}
              to={`/home?id=${strip.id}`}
            >
              <div
                className="library-thumbnail"
                aria-hidden="true"
                dangerouslySetInnerHTML={{
                  __html: assets
                    ? renderStripSvg(strip, assets, textMeasurer()).svg
                    : "",
                }}
              />
              <h2>{strip.draft.title}</h2>
              <p>
                {strip.origin === "prepared-example"
                  ? "Illustrative / seeded"
                  : "Your strip"}{" "}
                · Rev {strip.revision}
              </p>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}
