import useSWR, { mutate as globalMutate } from "swr";
import axiosClient from "./axios-client";

// ===================================================================
// Types — miroirs stricts des schémas Pydantic backend
// (cf. backend/app/schemas/veille.py et backend/app/models/veille.py)
// ===================================================================

export type VeilleStatus = "PENDING" | "SUCCESS" | "FAILED";
export type ArticleStatus = "PENDING" | "PROCESSED" | "FAILED";

// Providers LLM supportés par le backend (cf. /veille/run).
export type LlmProvider = "deepseek" | "openai" | "anthropic" | "ollama";

export interface ArticleAnalysis {
    impact_afrique: string;
    problematique_africaine: string;
    eveil_de_conscience: string;
    piste_opportunite: string;
    type_evenement: string;
    resume_strategique: string;
    lecon_a_retenir: string;
    impact_potentiel: string;
    score_pertinence: number;
    sujet_cluster: string | null;
    pertinence_cluster: string | null;
    resume_neutre: string;
    problematique_generale: string;
}

export interface Slide {
    slide: number;
    texte: string;
    // Illustration automatique (Unsplash) — éditable/remplaçable à la main.
    image_url?: string | null;
}

export interface CategoryResponse {
    id: number;
    name: string;
}

export interface CategoryCreate {
    name: string;
}

export interface CategoryUpdate {
    name?: string;
}

export interface VeilleResponse {
    id: number;
    prompt: string;
    created_at: string;
    status: VeilleStatus;
    status_message: string | null;
    llm_provider: string | null;
}

/** Contexte léger de la veille parente, embarqué dans ArticleResponse. */
export interface VeilleContext {
    id: number;
    prompt: string;
    llm_provider: string | null;
}

export interface ArticleResponse {
    id: number;
    veille_id: number;
    cluster_id: number | null;
    source_url: string;
    source_name: string;
    title: string;
    publication_date: string | null;
    scraping_date: string;
    image_urls: string[] | null;
    content: string | null;
    status: ArticleStatus;
    status_message: string | null;
    pertinence_cluster: string | null;
    analysis: ArticleAnalysis | null;
    veille: VeilleContext | null;
}

export interface ArticleUpdate {
    veille_id?: number;
    cluster_id?: number;
    source_url?: string;
    source_name?: string;
    title?: string;
    publication_date?: string;
    scraping_date?: string;
    image_urls?: string[];
    content?: string;
    status?: ArticleStatus;
    status_message?: string;
    pertinence_cluster?: string;
    analysis?: ArticleAnalysis;
}

export interface ClusterResponse {
    id: number;
    title: string;
    veille_id: number;
    category_id: number | null;
    category: CategoryResponse | null;
    summary_article: string | null;
    slides: Slide[] | null;
    cover_image_url: string | null;
    is_published: boolean;
    // Nombre d'articles regroupés dans ce cluster (renvoyé par la liste /clusters/).
    article_count?: number;
    // Article réservé aux comptes : visiteur anonyme = teaser + mur d'inscription.
    is_premium: boolean;
    // Posé par l'API (non persisté) : true quand le contenu a été tronqué pour un
    // visiteur anonyme → le front affiche le mur d'inscription.
    locked: boolean;
    created_at: string;
    // Date de l'actu (non persistée) : publication_date la plus récente des
    // articles du cluster, repli sur created_at. Base du filtre temporel
    // (Aujourd'hui/Hier/Semaine) et de l'indicateur "il y a X heures".
    published_date: string | null;
    // Version IA d'origine (human-in-the-loop) : snapshots figés à la génération,
    // exposés pour prévisualiser/diff l'original avant un revert.
    summary_article_ai: string | null;
    slides_ai: Slide[] | null;
    cover_image_url_ai: string | null;
    // True si la version de travail diverge de l'original IA.
    is_edited: boolean;
}

export interface ClusterWithArticlesResponse extends ClusterResponse {
    articles: ArticleResponse[];
}

export interface ClusterUpdate {
    title?: string;
    summary_article?: string;
    slides?: Slide[];
    cover_image_url?: string;
    is_published?: boolean;
    is_premium?: boolean;
    category_id?: number;
}

/** Champs à restaurer lors d'un revert vers la version IA (tous par défaut). */
export interface ClusterRevertOptions {
    summary?: boolean;
    slides?: boolean;
    cover?: boolean;
}

export interface ImageInfo {
    image_url: string;
    score_pertinence: number | null;
    article_title: string;
    article_id: number;
}

