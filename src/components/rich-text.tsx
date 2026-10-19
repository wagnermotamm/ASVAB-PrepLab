"use client";

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export function RichText({
  text,
  terms,
  onTerm,
}: {
  text: string;
  terms: string[];
  onTerm: (term: string, rect: DOMRect) => void;
}) {
  const unique = [...new Set(terms.map((term) => term.trim()).filter((term) => term.length > 2))];
  if (!unique.length) return <>{text}</>;
  const pattern = new RegExp(`\\b(${unique.sort((a, b) => b.length - a.length).map(escapeRegExp).join("|")})\\b`, "gi");
  const parts = text.split(pattern);
  return (
    <>
      {parts.map((part, index) => {
        const term = unique.find((item) => item.toLowerCase() === part.toLowerCase());
        if (!term) return <span key={`${part}-${index}`}>{part}</span>;
        return (
          <button
            key={`${part}-${index}`}
            type="button"
            className="term"
            onClick={(event) => { event.stopPropagation(); onTerm(term, event.currentTarget.getBoundingClientRect()); }}
          >
            {part}
          </button>
        );
      })}
    </>
  );
}
