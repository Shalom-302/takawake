import { type ReactNode } from "react";

/**
 * Rendu léger du markdown produit par l'IA pour les résumés de clusters.
 *
 * Le LLM émet du markdown irrégulier (titres `##`, gras `**`, italique `*`,
 * puces `-`/`*`, citations `>`). On le rend proprement plutôt que d'afficher les
 * marqueurs en clair. Pas de dépendance externe : un parseur bloc + inline suffit
 * pour ce sous-ensemble, et tout marqueur résiduel isolé est retiré.
 */

/** Retire le balisage markdown pour un rendu texte simple (aperçus, teasers). */
export function stripMarkdown(raw: string | null | undefined): string {
    if (!raw) return "";
    return raw
        .replace(/```[\s\S]*?```/g, " ") // blocs de code
        .replace(/`([^`]+)`/g, "$1") // code inline
        .replace(/^\s{0,3}#{1,6}\s+/gm, "") // titres ATX (# .. ######)
        .replace(/^\s*[-*+]\s+/gm, "") // puces
        .replace(/^\s*>\s?/gm, "") // citations
        .replace(/\*\*(.+?)\*\*/g, "$1") // gras
        .replace(/_{2}(.+?)_{2}/g, "$1") // gras _
        .replace(/\*(.+?)\*/g, "$1") // italique
        .replace(/_(.+?)_/g, "$1") // italique _
        .replace(/^\s*([-*_])\1{2,}\s*$/gm, " ") // règles horizontales
        .replace(/[*_`#>]/g, "") // marqueurs résiduels
        .replace(/[ \t]{2,}/g, " ")
        .replace(/\n{2,}/g, "\n")
        .trim();
}

/** Parse le formatage inline d'une ligne (**gras**, *italique*, `code`). */
function renderInline(text: string, keyBase: string): ReactNode[] {
    const nodes: ReactNode[] = [];
    const re = /\*\*([^*]+)\*\*|__([^_]+)__|\*([^*]+)\*|_([^_]+)_|`([^`]+)`/g;
    let last = 0;
    let i = 0;
    let m: RegExpExecArray | null;

    const pushPlain = (s: string) => {
        // Retire les marqueurs isolés non appariés (ex. un `*` ou `#` orphelin).
        const clean = s.replace(/[*_`#]/g, "");
        if (clean) nodes.push(clean);
    };

    while ((m = re.exec(text)) !== null) {
        pushPlain(text.slice(last, m.index));
        if (m[1] !== undefined || m[2] !== undefined) {
            nodes.push(<strong key={`${keyBase}-b${i}`}>{m[1] ?? m[2]}</strong>);
        } else if (m[3] !== undefined || m[4] !== undefined) {
            nodes.push(<em key={`${keyBase}-i${i}`}>{m[3] ?? m[4]}</em>);
        } else if (m[5] !== undefined) {
            nodes.push(
                <code key={`${keyBase}-c${i}`} className="rounded bg-black/5 px-1 py-0.5 text-[0.9em]">
                    {m[5]}
                </code>,
            );
        }
        last = re.lastIndex;
        i++;
    }
    pushPlain(text.slice(last));
    return nodes;
}

/** Rendu riche (titres, gras, italique, listes, paragraphes) pour le lecteur. */
export function renderMarkdown(raw: string | null | undefined): ReactNode {
    if (!raw) return null;
    const blocks = raw.trim().split(/\n{2,}/);

    return blocks.map((block, i) => {
        const trimmed = block.trim();
        if (!trimmed) return null;

        // Règle horizontale (---, ***, ___)
        if (/^([-*_])\1{2,}$/.test(trimmed)) {
            return <hr key={`hr-${i}`} className="my-4 border-black/10" />;
        }

        // Titre ATX (## Titre)
        const atx = trimmed.match(/^(#{1,6})\s+(.+)$/);
        if (atx) {
            const level = atx[1].length;
            const content = renderInline(atx[2], `h-${i}`);
            if (level <= 2) {
                return (
                    <h2 key={`h-${i}`} className="text-xl font-bold mt-6 mb-2 leading-snug">
                        {content}
                    </h2>
                );
            }
            if (level === 3) {
                return (
                    <h3 key={`h-${i}`} className="text-base font-semibold mt-4 mb-1">
                        {content}
                    </h3>
                );
            }
            return (
                <h4 key={`h-${i}`} className="text-sm font-semibold mt-3 mb-1">
                    {content}
                </h4>
            );
        }

        // Titre « gras seul sur sa ligne » (**Titre**)
        const boldOnly = trimmed.match(/^\*\*(.+?)\*\*$/);
        if (boldOnly) {
            return (
                <h3 key={`hb-${i}`} className="text-base font-semibold mt-4 mb-1">
                    {boldOnly[1]}
                </h3>
            );
        }

        const lines = trimmed.split(/\n/);

        // Liste à puces (toutes les lignes commencent par -, * ou +)
        if (lines.every(l => /^\s*[-*+]\s+/.test(l))) {
            return (
                <ul key={`ul-${i}`} className="list-disc pl-5 mb-4 space-y-1">
                    {lines.map((l, j) => (
                        <li key={j} className="leading-relaxed">
                            {renderInline(l.replace(/^\s*[-*+]\s+/, ""), `ul-${i}-${j}`)}
                        </li>
                    ))}
                </ul>
            );
        }

        // Paragraphe (sauts de ligne simples → <br>)
        return (
            <p key={`p-${i}`} className="leading-relaxed mb-4">
                {lines.map((line, idx) => (
                    <span key={idx}>
                        {renderInline(line, `p-${i}-${idx}`)}
                        {idx < lines.length - 1 && <br />}
                    </span>
                ))}
            </p>
        );
    });
}
