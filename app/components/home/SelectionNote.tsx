import { ArrowRight, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

export function SelectionNote({
  phone = false,
  label,
  value,
  onChange,
  onSend,
  onClose,
  working,
  canChat,
}: {
  phone?: boolean;
  label: string;
  value: string;
  onChange: (value: string) => void;
  onSend: (value: string) => void;
  onClose: () => void;
  working: boolean;
  canChat: boolean;
}) {
  const id = phone ? "phone-selection-ask" : "selection-ask";
  return (
    <div
      className="selection-note"
      onKeyDown={(e) => {
        if (e.key === "Escape") onClose();
      }}
    >
      <div className="note-heading">
        <p className="eyebrow">A NOTE FOR THE AGENT</p>
        {phone && (
          <Button size="sm" variant="ghost" onClick={onClose}>
            <X size={14} /> Close note
          </Button>
        )}
      </div>
      <div className="option-list">
        {["Funnier", "Shorter", "More innocent", "Show the feature"].map(
          (chip) => (
            <Button variant="outline" key={chip} onClick={() => onChange(chip)}>
              {chip}
            </Button>
          ),
        )}
      </div>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (value.trim()) {
            onSend(value.trim());
            onClose();
          }
        }}
      >
        <label htmlFor={id}>About {label}</label>
        <Textarea
          id={id}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          maxLength={600}
          placeholder="Keep my line, but make the reaction drier…"
          rows={3}
          required
        />
        <Button type="submit" disabled={!value.trim() || working}>
          Send to agent <ArrowRight size={16} />
        </Button>
        {!canChat && (
          <p className="setup-note">
            No AI connected. Opens your note in the real desk without
            submitting.
          </p>
        )}
      </form>
    </div>
  );
}
