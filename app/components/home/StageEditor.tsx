import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import {
  screenSchema,
  sfxSchema,
  type Panel,
  type Edit,
} from "../../../shared/strip";

export function StageEditor({
  panel,
  onSave,
  busy,
}: {
  panel: Panel;
  onSave: (edits: Edit[]) => void;
  busy: boolean;
}) {
  const [error, setError] = useState("");
  const spec = panel.screen;
  return (
    <form
      className="stage-editor"
      onSubmit={(event) => {
        event.preventDefault();
        const data = new FormData(event.currentTarget);
        const screen = screenSchema.safeParse({
          kind: data.get("kind"),
          title: data.get("title"),
          lines: [data.get("line1"), data.get("line2")].filter(Boolean),
          button: data.get("button") || undefined,
          tone: data.get("tone"),
        });
        const sfx = sfxSchema.safeParse(data.get("sfx"));
        if (!screen.success || !sfx.success) {
          setError(
            "Keep screen copy short and SFX to three words / 14 characters.",
          );
          return;
        }
        setError("");
        onSave([
          { kind: "screen", id: panel.id, screen: screen.data },
          { kind: "sfx", id: panel.id, sfx: sfx.data },
          {
            kind: "prop",
            id: panel.id,
            prop: data.get("prop") as Panel["prop"],
          },
        ]);
      }}
    >
      <h3>Show it on the page</h3>
      <label>
        Prop
        <select name="prop" defaultValue={panel.prop}>
          {["laptop", "phone", "files", "coffee", "none"].map((value) => (
            <option key={value}>{value}</option>
          ))}
        </select>
      </label>
      <label>
        Screen
        <select name="kind" defaultValue={spec?.kind ?? "none"}>
          {screenSchema.shape.kind.options.map((kind) => (
            <option key={kind}>{kind}</option>
          ))}
        </select>
      </label>
      <label>
        Tone
        <select name="tone" defaultValue={spec?.tone ?? "normal"}>
          {["normal", "error", "success"].map((tone) => (
            <option key={tone}>{tone}</option>
          ))}
        </select>
      </label>
      <label>
        Screen title
        <Input name="title" defaultValue={spec?.title ?? ""} maxLength={24} />
      </label>
      <label>
        Line 1
        <Input
          name="line1"
          defaultValue={spec?.lines[0] ?? ""}
          maxLength={28}
        />
      </label>
      <label>
        Line 2
        <Input
          name="line2"
          defaultValue={spec?.lines[1] ?? ""}
          maxLength={28}
        />
      </label>
      <label>
        Button · optional
        <Input name="button" defaultValue={spec?.button ?? ""} maxLength={14} />
      </label>
      <label>
        Sound effect · optional
        <Input
          name="sfx"
          defaultValue={panel.sfx ?? ""}
          maxLength={14}
          placeholder="CRASH!"
        />
      </label>
      {error && <p role="alert">{error}</p>}
      <Button type="submit" disabled={busy}>
        Save staging
      </Button>
    </form>
  );
}
