import { PencilLine } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import {
  archetypes,
  archetypeFor,
  castSchema,
  type Cast,
  type CharacterId,
} from "../../../shared/casting";

export function CastCards({
  people,
  editable = false,
  onSave,
  saved = false,
}: {
  people: Cast;
  editable?: boolean;
  onSave?: (people: Cast, character: CharacterId) => void;
  saved?: boolean;
}) {
  const [editing, setEditing] = useState<CharacterId>();
  const [error, setError] = useState("");
  return (
    <div className="cast-cards">
      {Object.entries(people)
        .filter(([, person]) => person)
        .map(([key, person]) => {
          const id = key as CharacterId;
          const archetype = archetypeFor({ cast: people }, id);
          return (
            <article className="cast-card" key={id}>
              <div className="cast-card-summary">
                <img
                  src={`/peeps/${archetype}-happy-standing.svg`}
                  alt={`${archetypes[archetype].label} portrait`}
                />
                <div>
                  <span className="eyebrow">{archetypes[archetype].label}</span>
                  <h3>{person!.name}</h3>
                  <p>{person!.role}</p>
                </div>
              </div>
              {editable && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setEditing(editing === id ? undefined : id);
                    setError("");
                  }}
                >
                  <PencilLine size={14} />
                  Recast {person!.name}
                </Button>
              )}
              {editing === id && (
                <form
                  className="recast-form"
                  onSubmit={(event) => {
                    event.preventDefault();
                    const data = new FormData(event.currentTarget);
                    const parsed = castSchema.safeParse({
                      ...people,
                      [id]: {
                        archetype: data.get("archetype"),
                        name: data.get("name"),
                        role: data.get("role"),
                      },
                    });
                    if (!parsed.success) {
                      setError(
                        "Give this character a name and a short comic trait.",
                      );
                      return;
                    }
                    onSave?.(parsed.data, id);
                    setEditing(undefined);
                  }}
                >
                  <label>
                    Archetype
                    <select name="archetype" defaultValue={archetype}>
                      {Object.entries(archetypes).map(([value, option]) => (
                        <option value={value} key={value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label>
                    Name
                    <Input
                      name="name"
                      defaultValue={person!.name}
                      maxLength={30}
                      required
                    />
                  </label>
                  <label>
                    Comic trait
                    <Input
                      name="role"
                      defaultValue={person!.role}
                      maxLength={120}
                      required
                    />
                  </label>
                  <Button size="sm" type="submit">
                    {saved ? "Save & adapt affected lines" : "Save cast"}
                  </Button>
                  {saved && (
                    <p className="rail-footnote">
                      The real agent adapts only this character’s unprotected
                      lines. No AI connected? We keep a setup prefill.
                    </p>
                  )}
                  {error && <p role="alert">{error}</p>}
                </form>
              )}
            </article>
          );
        })}
    </div>
  );
}
