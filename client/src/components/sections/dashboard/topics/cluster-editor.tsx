"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import ImagePicker from "./image-picker";
import veilleService, {
    type ClusterWithArticlesResponse,
    type ClusterUpdate,
    type Slide,
} from "@/lib/api/veille.service";

interface ClusterEditorProps {
    cluster: ClusterWithArticlesResponse;
    /** Appelé après une sauvegarde réussie ou une annulation pour sortir du mode édition. */
    onDone: () => void;
}

/**
 * Formulaire d'édition d'un cluster (human-in-the-loop) : titre, image de
 * couverture, article de synthèse et slides. On n'envoie en PATCH que les champs
 * réellement modifiés ; l'original IA (snapshots `*_ai`) n'est jamais touché et
 * reste restaurable via "Revenir à la version IA" depuis la vue.
 */
export default function ClusterEditor({ cluster, onDone }: ClusterEditorProps) {
    const [title, setTitle] = useState(cluster.title);
    const [summary, setSummary] = useState(cluster.summary_article ?? "");
    const [cover, setCover] = useState(cluster.cover_image_url ?? "");
    const [slides, setSlides] = useState<Slide[]>(cluster.slides ?? []);
    const [isPremium, setIsPremium] = useState(cluster.is_premium ?? false);
    const [saving, setSaving] = useState(false);

    // Images candidates pour la couverture (articles les plus pertinents du cluster).
    const { images } = veilleService.useClusterImages(cluster.id, 1);

    function updateSlideText(index: number, texte: string) {
        setSlides(prev => prev.map((s, i) => (i === index ? { ...s, texte } : s)));
    }

    function updateSlideImage(index: number, image_url: string | null) {
        setSlides(prev => prev.map((s, i) => (i === index ? { ...s, image_url } : s)));
    }

    function removeSlide(index: number) {
        setSlides(prev => prev.filter((_, i) => i !== index));
    }

    function addSlide() {
        setSlides(prev => [...prev, { slide: prev.length + 1, texte: "", image_url: null }]);
    }

    /** Slides nettoyés : on retire les vides et on renumérote séquentiellement. */
    function normalizedSlides(): Slide[] {
        return slides
            .filter(s => s.texte.trim() !== "")
            .map((s, i) => ({
                slide: i + 1,
                texte: s.texte.trim(),
                image_url: s.image_url?.trim() || null,
            }));
    }

    function buildPatch(): ClusterUpdate {
        const patch: ClusterUpdate = {};
        if (title.trim() !== cluster.title) patch.title = title.trim();
        if (summary !== (cluster.summary_article ?? "")) patch.summary_article = summary;
        if (cover.trim() !== (cluster.cover_image_url ?? "")) patch.cover_image_url = cover.trim();
        const cleaned = normalizedSlides();
        if (JSON.stringify(cleaned) !== JSON.stringify(cluster.slides ?? [])) {
            patch.slides = cleaned;
        }
        if (isPremium !== (cluster.is_premium ?? false)) patch.is_premium = isPremium;
        return patch;
    }

    async function save(publish: boolean) {
        setSaving(true);
        try {
            const patch = buildPatch();
            if (publish) patch.is_published = true;
            // Rien à enregistrer et pas de publication demandée → on sort sans appel réseau.
            if (Object.keys(patch).length === 0) {
                onDone();
                return;
            }
            await veilleService.updateCluster(cluster.id, patch);
            onDone();
        } catch {
            window.alert("Impossible d'enregistrer les modifications du sujet.");
        } finally {
            setSaving(false);
        }
    }

    return (
        <div className="space-y-6 rounded-lg border border-black/10 bg-black/[0.02] p-5 sm:p-6">
            <div className="flex items-center justify-between">
                <h3 className="text-base font-semibold">{"Modifier le sujet"}</h3>
                <span className="text-xs text-black/50">
                    {"Validation humaine · l'original IA reste restaurable"}
                </span>
            </div>

            {/* Titre */}
            <div className="space-y-1.5">
                <Label htmlFor="cluster-title">{"Titre"}</Label>
                <Input
                    id="cluster-title"
                    value={title}
                    onChange={e => setTitle(e.target.value)}
                    placeholder="Titre du sujet"
                />
            </div>

            {/* Image de couverture */}
            <div className="space-y-1.5">
                <Label>{"Image de couverture"}</Label>
                <ImagePicker
                    value={cover}
                    onChange={u => setCover(u ?? "")}
                    defaultQuery={cluster.title}
                />
                {images && images.length > 0 && (
                    <div className="mt-2">
                        <p className="mb-1.5 text-xs text-black/50">
                            {"Suggestions issues des articles du sujet :"}
                        </p>
                        <div className="flex flex-wrap gap-2">
                            {images.slice(0, 8).map(img => (
                                <button
                                    key={`${img.article_id}-${img.image_url}`}
                                    type="button"
                                    onClick={() => setCover(img.image_url)}
                                    className={`h-16 w-16 overflow-hidden rounded-md ring-2 transition ${
                                        cover === img.image_url
                                            ? "ring-black"
                                            : "ring-transparent hover:ring-black/30"
                                    }`}
                                    title={img.article_title}
                                >
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img
                                        src={img.image_url}
                                        alt={img.article_title}
                                        className="h-full w-full object-cover"
                                    />
                                </button>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Article de synthèse */}
            <div className="space-y-1.5">
                <Label htmlFor="cluster-summary">{"Article de synthèse"}</Label>
                <Textarea
                    id="cluster-summary"
                    value={summary}
                    onChange={e => setSummary(e.target.value)}
                    placeholder="Texte de l'article de synthèse..."
                    className="min-h-[260px]"
                />
            </div>

            {/* Slides */}
            <div className="space-y-2">
                <Label>{"Slides du carrousel"}</Label>
                {slides.length === 0 && (
                    <p className="text-sm text-black/50">{"Aucune slide. Ajoutez-en une ci-dessous."}</p>
                )}
                <div className="space-y-3">
                    {slides.map((s, idx) => (
                        <div key={idx} className="space-y-1.5">
                            <div className="flex items-center justify-between">
                                <span className="text-xs font-medium text-black/60">
                                    {`Slide ${idx + 1}`}
                                </span>
                                <button
                                    type="button"
                                    onClick={() => removeSlide(idx)}
                                    className="text-xs text-red-600 hover:underline"
                                >
                                    {"Retirer"}
                                </button>
                            </div>
                            <Textarea
                                value={s.texte}
                                onChange={e => updateSlideText(idx, e.target.value)}
                                placeholder="Texte de la slide..."
                                className="min-h-[80px]"
                            />
                            <ImagePicker
                                value={s.image_url ?? null}
                                onChange={u => updateSlideImage(idx, u)}
                                defaultQuery={s.texte}
                            />
                        </div>
                    ))}
                </div>
                <Button size="sm" variant="secondary" onClick={addSlide}>
                    {"+ Ajouter une slide"}
                </Button>
            </div>

            {/* Accès : article réservé aux comptes (premium) */}
            <div className="space-y-1.5 border-t border-black/10 pt-4">
                <Label>{"Accès"}</Label>
                <label className="flex items-start gap-2.5 cursor-pointer">
                    <input
                        type="checkbox"
                        checked={isPremium}
                        onChange={e => setIsPremium(e.target.checked)}
                        className="mt-0.5 h-4 w-4 shrink-0"
                    />
                    <span className="text-sm">
                        {"Réservé aux comptes (premium)"}
                        <span className="block text-xs text-black/50">
                            {"Le visiteur anonyme ne voit qu'un aperçu + une invitation à s'inscrire ; un utilisateur connecté lit l'article entier."}
                        </span>
                    </span>
                </label>
            </div>

            {/* Actions */}
            <div className="flex flex-wrap items-center gap-3 border-t border-black/10 pt-4">
                <Button size="md" variant="primary" disabled={saving} onClick={() => save(true)}>
                    {saving ? "..." : "Enregistrer et publier"}
                </Button>
                <Button size="md" variant="secondary" disabled={saving} onClick={() => save(false)}>
                    {saving ? "..." : "Enregistrer"}
                </Button>
                <Button size="md" variant="tertiary" disabled={saving} onClick={onDone}>
                    {"Annuler"}
                </Button>
            </div>
        </div>
    );
}
