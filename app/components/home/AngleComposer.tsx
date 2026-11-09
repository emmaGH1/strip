import {
  useActionMutation,
  useActionQuery,
  actionErrorMessage,
} from "@agent-native/core/client/hooks";
import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

import type { AnglePlan } from "../../../shared/angles";
import type { Cast } from "../../../shared/casting";
import { illustrativeAngles } from "../../../shared/v2-fixture";
import { CastCards } from "./CastCards";

export function AngleCards({
  angles,
  selectedId,
  onChoose,
}: {
  angles: AnglePlan["angles"];
  selectedId?: string | undefined;
  onChoose: (id: string) => void;
}) {
  return (
    <div className="angle-cards">
      {angles.map((angle, index) => (
        <article
          className="angle-card"
          data-selected={selectedId === angle.id}
          key={angle.id}
        >
          <span className="eyebrow">ANGLE 0{index + 1}</span>
          <h3>{angle.premise}</h3>
          <p>
            <b>The twist</b> · {angle.irony}
          </p>
          <div className="angle-cast-preview">
            {Object.entries(angle.cast)
              .filter(([, person]) => person)
              .map(([id, person]) => (
                <div key={id}>
                  <img
                    src={`/peeps/${person!.archetype ?? (id === "ari" ? "power-user" : "product-manager")}-happy-standing.svg`}
                    alt=""
                  />
                  <span>
                    {person!.name}
                    <small>{person!.archetype?.replace(/-/gu, " ")}</small>
                  </span>
                </div>
              ))}
          </div>
          <Button
            variant={selectedId === angle.id ? "secondary" : "outline"}
            onClick={() => onChoose(angle.id)}
          >
            {selectedId === angle.id ? "Selected" : "Pick this angle"}
          </Button>
        </article>
      ))}
    </div>
  );
}

