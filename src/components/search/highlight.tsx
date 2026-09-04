import { highlightParts } from "@/lib/search";

/**
 * Renders text with query terms marked. Builds real React nodes rather than
 * an HTML string, so user input can never be injected into the page.
 */
export function Highlight({
  text,
  terms,
}: {
  text: string;
  terms: string[];
}) {
  const parts = highlightParts(text, terms);

  return (
    <>
      {parts.map((p, i) =>
        p.match ? (
          <mark
            key={i}
            className="rounded-sm bg-brand-tint px-0.5 font-medium text-brand-darker"
          >
            {p.text}
          </mark>
        ) : (
          <span key={i}>{p.text}</span>
        ),
      )}
    </>
  );
}