export interface ClusterInfo {
    title: string;
    pertinences: string[];
}

/** Un point de la série temporelle (volume d'articles traités ce jour-là). */
export interface ArticleDailyCount {
    date: string; // YYYY-MM-DD
    count: number;
}

/** Une image renvoyée par le sélecteur (recherche Unsplash ou upload local). */
export interface StockImage {
    id: number | null;
    url: string;
    thumbnail: string;
    photographer: string | null;
    alt: string | null;
}

/** @deprecated Renommé en {@link StockImage} (on n'utilise plus Pexels). */
export type PexelsImage = StockImage;

// ===================================================================
// Helpers
// ===================================================================

type QueryParams = Record<string, string | number | boolean | undefined | null>;

function buildKey(path: string, params?: QueryParams): string {
    if (!params) return path;
    const usp = new URLSearchParams();
    for (const [k, v] of Object.entries(params)) {
        if (v === undefined || v === null || v === "") continue;
        usp.append(k, String(v));
    }
    const qs = usp.toString();
    return qs ? `${path}?${qs}` : path;
}

const fetcher = <T,>(url: string) => axiosClient.get<T>(url).then(r => r.data);

// Origine de l'API (sans le suffixe /api) — sert à absolutiser les chemins
// relatifs renvoyés par l'upload d'image (ex. /api/uploads/x.jpg) afin que l'URL
// stockée sur le cluster soit portable (rendue aussi par le client public).
const API_ORIGIN = (process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000/api").replace(
    /\/api\/?$/,
    "",
);

