import { useId, useState } from 'react';

// A list of short text values as removable chips. Enter (or comma) adds
// the typed value; × removes one; Backspace on an empty input removes the
// last. `suggestions` feed a datalist, so existing values autocomplete and
// filters don't fragment on typos.
export function ChipInput({ value = [], onChange, suggestions = [], placeholder, id, allowComma = true }) {
  const [draft, setDraft] = useState('');
  const listId = useId();

  const add = (raw) => {
    const v = raw.trim();
    if (!v) return;
    // Reuse an existing suggestion's spelling when only the case differs.
    const match = suggestions.find((s) => s.toLowerCase() === v.toLowerCase());
    const next = match || v;
    if (!value.some((x) => x.toLowerCase() === next.toLowerCase())) onChange([...value, next]);
    setDraft('');
  };

  const onKeyDown = (e) => {
    if (e.key === 'Enter' || (allowComma && e.key === ',')) {
      e.preventDefault();
      add(draft);
    } else if (e.key === 'Backspace' && !draft && value.length) {
      onChange(value.slice(0, -1));
    }
  };

  const remaining = suggestions.filter((s) => !value.some((v) => v.toLowerCase() === s.toLowerCase()));

  return (
    <div className="chip-input">
      {value.length > 0 && (
        <ul className="chip-list">
          {value.map((v) => (
            <li key={v} className="chip-item">
              <span>{v}</span>
              <button
                type="button"
                aria-label={`Remove ${v}`}
                onClick={() => onChange(value.filter((x) => x !== v))}
              >
                ×
              </button>
            </li>
          ))}
        </ul>
      )}
      <input
        id={id}
        value={draft}
        list={remaining.length ? listId : undefined}
        onChange={(e) => setDraft(e.target.value)}
        onKeyDown={onKeyDown}
        onBlur={() => add(draft)}
        placeholder={placeholder}
      />
      {remaining.length > 0 && (
        <datalist id={listId}>
          {remaining.map((s) => (
            <option key={s} value={s} />
          ))}
        </datalist>
      )}
    </div>
  );
}
