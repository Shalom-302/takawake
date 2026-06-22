import datetime
from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional, Dict, Any

# Importez les Enums du modèle SQLAlchemy pour les utiliser dans Pydantic
from app.models.veille import VeilleStatus, ArticleStatus 

# --- Schemas pour les données d'analyse LLM ---

class ArticleAnalysis(BaseModel):
    """
    Schéma de la sortie structurée attendue du LLM pour l'analyse d'un article.
    Ce schéma est stocké tel quel dans le champ JSON 'analysis' de l'Article.
    """
    impact_afrique: str = Field(description="L'impact direct ou indirect de cet événement sur l'Afrique.")
    problematique_africaine: str = Field(description="La problématique de fond que cela révèle pour le continent.")
    eveil_de_conscience: str = Field(description="La leçon critique, le 'wake-up call' pour l'Afrique.")
    piste_opportunite: str = Field(description="Une idée d'opportunité concrète pour l'écosystème tech africain.")
    type_evenement: str = Field(description="Ex: 'Faillite', 'Lancement de produit', 'Tendance'.")
    resume_strategique: str = Field(description="Résumé de l'événement et son importance stratégique pour l'Afrique.")
    lecon_a_retenir: str = Field(description="Le conseil principal à tirer de cet événement.")
    impact_potentiel: str = Field(description="L'impact potentiel sur l'industrie ou la région.")
    score_pertinence: int = Field(description="Un score de 1 à 10 indiquant l'importance de cet éveil de conscience pour l'Afrique. 10 est critique.", ge=1, le=10)
    sujet_cluster: str | None = Field(description="Catégorise l'article en 3-5 mots-clés (ex: 'Régulation Fintech', 'Cybersécurité', 'IA Africaine').", default=None)
    pertinence_cluster: str | None = Field(description="Justification par le LLM du choix du cluster, expliquant le lien entre l'article et la problématique.", default=None)
    resume_neutre: str = Field(description="Un résumé factuel et dense de l'article (700-800 caractères).")
    problematique_generale: str = Field(description="La problématique principale ou universelle soulevée par l'article.")

# --- Schemas pour les utilitaires et entrées d'API ---

class Slide(BaseModel):
    """
    Schéma pour un seul slide du carrousel.
    `image_url` est illustrée automatiquement (Pexels, cf. services/slide_images.py)
    mais reste éditable/remplaçable à la main par l'éditeur.
    """
    slide: int
    texte: str
    image_url: Optional[str] = None

class TriggerVeilleRequest(BaseModel):
    """
    Schéma pour la requête de déclenchement d'une nouvelle session de veille.
    """
    query: str = Field(description="La requête ou le prompt pour la session de veille.")

class PublishStatusUpdate(BaseModel):
    """
    Schéma pour la mise à jour du statut de publication d'un cluster.
    """
    is_published: bool

class PexelsImage(BaseModel):
    """Une image renvoyée par le sélecteur (recherche Pexels)."""
    id: Optional[int] = None
    url: str            # URL de l'image à utiliser
    thumbnail: str      # vignette pour la grille du sélecteur
    photographer: Optional[str] = None
    alt: Optional[str] = None


class ImageInfo(BaseModel):
    """
    Schéma pour retourner les informations d'une image pertinente.
    Utile pour des vues agrégées (ex: galerie des images les plus pertinentes).
    """
    image_url: str
    score_pertinence: Optional[int] = None 
    article_title: str
    article_id: int


# --- Category Schemas ---
class CategoryBase(BaseModel):
    name: str

class CategoryCreate(CategoryBase):
    pass

class CategoryUpdate(BaseModel):
    name: Optional[str] = None

class CategoryResponse(CategoryBase):
    id: int
    
    model_config = ConfigDict(from_attributes=True)

# --- Veille Schemas ---
class VeilleBase(BaseModel):
    prompt: str

class VeilleCreate(VeilleBase):
    llm_provider: Optional[str] = None  # deepseek | openai | anthropic | ollama

class VeilleUpdate(BaseModel):
    prompt: Optional[str] = None
    status: Optional[VeilleStatus] = None
    status_message: Optional[str] = None
    llm_provider: Optional[str] = None

class VeilleResponse(VeilleBase):
    id: int
    created_at: datetime.datetime
    status: VeilleStatus
    status_message: Optional[str] = None
    llm_provider: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)


class VeilleContext(BaseModel):
    """Sous-schéma léger embarqué dans ArticleResponse pour rappeler à quelle
    veille (et donc quel LLM provider) l'article appartient."""
    id: int
    prompt: str
    llm_provider: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)

