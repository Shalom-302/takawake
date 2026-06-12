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
    is_published: boolean;
    created_at: string;
}

export interface ClusterWithArticlesResponse extends ClusterResponse {
    articles: ArticleResponse[];
}

export interface ClusterUpdate {
    title?: string;
    summary_article?: string;
    slides?: Slide[];
    is_published?: boolean;
    category_id?: number;
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

// ===================================================================
// Endpoints
// ===================================================================

const CLUSTERS = "/clusters/";
const ARTICLES = "/articles/";
const VEILLES = "/veille/";
const CATEGORIES = "/categories/";

const clusterPath = (id: number | string) => `/clusters/${id}`;
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