export function AngleComposer({
  source,
  onSource,
  illustrative,
  onIllustrative,
  onAsk,
}: {
  source: string;
  onSource: (value: string) => void;
  illustrative: boolean;
  onIllustrative: (value: boolean) => void;
  onAsk: (request: string, context: Record<string, unknown>) => void;
}) {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const planId = params.get("plan") ?? "";
  const query = useActionQuery(
    "get-strip-plan",
    { id: planId },
    { enabled: Boolean(planId) },
  );
  const choose = useActionMutation("choose-strip-angle");
  const propose = useActionMutation("propose-strip-angles");
  const [plan, setPlan] = useState<AnglePlan>();
  const [premise, setPremise] = useState("");
  const [people, setPeople] = useState<Cast>();
  const [error, setError] = useState("");
  useEffect(() => {
    setPlan(query.data);
  }, [query.data, planId]);
  const selected = plan?.angles.find(
    (angle) => angle.id === plan.selectedAngleId,
  );
  useEffect(() => {
    setPremise(selected?.premise ?? "");
    setPeople(selected?.cast);
  }, [selected]);
  async function select(angleId: string) {
    if (!plan) return;
    setError("");
    try {
      setPlan(
        await choose.mutateAsync({
          id: plan.id,
          expectedRevision: plan.revision,
          angleId,
        }),
      );
    } catch (e) {
      setError(
        actionErrorMessage(e) ??
          "Could not choose that angle. Please try again.",
      );
      await query.refetch();
    }
  }
  async function saveCast(cast: Cast) {
    if (!plan || !selected) return;
    setError("");
    try {
      setPlan(
        await choose.mutateAsync({
          id: plan.id,
          expectedRevision: plan.revision,
          angleId: selected.id,
          premise,
          cast,
        }),
      );
    } catch (e) {
      setError(
        actionErrorMessage(e) ??
          "Could not save this cast. Read the latest choice and try again.",
      );
      await query.refetch();
    }
  }
  async function draft() {
    if (!plan || !selected || !people) return;
    setError("");
    try {
      const saved = await choose.mutateAsync({
        id: plan.id,
        expectedRevision: plan.revision,
        angleId: selected.id,
        premise,
        cast: people,
      });
      setPlan(saved);
      onAsk("Draft the strip for my chosen angle.", {
        planId: saved.id,
        expectedPlanRevision: saved.revision,
        selectedAngleId: saved.selectedAngleId,
        inputKind: saved.inputKind,
      });
    } catch (e) {
      setError(
        actionErrorMessage(e) ??
          "The angle changed. Read the latest choice and try again.",
      );
      await query.refetch();
    }
  }
  async function sample() {
    try {
      const { source: update, inputKind, angles } = illustrativeAngles;
      const saved = await propose.mutateAsync({
        source: update,
        inputKind,
        angles,
      });
      navigate(`/home?new=1&plan=${saved.id}`);
    } catch (e) {
      setError(
        actionErrorMessage(e) ?? "Could not open the illustrative cards.",
      );
    }
  }
  return (
    <section className="angle-composer">
      <p className="eyebrow">01 / FIND THE JOKE. THEN DRAW IT.</p>
      <h1>{plan ? "Which story is yours?" : "What shipped?"}</h1>
      {plan ? (
        <>
          <p className="source-kind">
            {plan.inputKind === "illustrative"
              ? "ILLUSTRATIVE / HAND-AUTHORED SAMPLE"
              : "ANGLES FOR YOUR UPDATE"}
          </p>
          <details>
            <summary>The source update</summary>
            <p className="source-quote">{plan.source}</p>
          </details>
          <p>
            Pick a premise, not a paraphrase. Each angle brings its own cast.
          </p>
          <AngleCards
            angles={plan.angles}
            selectedId={plan.selectedAngleId}
            onChoose={(id) => void select(id)}
          />
          {selected && people && (
            <section className="chosen-angle">
              <p className="eyebrow">02 / MAKE IT YOURS.</p>
              <label htmlFor="chosen-premise">The premise · editable</label>
              <Textarea
                id="chosen-premise"
                value={premise}
                maxLength={180}
                onChange={(e) => setPremise(e.target.value)}
              />
              <h2>Cast for this story</h2>
              <CastCards
                people={people}
                editable
                onSave={(cast) => void saveCast(cast)}
              />
              <Button
                className="print-button"
                disabled={choose.isPending || premise.trim().length < 5}
                onClick={() => void draft()}
              >
                Draft this angle →
              </Button>
              <p className="rail-footnote">
                A real agent request. No connected AI? Your chosen angle stays
                saved while you connect.
              </p>
            </section>
          )}
          <Button variant="ghost" onClick={() => navigate("/home?new=1")}>
            Start with another update
          </Button>
        </>
      ) : (
        <form
          onSubmit={(event) => {
            event.preventDefault();
            onAsk(
              `Find three comic angles for this update:\n${source.trim()}`,
              {
                inputKind: illustrative ? "illustrative" : "user-provided",
                workflow: "angles-first",
              },
            );
          }}
        >
          <p>One small product change. Three ways to find the funny.</p>
          <label htmlFor="new-source">What shipped? · The source update</label>
          <Textarea
            id="new-source"
            value={source}
            onChange={(e) => onSource(e.target.value)}
            maxLength={5000}
            rows={5}
            required
            placeholder="Paste the release note, bug fix or product update…"
          />
          <label className="illustrative-check">
            <input
              type="checkbox"
              checked={illustrative}
              onChange={(e) => onIllustrative(e.target.checked)}
            />
            This is an illustrative update
          </label>
          <Button
            className="print-button"
            type="submit"
            disabled={source.trim().length < 5}
          >
            Find the joke →
          </Button>
          <p className="rail-footnote">
            The agent proposes angles. You pick one before it drafts.
          </p>
        </form>
      )}
      {query.isLoading && <p role="status">Opening your angle cards…</p>}
      {(error || query.error) && (
        <p role="alert">
          {error ||
            actionErrorMessage(query.error) ||
            "Could not read the saved angle plan."}
        </p>
      )}
      {!plan && (
        <div className="try-example">
          <span>Prepared, not AI-generated.</span>
          <Button
            variant="outline"
            disabled={propose.isPending}
            onClick={() => void sample()}
          >
            Explore illustrative Slack angles
          </Button>
        </div>
      )}
    </section>
  );
}