# --- Article Schemas ---

class ArticleBase(BaseModel):
    """
    Schéma de base pour un article, reflétant les données brutes initiales.
    """
    source_url: str
    source_name: str
    title: str

class ArticleCreate(ArticleBase):
    """
    Schéma utilisé pour la création initiale d'un article lié à une veille.
    """
    veille_id: int

# --- Nouveau: ArticleUpdate (MODIFIÉ) ---
class ArticleUpdate(BaseModel):
    """
    Schéma pour la mise à jour d'un article existant.
    Tous les champs sont Optional pour permettre des mises à jour partielles.
    """
    veille_id: Optional[int] = None
    cluster_id: Optional[int] = None
    
    source_url: Optional[str] = None
    source_name: Optional[str] = None
    title: Optional[str] = None
    publication_date: Optional[datetime.datetime] = None
    scraping_date: Optional[datetime.datetime] = None
    image_urls: Optional[List[str]] = None
    content: Optional[str] = None
    
    status: Optional[ArticleStatus] = None 
    status_message: Optional[str] = None 
    
    #
    pertinence_cluster: Optional[str] = None
    
    analysis: Optional[ArticleAnalysis] = None 

class ArticleResponse(ArticleBase):
    """
    Schéma de réponse complet pour un article, incluant toutes les données
    analysées et les liens vers les entités associées.
    """
    id: int
    veille_id: int
    cluster_id: Optional[int] = None

    publication_date: Optional[datetime.datetime] = None
    scraping_date: datetime.datetime
    image_urls: Optional[List[str]] = None
    content: Optional[str] = None

    status: ArticleStatus
    status_message: Optional[str] = None

    pertinence_cluster: Optional[str] = None

    analysis: Optional[ArticleAnalysis] = None

    # Contexte de la veille parente : permet au front (human-in-the-loop)
    # de savoir quel LLM provider a analysé l'article sans seconde requête.
    veille: Optional[VeilleContext] = None

    model_config = ConfigDict(from_attributes=True)

# --- Cluster Schemas ---

class ClusterBase(BaseModel):
    title: str

class ClusterCreate(ClusterBase):
    # veille_id : la veille d'origine du cluster (le clustering est mono-veille).
    veille_id: int
    # category_id : suggestion posée par le clustering (cf. services/clustering.py),
    # corrigeable ensuite par l'éditeur via PATCH /clusters/{id}.
    category_id: Optional[int] = None

class ClusterUpdate(BaseModel):
    """
    Schéma pour la mise à jour d'un cluster existant.
    Tous les champs sont Optional pour permettre des mises à jour partielles.
    """
    title: Optional[str] = None
    summary_article: Optional[str] = None
    slides: Optional[List[Slide]] = None
    cover_image_url: Optional[str] = None
    is_published: Optional[bool] = None
    category_id: Optional[int] = None

class ClusterResponse(ClusterBase):
    id: int
    veille_id: int
    category_id: Optional[int] = None
    category: Optional[CategoryResponse] = None
    
    summary_article: Optional[str] = None
    slides: Optional[List[Slide]] = None
    cover_image_url: Optional[str] = None
    is_published: bool
    created_at: datetime.datetime

    # --- Version IA d'origine (human-in-the-loop) ---
    # Exposée pour que le front puisse prévisualiser/diff l'original IA avant un
    # revert et afficher l'état "édité" sans seconde requête.
    summary_article_ai: Optional[str] = None
    slides_ai: Optional[List[Slide]] = None
    cover_image_url_ai: Optional[str] = None
    is_edited: bool = False

    model_config = ConfigDict(from_attributes=True)



class ArticleTrueResponse(ArticleBase):
    
    score_pertinence : Optional[int] = None
    
    model_config = ConfigDict(from_attributes=True)

class ArticleInClusterResponse(ArticleResponse):
    """
    Version simplifiée d'un article quand il est listé dans le cadre d'un cluster.
    """
    id: int
    publication_date: Optional[datetime.datetime] = None
    image_urls: Optional[List[str]] = None
    
    model_config = ConfigDict(from_attributes=True)


class ClusterWithArticlesResponse(ClusterResponse):
    """
    Schéma complet pour un cluster, incluant une liste de ses articles.
    """
    articles: List[ArticleInClusterResponse]
    
    model_config = ConfigDict(from_attributes=True)


class ClusterInfo(BaseModel):
    """
    Schéma pour retourner des informations agrégées sur un cluster.
    """
    title: str 
    pertinences: List[str] 