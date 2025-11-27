import datetime
from pydantic import BaseModel, Field, ConfigDict, EmailStr
from typing import List, Optional, Dict, Any

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
    """
    slide: int
    texte: str

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

class ImageInfo(BaseModel):
    """
    Schéma pour retourner les informations d'une image pertinente.
    Utile pour des vues agrégées (ex: galerie des images les plus pertinentes).
    """
    image_url: str
    score_pertinence: Optional[int] = None
    article_title: str
    article_id: int

# --- Schemas pour les entités du modèle de données (Veille, Category, Cluster, Article) ---

# --- Category Schemas ---
class CategoryBase(BaseModel):
    name: str

class CategoryCreate(CategoryBase):
    pass

# --- Nouveau: CategoryUpdate ---
class CategoryUpdate(BaseModel):
    name: Optional[str] = None

class CategoryResponse(CategoryBase):
    id: int
    
    model_config = ConfigDict(from_attributes=True)

# --- Veille Schemas ---
class VeilleBase(BaseModel):
    prompt: str

class VeilleCreate(VeilleBase):
    pass # Pas de champs supplémentaires pour la création

# --- Nouveau: VeilleUpdate ---
class VeilleUpdate(BaseModel):
    prompt: Optional[str] = None

class VeilleResponse(VeilleBase):
    id: int
    created_at: datetime.datetime
    
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

# --- Nouveau: ArticleUpdate ---
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
    
    is_processed: Optional[bool] = None
    processing_error: Optional[str] = None
    
    score_pertinence: Optional[int] = None
    pertinence_cluster: Optional[str] = None
    
    analysis: Optional[ArticleAnalysis] = None # L'objet d'analyse LLM complet

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
    
    is_processed: bool
    processing_error: Optional[str] = None
    
    score_pertinence: Optional[int] = None
    pertinence_cluster: Optional[str] = None
    
    analysis: Optional[ArticleAnalysis] = None

    model_config = ConfigDict(from_attributes=True)

# --- Cluster Schemas ---

class ClusterBase(BaseModel):
    title: str

class ClusterCreate(ClusterBase):
    pass

# --- Nouveau: ClusterUpdate ---
class ClusterUpdate(BaseModel):
    """
    Schéma pour la mise à jour d'un cluster existant.
    Tous les champs sont Optional pour permettre des mises à jour partielles.
    """
    title: Optional[str] = None
    summary_article: Optional[str] = None
    slides: Optional[List[Slide]] = None
    is_published: Optional[bool] = None
    category_id: Optional[int] = None

class ClusterResponse(ClusterBase):
    id: int
    category_id: Optional[int] = None
    category: Optional[CategoryResponse] = None # Si la catégorie est chargée
    
    summary_article: Optional[str] = None
    slides: Optional[List[Slide]] = None
    is_published: bool
    created_at: datetime.datetime

    model_config = ConfigDict(from_attributes=True)

# --- Schéma pour des vues agrégées (ex: un cluster avec une liste d'articles simplifiés) ---

class ArticleInClusterResponse(ArticleBase):
    """
    Version simplifiée d'un article quand il est listé dans le cadre d'un cluster.
    """
    id: int
    publication_date: Optional[datetime.datetime] = None
    score_pertinence: Optional[int] = None
    image_urls: Optional[List[str]] = None
    
    model_config = ConfigDict(from_attributes=True)


class ClusterWithArticlesResponse(ClusterResponse):
    """
    Schéma complet pour un cluster, incluant une liste de ses articles.
    """
    articles: List[ArticleInClusterResponse]
    
    model_config = ConfigDict(from_attributes=True)


# --- ClusterInfo (ajouté pour être utilisé comme type de retour) ---
class ClusterInfo(BaseModel):
    """
    Schéma pour retourner des informations agrégées sur un cluster.
    """
    title: str # Le titre/question du cluster (correspond à Cluster.title)
    pertinences: List[str] # Les justifications des articles liés

