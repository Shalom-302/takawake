"use client";

import { useState } from "react";
import { Dialog } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import veilleService, { type PexelsImage } from "@/lib/api/veille.service";

interface ImagePickerProps {
    value?: string | null;
    onChange: (url: string | null) => void;
    /** Requête pré-remplie + recherchée à l'ouverture (titre du cluster / texte de slide). */
    defaultQuery?: string;
}

/**
 * Sélecteur d'image réutilisable : ouvre une boîte de dialogue avec une
 * recherche Pexels (proxy backend, clé côté serveur), une grille cliquable, et
 * un champ « coller une URL » en repli. Renvoie l'URL choisie via onChange.
 */
export default function ImagePicker({ value, onChange, defaultQuery = "" }: ImagePickerProps) {
    const [open, setOpen] = useState(false);
    const [query, setQuery] = useState(defaultQuery);
    const [results, setResults] = useState<PexelsImage[]>([]);
    const [loading, setLoading] = useState(false);
    const [searched, setSearched] = useState(false);
    const [manualUrl, setManualUrl] = useState("");

    async function runSearch(qArg?: string) {
        const term = (qArg ?? query).trim();
        if (!term) return;
        setLoading(true);
        setSearched(true);
        try {
            setResults(await veilleService.searchImages(term));
        } catch {
            setResults([]);
        } finally {
            setLoading(false);
        }
    }

    function handleOpenChange(next: boolean) {
        setOpen(next);
        // À la première ouverture, on lance une recherche sur la requête suggérée
        // pour afficher tout de suite des images pertinentes.
        if (next && !searched && defaultQuery.trim()) {
            setQuery(defaultQuery);
            void runSearch(defaultQuery);
        }
    }

    function select(url: string) {
        if (!url) return;
        onChange(url);
        setOpen(false);
    }

    const triggerBtn = (
        <Button type="button" size="sm" variant="secondary">
            {value ? "Changer l'image" : "Choisir une image"}
        </Button>
    );

    const dialogContent = (
        <div className="space-y-3">
            <div className="flex gap-2">
                <Input
                    value={query}
                    onChange={e => setQuery(e.target.value)}
                    placeholder="Rechercher (ex: africa fintech, startup office)..."
                    onKeyDown={e => {
                        if (e.key === "Enter") {
                            e.preventDefault();
                            void runSearch();
                        }
                    }}
                />
                <Button
                    type="button"
                    size="sm"
                    variant="primary"
                    disabled={loading}
                    onClick={() => void runSearch()}
                >
                    {loading ? "..." : "Rechercher"}
                </Button>
            </div>

            <div className="max-h-[50vh] overflow-y-auto">
                {loading ? (
                    <p className="py-6 text-center text-sm text-black/50">{"Recherche..."}</p>
                ) : results.length > 0 ? (
                    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                        {results.map(img => (
                            <button
                                key={img.id ?? img.url}
                                type="button"
                                onClick={() => select(img.url)}
                                className="group relative aspect-video overflow-hidden rounded-md ring-1 ring-black/10 transition hover:ring-2 hover:ring-black"
                                title={img.alt ?? ""}
                            >
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img
                                    src={img.thumbnail}
                                    alt={img.alt ?? ""}
                                    className="h-full w-full object-cover"
                                />
                                {img.photographer && (
                                    <span className="absolute inset-x-0 bottom-0 truncate bg-black/50 px-1 py-0.5 text-[10px] text-white opacity-0 group-hover:opacity-100">
                                        {`© ${img.photographer}`}
                                    </span>
                                )}
                            </button>
                        ))}
                    </div>
                ) : searched ? (
                    <p className="py-6 text-center text-sm text-black/50">
                        {"Aucune image trouvée (ou Pexels non configuré)."}
                    </p>
                ) : (
                    <p className="py-6 text-center text-sm text-black/50">
                        {"Lance une recherche pour voir des images."}
                    </p>
                )}
            </div>

            <div className="border-t border-black/10 pt-3">
                <p className="mb-1.5 text-xs text-black/50">
                    {"Ou coller une URL d'image (n'importe quel site) :"}
                </p>
                <div className="flex gap-2">
                    <Input
                        value={manualUrl}
                        onChange={e => setManualUrl(e.target.value)}
                        placeholder="https://..."
                    />
                    <Button
                        type="button"
                        size="sm"
                        variant="secondary"
                        disabled={!manualUrl.trim()}
                        onClick={() => select(manualUrl.trim())}
                    >
                        {"Utiliser"}
                    </Button>
                </div>
            </div>
        </div>
    );

    return (
        <div className="space-y-2">
            {value && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                    src={value}
                    alt="Aperçu"
                    className="h-32 w-full rounded-md object-cover"
                />
            )}
            <div className="flex items-center gap-2">
                <Dialog
                    open={open}
                    onOpenChange={handleOpenChange}
                    trigger={triggerBtn}
                    title="Choisir une image"
                    dialogContentClassName="sm:max-w-2xl"
                    content={dialogContent}
                />
                {value && (
                    <Button
                        type="button"
                        size="sm"
                        variant="tertiary"
                        onClick={() => onChange(null)}
                    >
                        {"Retirer"}
                    </Button>
                )}
            </div>
        </div>
    );
}