/** Préfixe un chemin relatif avec l'origine de l'API ; laisse les URLs absolues. */
export function toAbsoluteUrl(pathOrUrl: string): string {
    if (/^https?:\/\//i.test(pathOrUrl)) return pathOrUrl;
    return `${API_ORIGIN}${pathOrUrl.startsWith("/") ? "" : "/"}${pathOrUrl}`;
}

/**
 * Résout une URL d'image *à l'affichage* : les images sont stockées en chemin
 * RELATIF (ex. /api/public/file-storage/files/12/preview, servi par MinIO via
 * l'API) pour rester portables d'un environnement à l'autre. On ajoute l'origine
 * de l'API uniquement au rendu. Les URLs déjà absolues (Unsplash, sites tiers)
 * passent telles quelles. Renvoie `undefined` si vide (pratique pour un style
 * conditionnel `backgroundImage`).
 */
export function resolveImageUrl(u?: string | null): string | undefined {
    if (!u) return undefined;
    return toAbsoluteUrl(u);
}

// ===================================================================
// Endpoints
// ===================================================================

const CLUSTERS = "/clusters/";
const ARTICLES = "/articles/";
const VEILLES = "/veille/";
const CATEGORIES = "/categories/";

const clusterPath = (id: number | string) => `/clusters/${id}`;
const clusterRevertPath = (id: number | string) => `/clusters/${id}/revert`;
const clusterSummaryPath = (id: number | string) => `/clusters/${id}/summary`;
const clusterSlidesPath = (id: number | string) => `/clusters/${id}/slides`;
const clusterImagePath = (id: number | string) => `/clusters/${id}/image`;
const clusterImagesPath = (id: number | string) => `/clusters/${id}/images`;
const articlePath = (id: number | string) => `/articles/${id}`;
const veillePath = (id: number | string) => `/veille/${id}`;
const categoryPath = (id: number | string) => `/categories/${id}`;

// ===================================================================
// Service — SWR hooks (queries) + axios mutations (actions)
// ===================================================================

const veilleService = {
    // ----- Clusters -----

    useClusters(opts?: {
        is_published?: boolean;
        category_id?: number;
        veille_id?: number;
        skip?: number;
        limit?: number;
    }) {
        const key = buildKey(CLUSTERS, opts);
        const { data, error, isLoading, mutate } = useSWR<ClusterResponse[]>(key, fetcher);
        return { clusters: data, error, isLoading, refreshClusters: mutate };
    },

    useClustersCount(opts?: { is_published?: boolean; category_id?: number; veille_id?: number }) {
        const key = buildKey("/clusters/count", opts);
        const { data, error, isLoading, mutate } = useSWR<{ count: number }>(key, fetcher);
        return { count: data?.count, error, isLoading, refreshCount: mutate };
    },

    useClustersWithPertinences() {
        const { data, error, isLoading, mutate } = useSWR<ClusterInfo[]>(
            "/clusters/all-with-pertinences",
            fetcher,
        );
        return { clustersInfo: data, error, isLoading, refresh: mutate };
    },

    useClusterDetail(id?: number | string | null) {
        const { data, error, isLoading, mutate } = useSWR<ClusterWithArticlesResponse>(
            id ? clusterPath(id) : null,
            fetcher,
        );
        return { cluster: data, error, isLoading, refreshCluster: mutate };
    },

    useClusterSummary(id?: number | string | null) {
        const { data, error, isLoading, mutate } = useSWR<ClusterResponse>(
            id ? clusterSummaryPath(id) : null,
            fetcher,
        );
        return { clusterSummary: data, error, isLoading, refreshSummary: mutate };
    },

    useClusterSlides(id?: number | string | null) {
        const { data, error, isLoading, mutate } = useSWR<Slide[]>(
            id ? clusterSlidesPath(id) : null,
            fetcher,
        );
        return { slides: data, error, isLoading, refreshSlides: mutate };
    },

    useClusterImage(id?: number | string | null) {
        const { data, error, isLoading, mutate } = useSWR<string[]>(
            id ? clusterImagePath(id) : null,
            fetcher,
        );
        return { imageUrls: data, error, isLoading, refreshImage: mutate };
    },

    useClusterImages(id?: number | string | null, score_min: number = 7) {
        const { data, error, isLoading, mutate } = useSWR<ImageInfo[]>(
            id ? buildKey(clusterImagesPath(id), { score_min }) : null,
            fetcher,
        );
        return { images: data, error, isLoading, refreshImages: mutate };
    },

    async updateCluster(id: number | string, patch: ClusterUpdate): Promise<ClusterResponse> {
        const { data } = await axiosClient.patch<ClusterResponse>(clusterPath(id), patch);
        await globalMutate(clusterPath(id));
        await globalMutate(
            key => typeof key === "string" && (key === CLUSTERS || key.startsWith(`${CLUSTERS}?`)),
        );
        return data;
    },

    /**
     * Restaure la version IA d'origine d'un cluster (human-in-the-loop). Par
     * défaut tous les champs (synthèse, slides, couverture) ; sinon on cible via
     * `opts`. Invalide le détail + la liste pour refléter le retour à l'original.
     */
    async revertCluster(
        id: number | string,
        opts?: ClusterRevertOptions,
    ): Promise<ClusterResponse> {
        const params: QueryParams = {};
        if (opts?.summary !== undefined) params.summary = opts.summary;
        if (opts?.slides !== undefined) params.slides = opts.slides;
        if (opts?.cover !== undefined) params.cover = opts.cover;
        const { data } = await axiosClient.post<ClusterResponse>(clusterRevertPath(id), null, {
            params,
        });
        await globalMutate(clusterPath(id));
        await globalMutate(clusterSummaryPath(id));
        await globalMutate(clusterSlidesPath(id));
        await globalMutate(
            key => typeof key === "string" && (key === CLUSTERS || key.startsWith(`${CLUSTERS}?`)),
        );
        return data;
    },

    async deleteCluster(id: number | string): Promise<void> {
        await axiosClient.delete(clusterPath(id));
        await globalMutate(
            key => typeof key === "string" && (key === CLUSTERS || key.startsWith(`${CLUSTERS}?`)),
        );
    },

    /**
     * Clusterise les articles. Si `veilleId` est fourni, ne traite que cette
     * veille (sinon toutes). Tâche asynchrone (Celery) : les clusters
     * n'apparaissent pas immédiatement → on invalide le cache pour que les
     * prochains fetch les récupèrent.
     */
    async runBackfill(
        veilleId?: number,
        llm_provider: LlmProvider = "deepseek",
        ollama_model?: string,
    ): Promise<void> {
        const params: QueryParams = { llm_provider };
        if (veilleId !== undefined) params.veille_id = veilleId;
        if (llm_provider === "ollama" && ollama_model) params.ollama_model = ollama_model;
        await axiosClient.post("/clusters/backfill-assign", null, { params });
        await globalMutate(
            key => typeof key === "string" && (key === CLUSTERS || key.startsWith(`${CLUSTERS}?`)),
        );
    },

    /**
     * Génère le résumé ET les slides d'un cluster (route combinée). Tâche
     * asynchrone (Celery) → on invalide le détail/résumé/slides du cluster.
     */
    async generateClusterContent(
        id: number | string,
        llm_provider: LlmProvider = "deepseek",
        ollama_model?: string,
    ): Promise<void> {
        const params: QueryParams = { llm_provider };
        if (llm_provider === "ollama" && ollama_model) params.ollama_model = ollama_model;
        await axiosClient.post(`/clusters/${id}/generate-content`, null, { params });
        await globalMutate(clusterPath(id));
        await globalMutate(clusterSummaryPath(id));
        await globalMutate(clusterSlidesPath(id));
        await globalMutate(
            key => typeof key === "string" && (key === CLUSTERS || key.startsWith(`${CLUSTERS}?`)),
        );
    },

    /**
     * (Ré)génère automatiquement les images des slides d'un cluster (Unsplash +
     * mots-clés dérivés par le LLM). Tâche asynchrone (Celery) → on invalide le
     * détail et les slides du cluster.
     */
    async generateSlideImages(
        id: number | string,
        llm_provider: LlmProvider = "deepseek",
        ollama_model?: string,
    ): Promise<void> {
        const params: QueryParams = { llm_provider };
        if (llm_provider === "ollama" && ollama_model) params.ollama_model = ollama_model;
        await axiosClient.post(`/clusters/${id}/generate-slide-images`, null, { params });
        await globalMutate(clusterPath(id));
        await globalMutate(clusterSlidesPath(id));
    },

    /** Recherche d'images via le proxy Unsplash backend (sélecteur de l'éditeur). */
    async searchImages(q: string, per_page = 15): Promise<StockImage[]> {
        const { data } = await axiosClient.get<StockImage[]>("/clusters/image-search", {
            params: { q, per_page },
        });
        return data;
    },

    /**
     * Bibliothèque des images déjà importées dans MinIO (préfixe `veille/`), pour
     * réutiliser une image uploadée précédemment depuis le sélecteur. Les URLs
     * sont relatives → absolutisées à l'affichage via `resolveImageUrl`.
     */
    async listUploadedImages(limit = 60): Promise<StockImage[]> {
        const { data } = await axiosClient.get<StockImage[]>("/clusters/uploaded-images", {
            params: { limit },
        });
        return data;
    },

    /** Supprime une image importée (objet MinIO + ligne en base). */
    async deleteUploadedImage(id: number): Promise<void> {
        await axiosClient.delete(`/clusters/uploaded-images/${id}`);
    },

    /**
     * Upload une image depuis le poste de l'éditeur. Le backend la stocke dans
     * MinIO et renvoie un chemin RELATIF (ex. /api/public/file-storage/.../preview).
     * On garde ce chemin relatif tel quel : c'est lui qui sera enregistré sur le
     * cluster (portable), et l'absolutisation se fait à l'affichage via
     * `resolveImageUrl`. (Le backend réécrit de toute façon toute image en URL
     * relative MinIO au PATCH.)
     */
    async uploadImage(file: File): Promise<StockImage> {
        const form = new FormData();
        form.append("file", file);
        const { data } = await axiosClient.post<StockImage>("/clusters/upload-image", form, {
            headers: { "Content-Type": "multipart/form-data" },
        });
        return data;
    },

    // ----- Articles -----

    useArticles(opts?: {
        veille_id?: number;
        status?: ArticleStatus;
        score_min?: number;
        cluster_title?: string;
        order_by_publication_date?: boolean;
        skip?: number;
        limit?: number;
    }) {
        const key = buildKey(ARTICLES, opts);
        const { data, error, isLoading, mutate } = useSWR<ArticleResponse[]>(key, fetcher);
        return { articles: data, error, isLoading, refreshArticles: mutate };
    },

    useArticlesCount(opts?: {
        veille_id?: number;
        status?: ArticleStatus;
        score_min?: number;
        cluster_title?: string;
    }) {
        const key = buildKey("/articles/count", opts);
        const { data, error, isLoading } = useSWR<{ count: number }>(key, fetcher);
        return { count: data?.count, error, isLoading };
    },

    /** Série temporelle dense (jours remplis à 0) du volume d'articles / jour. */
    useArticlesTimeseries(days = 14) {
        const key = buildKey("/articles/timeseries", { days });
        const { data, error, isLoading } = useSWR<ArticleDailyCount[]>(key, fetcher);
        return { points: data, error, isLoading };
    },

    useArticle(id?: number | string | null) {
        const { data, error, isLoading, mutate } = useSWR<ArticleResponse>(
            id ? articlePath(id) : null,
            fetcher,
        );
        return { article: data, error, isLoading, refreshArticle: mutate };
    },

    async updateArticle(id: number | string, patch: ArticleUpdate): Promise<ArticleResponse> {
        const { data } = await axiosClient.patch<ArticleResponse>(articlePath(id), patch);
        await globalMutate(articlePath(id));
        await globalMutate(
            key => typeof key === "string" && (key === ARTICLES || key.startsWith(`${ARTICLES}?`)),
        );
        return data;
    },

    async deleteArticle(id: number | string): Promise<void> {
        await axiosClient.delete(articlePath(id));
        await globalMutate(
            key => typeof key === "string" && (key === ARTICLES || key.startsWith(`${ARTICLES}?`)),
        );
    },

    async deleteAllArticles(): Promise<void> {
        await axiosClient.delete("/articles/all");
        await globalMutate(
            key => typeof key === "string" && (key === ARTICLES || key.startsWith(`${ARTICLES}?`)),
        );
    },

    // ----- Veilles -----

    useVeilles(opts?: { skip?: number; limit?: number }) {
        const key = buildKey(VEILLES, opts);
        const { data, error, isLoading, mutate } = useSWR<VeilleResponse[]>(key, fetcher);
        return { veilles: data, error, isLoading, refreshVeilles: mutate };
    },

    useVeillesCount() {
        const { data, error, isLoading } = useSWR<{ count: number }>("/veille/count", fetcher);
        return { count: data?.count, error, isLoading };
    },

    useVeille(id?: number | string | null) {
        const { data, error, isLoading, mutate } = useSWR<VeilleResponse>(
            id ? veillePath(id) : null,
            fetcher,
        );
        return { veille: data, error, isLoading, refreshVeille: mutate };
    },

    async runVeille(
        query: string,
        llm_provider: LlmProvider = "deepseek",
        ollama_model?: string,
    ): Promise<void> {
        const params: QueryParams = { query, llm_provider };
        if (llm_provider === "ollama" && ollama_model) params.ollama_model = ollama_model;
        await axiosClient.post("/veille/run", null, { params });
        await globalMutate(
            key => typeof key === "string" && (key === VEILLES || key.startsWith(`${VEILLES}?`)),
        );
    },

    async deleteVeille(id: number | string): Promise<void> {
        await axiosClient.delete(veillePath(id));
        await globalMutate(
            key => typeof key === "string" && (key === VEILLES || key.startsWith(`${VEILLES}?`)),
        );
    },

    /**
     * (Re)vectorise dans Qdrant les articles d'une veille. Tâche asynchrone
     * (Celery) — indispensable avant de pouvoir clusteriser si l'indexation
     * initiale a échoué (articles sans vecteur).
     */
    async reindexVeille(id: number | string): Promise<void> {
        await axiosClient.post(`/veille/${id}/reindex`);
    },

    // ----- Categories -----

    useCategories(opts?: { skip?: number; limit?: number }) {
        const key = buildKey(CATEGORIES, opts);
        const { data, error, isLoading, mutate } = useSWR<CategoryResponse[]>(key, fetcher);
        return { categories: data, error, isLoading, refreshCategories: mutate };
    },

    useCategory(id?: number | string | null) {
        const { data, error, isLoading, mutate } = useSWR<CategoryResponse>(
            id ? categoryPath(id) : null,
            fetcher,
        );
        return { category: data, error, isLoading, refreshCategory: mutate };
    },

    async createCategory(payload: CategoryCreate): Promise<CategoryResponse> {
        const { data } = await axiosClient.post<CategoryResponse>(CATEGORIES, payload);
        await globalMutate(
            key => typeof key === "string" && (key === CATEGORIES || key.startsWith(`${CATEGORIES}?`)),
        );
        return data;
    },

    async updateCategory(id: number | string, patch: CategoryUpdate): Promise<CategoryResponse> {
        const { data } = await axiosClient.patch<CategoryResponse>(categoryPath(id), patch);
        await globalMutate(categoryPath(id));
        await globalMutate(
            key => typeof key === "string" && (key === CATEGORIES || key.startsWith(`${CATEGORIES}?`)),
        );
        return data;
    },

    async deleteCategory(id: number | string): Promise<void> {
        await axiosClient.delete(categoryPath(id));
        await globalMutate(
            key => typeof key === "string" && (key === CATEGORIES || key.startsWith(`${CATEGORIES}?`)),
        );
    },
};

export default veilleService;
