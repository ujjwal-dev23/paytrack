import { useState, useRef, useEffect } from "preact/hooks";

interface Option {
  id: string | number;
  label: string;
  sublabel?: string;
}

interface AutocompleteProps {
  label: string;
  options: Option[];
  value: string | number;
  onSelect: (option: Option) => void;
  onAddOne?: (query: string) => void;
  placeholder?: string;
  required?: boolean;
  name?: string;
}

export function Autocomplete({
  label,
  options,
  value,
  onSelect,
  onAddOne,
  placeholder,
  required,
  name,
}: AutocompleteProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find((opt) => opt.id === value);

  useEffect(() => {
    if (selectedOption) {
      setQuery(selectedOption.label);
    }
  }, [selectedOption]);

  const filteredOptions = query
    ? options.filter(
        (opt) =>
          opt.label.toLowerCase().includes(query.toLowerCase()) ||
          opt.sublabel?.toLowerCase().includes(query.toLowerCase()),
      )
    : options;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        // Reset query to selected option label if not selecting
        if (selectedOption) {
          setQuery(selectedOption.label);
        } else {
          setQuery("");
        }
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [selectedOption]);

  const handleSelect = (option: Option) => {
    onSelect(option);
    setQuery(option.label);
    setIsOpen(false);
  };

  return (
    <div className="w-full" ref={containerRef}>
      <label className="label">
        {label}
        {required && <span className="text-primary ml-0.5">*</span>}
      </label>
      <div className="relative">
        <input
          type="text"
          className="input-field pr-10"
          placeholder={placeholder}
          value={query}
          onInput={(e) => {
            setQuery((e.target as HTMLInputElement).value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          required={required}
        />
        <input type="hidden" name={name} value={value} />
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
          <svg
            className="text-text-muted h-4 w-4 opacity-50"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>

        {isOpen && (filteredOptions.length > 0 || query) && (
          <div className="bg-card border-border rounded-custom animate-in fade-in zoom-in-95 absolute z-50 mt-1 max-h-60 w-full overflow-auto border p-1 shadow-xl duration-100 outline-none">
            {filteredOptions.length > 0 ? (
              filteredOptions.map((option) => (
                <button
                  key={option.id}
                  type="button"
                  className={`hover:bg-primary/5 flex w-full flex-col items-start rounded-md px-3 py-2 text-left text-sm transition-colors ${
                    value === option.id ? "bg-primary/10 text-primary" : "text-text-main"
                  }`}
                  onClick={() => handleSelect(option)}
                >
                  <span className="font-medium">{option.label}</span>
                  {option.sublabel && (
                    <span className="text-text-muted text-[10px] opacity-80">{option.sublabel}</span>
                  )}
                </button>
              ))
            ) : onAddOne && query ? (
              <button
                type="button"
                className="text-primary hover:bg-primary/10 flex w-full items-center gap-2 rounded-md px-3 py-3 text-left text-sm font-semibold transition-colors"
                onClick={() => {
                  onAddOne(query);
                  setIsOpen(false);
                }}
              >
                <div className="bg-primary/10 flex h-6 w-6 items-center justify-center rounded-full">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-3.5 w-3.5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2.5}
                      d="M12 4v16m8-8H4"
                    />
                  </svg>
                </div>
                <span>Add &quot;{query}&quot; as new customer</span>
              </button>
            ) : (
              <div className="text-text-muted px-3 py-4 text-center text-sm italic">
                No results found
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
