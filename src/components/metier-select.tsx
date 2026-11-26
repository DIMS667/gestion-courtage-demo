import { useEffect, useId, useRef, useState, type KeyboardEvent } from "react";
import { Popover } from "radix-ui";
import { Check, ChevronsUpDown, Search } from "lucide-react";
import { filtrerMetiers, trouverMetier, type Metier } from "../services/metiers";
import "./metier-select.css";

interface MetierSelectProps {
  id: string;
  value: string;
  onChange: (metier: Metier) => void;
  required?: boolean;
  disabled?: boolean;
  invalid?: boolean;
  describedBy?: string;
}

export function MetierSelect({ id, value, onChange, required, disabled, invalid, describedBy }: MetierSelectProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const listId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const options = filtrerMetiers(query);
  const selected = trouverMetier(value);

  useEffect(() => {
    if (open) listRef.current?.querySelector<HTMLElement>('[data-active="true"]')?.scrollIntoView({ block: "nearest" });
  }, [open, active, query]);

  const changeOpen = (next: boolean) => {
    setOpen(next);
    if (next) {
      setQuery("");
      setActive(Math.max(0, filtrerMetiers("").findIndex(option => option.code === selected?.code)));
    }
  };
  const choose = (metier: Metier) => { onChange(metier); setOpen(false); };
  const keyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      if (options.length) setActive(index => (index + (event.key === "ArrowDown" ? 1 : -1) + options.length) % options.length);
    } else if (event.key === "Enter") {
      event.preventDefault();
      if (options[active]) choose(options[active]);
    }
  };

  return <Popover.Root open={open} onOpenChange={changeOpen}>
    <Popover.Trigger asChild>
      <button id={id} type="button" className="metier-select-trigger" role="combobox" aria-expanded={open}
        aria-haspopup="listbox" aria-controls={open ? listId : undefined} aria-required={required || undefined}
        aria-invalid={invalid || undefined} aria-describedby={describedBy} disabled={disabled}
        onKeyDown={event => { if (event.key === "ArrowDown" || event.key === "ArrowUp") { event.preventDefault(); changeOpen(true); } }}>
        <span className={value ? undefined : "metier-select-placeholder"}>{selected?.libelle || value || "Choisir un métier"}</span>
        <ChevronsUpDown size={16} aria-hidden="true" />
      </button>
    </Popover.Trigger>
    <Popover.Portal>
      <Popover.Content className="metier-select-popup" align="start" sideOffset={5} collisionPadding={12}
        onOpenAutoFocus={event => { event.preventDefault(); inputRef.current?.focus(); }}
        onEscapeKeyDown={event => event.stopPropagation()}>
        <div className="metier-select-search"><Search size={17} aria-hidden="true" /><input ref={inputRef} type="search"
          className="metier-select-search-input" aria-label="Rechercher un métier" placeholder="Rechercher un métier…"
          autoComplete="off" value={query} onChange={event => { setQuery(event.target.value); setActive(0); }}
          aria-controls={listId} aria-activedescendant={options[active] ? `${listId}-${active}` : undefined} onKeyDown={keyDown} /></div>
        <div id={listId} ref={listRef} className="metier-select-options" role="listbox" aria-label="Métiers">
          {options.map((metier, index) => <button key={metier.code} id={`${listId}-${index}`} type="button"
            className="metier-select-option" role="option" aria-selected={selected?.code === metier.code}
            data-active={index === active} tabIndex={-1} onMouseMove={() => setActive(index)}
            onMouseDown={event => event.preventDefault()} onClick={() => choose(metier)}>
            <span>{metier.libelle}</span>{selected?.code === metier.code && <Check size={16} aria-hidden="true" />}
          </button>)}
          {!options.length && <p className="metier-select-empty">Aucun métier trouvé. Essayez un autre mot.</p>}
        </div>
        <p className="metier-select-count" role="status">{options.length} métier{options.length > 1 ? "s" : ""}</p>
      </Popover.Content>
    </Popover.Portal>
  </Popover.Root>;
}
