import datetime
from typing import List, Dict, Optional, Any

from sqlalchemy import String, Text, DateTime, Boolean, JSON, ForeignKey, Integer
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy import func

from app.core.db import Base 

# --- Modèle Category ---
class Category(Base):
    __tablename__ = "categories"
    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    name: Mapped[str] = mapped_column(String(100), unique=True, nullable=False)

    # Relation One-to-Many avec Cluster
    # "clusters" fait référence à l'attribut de relation dans le modèle Cluster
    clusters: Mapped[List["Cluster"]] = relationship(back_populates="category")

    def __repr__(self) -> str:
        return f"<Category(id={self.id}, name='{self.name}')>"

# --- Modèle Veille ---
class Veille(Base):
    __tablename__ = "veilles"
    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    prompt: Mapped[str] = mapped_column(Text, nullable=False) # Le prompt qui a initié la veille
    created_at: Mapped[datetime.datetime] = mapped_column(DateTime, server_default=func.now(), nullable=False)

    # Relation One-to-Many avec Article
    # "veille" fait référence à l'attribut de relation dans le modèle Article
    articles: Mapped[List["Article"]] = relationship(back_populates="veille")

    def __repr__(self) -> str:
        return f"<Veille(id={self.id}, prompt='{self.prompt[:50]}...')>"

# --- Modèle Cluster ---
class Cluster(Base):
    __tablename__ = "clusters"
    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    title: Mapped[str] = mapped_column(Text, nullable=False) # Le titre/question du cluster
    summary_article: Mapped[Optional[str]] = mapped_column(Text, nullable=True) # L'article de synthèse LLM
    slides: Mapped[Optional[List[Dict[str, Any]]]] = mapped_column(JSON, nullable=True) # Les slides générées
    is_published: Mapped[bool] = mapped_column(Boolean, default=False, index=True)
    created_at: Mapped[datetime.datetime] = mapped_column(DateTime, server_default=func.now(), nullable=False)

    # Clé étrangère pour Category (nullable pour la flexibilité)
    category_id: Mapped[Optional[int]] = mapped_column(ForeignKey("categories.id"), nullable=True, index=True)
    # Relation Many-to-One avec Category
    category: Mapped[Optional["Category"]] = relationship(back_populates="clusters")

    # Relation One-to-Many avec Article
    # "cluster" fait référence à l'attribut de relation dans le modèle Article
    articles: Mapped[List["Article"]] = relationship(back_populates="cluster")

    def __repr__(self) -> str:
        return f"<Cluster(id={self.id}, title='{self.title[:50]}...')>"

# --- Modèle Article ---
class Article(Base):
    __tablename__ = "articles"
    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)

    # Clés étrangères
    veille_id: Mapped[int] = mapped_column(ForeignKey("veilles.id"), nullable=False, index=True)
    cluster_id: Mapped[Optional[int]] = mapped_column(ForeignKey("clusters.id"), nullable=True, index=True)

    # Infos de base de l'article
    source_url: Mapped[str] = mapped_column(String(1024), unique=True, index=True, nullable=False)
    source_name: Mapped[str] = mapped_column(String(100), nullable=False)
    title: Mapped[str] = mapped_column(Text, nullable=False)
    publication_date: Mapped[Optional[datetime.datetime]] = mapped_column(DateTime, nullable=True, index=True)
    scraping_date: Mapped[datetime.datetime] = mapped_column(DateTime, server_default=func.now(), nullable=False) # Date de traitement de l'article

    # Contenu et état de traitement
    image_urls: Mapped[Optional[List[str]]] = mapped_column(JSON, nullable=True) # URLs des images
    content: Mapped[Optional[str]] = mapped_column(Text, default=None) # Contenu textuel extrait
    is_processed: Mapped[bool] = mapped_column(Boolean, default=False, index=True) # Traitement initial réussi
    processing_error: Mapped[Optional[str]] = mapped_column(Text, nullable=True) # Message d'erreur si échec

    # Analyse LLM
    analysis: Mapped[Optional[Dict[str, Any]]] = mapped_column(JSON, default=None) # L'objet d'analyse LLM complet
    pertinence_cluster: Mapped[Optional[str]] = mapped_column(Text, nullable=True) # Justification du cluster
    score_pertinence: Mapped[Optional[int]] = mapped_column(Integer, index=True, default=None) # Score extrait pour indexation/tri

    # Relations Many-to-One
    veille: Mapped["Veille"] = relationship(back_populates="articles")
    cluster: Mapped[Optional["Cluster"]] = relationship(back_populates="articles")

    def __repr__(self) -> str:
        return f"<Article(id={self.id}, title='{self.title[:30]}...')>"