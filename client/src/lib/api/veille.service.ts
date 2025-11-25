import axiosClient from "./axios-client";
import useSWR from "swr";

export interface VeilleCluster {
    sujet_cluster: string;
    pertinences: string[];
    [key: string]: unknown;
}

export interface VeilleSlide {
    slide: number;
    texte: string;
}

export interface VeilleAnalysis {
    impact_afrique: string;
    problematique_africaine: string;
    eveil_de_conscience: string;
    piste_opportunite: string;
    type_evenement: string;
    resume_strategique: string;
    lecon_a_retenir: string;
    impact_potentiel: string;
    score_pertinence: number;
    sujet_cluster: string;
    pertinence_cluster: string;
    resume_neutre: string;
    problematique_generale: string;
    [key: string]: unknown;
}

export interface VeilleClusterSummary {
    url: string;
    title: string;
    source: string;
    id: number;
    published: boolean;
    type_evenement: string;
    date: string;
    publication_date: string;
    image_urls: string[];
    day_category: string;
    score_pertinence: number;
    pertinence_cluster: string;
    summary_article: string;
    slides: VeilleSlide[];
    analysis: VeilleAnalysis;
    error?: string;
    [key: string]: unknown;
}

const CLUSTERS_ENDPOINT = "/veille/clusters";
const clusterSummaryEndpoint = (clusterId: string) =>
    `${CLUSTERS_ENDPOINT}/${clusterId}/summary`;
const fetcher = <T>(url: string) => axiosClient.get<T>(url).then(res => res.data);

const veilleService = {
    async getClusters(): Promise<VeilleCluster[]> {
        const response = await axiosClient.get<VeilleCluster[]>(CLUSTERS_ENDPOINT);
        return response.data;
    },

    async getClusterSummary(clusterId: string): Promise<VeilleClusterSummary> {
        const response = await axiosClient.get<VeilleClusterSummary>(
            clusterSummaryEndpoint(clusterId)
        );
        return response.data;
    },

    useClusters() {
        const {
            data,
            error,
            isLoading,
            mutate: refreshClusters,
        } = useSWR<VeilleCluster[]>(CLUSTERS_ENDPOINT, fetcher);

        return {
            clusters: data,
            error,
            isLoading,
            refreshClusters,
        };
    },

    useClusterSummary(clusterId?: string | null) {
        const {
            data,
            error,
            isLoading,
            mutate: refreshSummary,
        } = useSWR<VeilleClusterSummary>(
            clusterId ? clusterSummaryEndpoint(clusterId) : null,
            fetcher
        );

        return {
            clusterSummary: data,
            error,
            isLoading,
            refreshSummary,
        };
    },
};

export default veilleService;
