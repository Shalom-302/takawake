import os
from typing import List, Dict, TypedDict, Optional, Any
from urllib.parse import urljoin
import httpx
from bs4 import BeautifulSoup, Tag
import trafilatura
import asyncio
import re
import json

import datetime
# from sqlalchemy.orm import Session # Plus utilisé directement ici
from langchain_core.prompts import ChatPromptTemplate
from langgraph.graph import StateGraph, END
from sqlalchemy.ext.asyncio import AsyncSession
from langchain_core.output_parsers import StrOutputParser
from langchain_core.runnables import Runnable # Correction Pylance pour LangGraph

# Imports depuis notre module `veille`, corrigés
from app.schemas import veille as veille_schema
# Importez les CRUDs spécifiques
from app.crud.crud_veille import crud_veille as crud_session_veille
from app.crud.crud_article import crud_article
from app.crud.crud_cluster import crud_cluster
from app.models.veille import ArticleStatus, VeilleStatus # NOUVEAUX IMPORTS

from app.core.config import settings
from app.services.embeddings import build_text_from_analysis, embed_texts
from app.services.qdrant_service import ensure_collection, upsert_article_vectors
from app.services.llm_factory import get_llm
from app.services.clustering import cluster_articles_for_veille

# Provider LLM par défaut. Override par requête via llm_provider="openai" ou "anthropic".
DEFAULT_LLM_PROVIDER = "deepseek"

# Concurrence : listings (httpx) / fetch articles (httpx + trafilatura) / LLM analyse
LISTING_CONCURRENCY = 5
FETCH_CONCURRENCY = 20
LLM_CONCURRENCY = 8

DEFAULT_HEADERS = {"User-Agent": "Mozilla/5.0 (compatible; TekawakeBot/1.0)"}

# --- Fonctions de Scraping et Registre (Inchangé, supposé être défini ailleurs ou complet) ---
class FoundArticle(TypedDict):
    title: str; url: str; source: str

DOMAINES_A_IGNORER = ['bloomberg.com', 'wsj.com', 'nytimes.com', 'reuters.com', 'ft.com', 'theinformation.com', 'axios.com', 't.co', 'ad.doubleclick.net']

async def scrape_techmeme(soup: BeautifulSoup, base_url: str) -> List[FoundArticle]:
    articles: List[FoundArticle] = []
    for link in soup.select('strong > a'):
        if not isinstance(link, Tag):
            continue
        href_attr = link.get('href')
        title = link.get_text(strip=True)
        if href_attr and isinstance(href_attr, str) and title and not any(d in href_attr for d in DOMAINES_A_IGNORER):
            articles.append({
                "title": title,
                "url": urljoin(base_url, href_attr),
                "source": "Techmeme"
            })
        if len(articles) >= 20:
            break
    return articles

async def scrape_techcabal(soup: BeautifulSoup, base_url: str) -> List[FoundArticle]:
    articles: List[FoundArticle] = []
    for link in soup.select("article.article-list-item a.article-list-title"):
        if not isinstance(link, Tag):
            continue
        title = link.get_text(strip=True)
        href_attr = link.get('href')
        if title and href_attr and isinstance(href_attr, str):
            articles.append({
                "title": title,
                "url": urljoin(base_url, href_attr),
                "source": "TechCabal"
            })
        if len(articles) >= 20:
            break
    return articles

async def scrape_techpoint_africa(soup: BeautifulSoup, base_url: str) -> List[FoundArticle]:
    articles: List[FoundArticle] = []
    for link in soup.select("div.gb-query-loop-item .value a"):
        if not isinstance(link, Tag):
            continue
        href_attr = link.get('href')
        title = link.get_text(strip=True)
        if href_attr and isinstance(href_attr, str) and title:
            articles.append({
                "title": title,
                "url": urljoin(base_url, href_attr),
                "source": "TechPoint Africa"
            })
        if len(articles) >= 20:
            break
    return articles

async def scrape_disruptafrica(soup: BeautifulSoup, base_url: str) -> List[FoundArticle]:
    articles: List[FoundArticle] = []
    for link in soup.select(".post-title a"):
        if not isinstance(link, Tag):
            continue
        href_attr = link.get('href')
        title = link.get_text(strip=True)
        if href_attr and isinstance(href_attr, str) and title:
            articles.append({
                "title": title,
                "url": urljoin(base_url, href_attr),
                "source": "Disrupt Africa"
            })
        if len(articles) >= 20:
            break
    return articles

async def scrape_weetracker(soup: BeautifulSoup, base_url: str) -> List[FoundArticle]:
    articles: List[FoundArticle] = []
    for link in soup.select("h5.f-title a"):
        if not isinstance(link, Tag):
            continue
        href_attr = link.get('href')
        title = link.get_text(strip=True)
        if href_attr and isinstance(href_attr, str) and title:
            articles.append({
                "title": title,
                "url": urljoin(base_url, href_attr),
                "source": "WeeTracker"
            })
        if len(articles) >= 20:
            break
    return articles

SCRAPER_REGISTRY = {
    "https://www.techmeme.com/": scrape_techmeme,
    "https://techcabal.com/": scrape_techcabal,
    "https://techpoint.africa/": scrape_techpoint_africa,
    "https://disruptafrica.com/": scrape_disruptafrica,
    "https://weetracker.com/": scrape_weetracker,
}

# --- Fonctions d'extraction (inchangées) ---
def extract_main_images(soup: BeautifulSoup, metadata=None, base_url: str = "") -> List[str]:
    candidates = {}
    def add_candidate(url: Optional[str], score: int):
        if not url or not isinstance(url, str) or not url.startswith('http'):
            return
        if url not in candidates or score > candidates[url]:
            candidates[url] = score

    if metadata and getattr(metadata, "image", None):
        add_candidate(getattr(metadata, "image"), 100)
    for prop in ["og:image", "twitter:image", "og:image:secure_url"]:
        tag = soup.find("meta", property=prop)
        if isinstance(tag, Tag):
            content = tag.get("content")
            if content and isinstance(content, str):
                add_candidate(urljoin(base_url, content), 95)

    main_content_selectors = ["article", "main", ".post-content", ".entry-content"]
    main_content = soup.find(main_content_selectors)
    if not main_content:
        main_content = soup.body

    if main_content and isinstance(main_content, Tag):
        for img in main_content.find_all("img"):
            if not isinstance(img, Tag):
                continue

            src_attr = img.get("src")
            if not src_attr or not isinstance(src_attr, str):
                continue

            if src_attr.startswith('data:image'):
                continue

            score = 50
            img_class_attr = img.get("class")
            img_class = img_class_attr if img_class_attr is not None else []
            if isinstance(img_class, list) and any(cls in img_class for cls in ["featured", "main-image", "wp-post-image"]):
                score += 30
            try:
                width = int(str(img.get("width", "0")))
                height = int(str(img.get("height", "0")))
                if width > 300 and height > 200:
                    score += 15
            except (ValueError, TypeError):
                pass
            add_candidate(urljoin(base_url, src_attr), score)

    sorted_candidates = sorted(candidates.items(), key=lambda item: item[1], reverse=True)
    return [url for url, score in sorted_candidates[:5]]

def extract_publication_date(soup: BeautifulSoup, metadata=None) -> Optional[datetime.datetime]:
    possible_dates = []

    if metadata and getattr(metadata, "date", None):
        possible_dates.append(metadata.date)

    for meta_prop in ["article:published_time", "og:published_time", "pubdate", "date", "dc.date", "last-modified"]:
        tag = soup.find("meta", property=meta_prop) or soup.find("meta", attrs={"name": meta_prop})
        if isinstance(tag, Tag) and tag.get("content"):
            possible_dates.append(tag.get("content"))

    for time_tag in soup.find_all(["time", "span"], attrs={"datetime": True}):
        if isinstance(time_tag, Tag):
            possible_dates.append(time_tag.get("datetime"))

    for raw_date in possible_dates:
        if not isinstance(raw_date, str):
            continue
        try:
            return datetime.datetime.fromisoformat(raw_date.replace("Z", "+00:00"))
        except Exception:
            pass
        for fmt in ("%Y-%m-%d", "%Y/%m/%d", "%d/%m/%Y", "%b %d, %Y", "%B %d, %Y"):
            try:
                return datetime.datetime.strptime(raw_date, fmt)
            except Exception:
                continue

    return None

# --- Logique LangGraph interne au service ---
class AgentState(TypedDict, total=False):
    db_session: AsyncSession
    veille_id: int
    query: str
    llm_provider: str
    http_client: httpx.AsyncClient
    found_articles: List[FoundArticle]
    prepared_articles: List[Dict[str, Any]]


# Prompt extrait au niveau module (recompilé une seule fois)
ANALYSIS_PROMPT_TEMPLATE = """Vous êtes un analyste technologique mondial doublé d'un stratège pour l'Afrique. Pour l'article fourni, effectuez une analyse complète en deux temps : une analyse globale et neutre, puis une analyse stratégique spécifique à l'Afrique.

**Partie 1 : Analyse Globale (Neutre)**
1.  **Résumé Neutre :** Rédigez un résumé factuel et dense de l'article, de style journalistique (type agence de presse), strictement compris entre 700 et 800 caractères.
2.  **Problématique Générale :** Identifiez la problématique principale ou universelle soulevée.

**Partie 2 : Analyse Stratégique pour l'Afrique**
3.  **Impact sur l'Afrique :** Quel est l'impact direct ou indirect pour le continent ?
4.  **Problématique Spécifique à l'Afrique :** Quelle dépendance ou faiblesse cela révèle-t-il pour l'Afrique ?
5.  **Éveil de Conscience :** Quelle est la leçon critique pour les acteurs de la tech africaine ?
6.  **Piste d'Opportunité :** Quelle opportunité concrète cela crée-t-il ?
7.  **Score de Pertinence :** Attribuez un score de 1 à 10 sur l'importance de cette nouvelle pour l'Afrique.

Article à analyser : <article_text>{content}</article_text>"""

_analysis_prompt = ChatPromptTemplate.from_template(ANALYSIS_PROMPT_TEMPLATE)
# La chaîne d'analyse est construite par-requête dans analyze_articles_node
# (dépend de state["llm_provider"]).


async def parallel_scrape_node(state: AgentState) -> dict:
    """Scrape les pages d'index des 5 sites en parallèle via httpx."""
    client = state["http_client"]
    sem = asyncio.Semaphore(LISTING_CONCURRENCY)

    async def scrape_one(site_url: str) -> List[FoundArticle]:
        async with sem:
            try:
                resp = await client.get(site_url, headers=DEFAULT_HEADERS)
                resp.raise_for_status()
            except Exception as e:
                print(f"ERREUR lors du scraping de {site_url}: {e}")
                return []

            scraper_function = SCRAPER_REGISTRY.get(site_url)
            if not scraper_function:
                return []

            soup = BeautifulSoup(resp.text, "html.parser")
            new_articles: List[FoundArticle] = await scraper_function(soup, site_url)

            cleaned: List[FoundArticle] = []
            for art in new_articles:
                url = art.get("url")
                title = art.get("title")
                source = art.get("source")
                if isinstance(url, list):
                    url = url[0] if url else None
                if not (url and isinstance(url, str) and title and source):
                    continue
                cleaned.append({
                    "url": urljoin(site_url, url),
                    "title": str(title),
                    "source": str(source),
                })
            return cleaned

    results = await asyncio.gather(
        *(scrape_one(site) for site in SCRAPER_REGISTRY.keys()),
        return_exceptions=False,
    )
    all_found: List[FoundArticle] = [a for sub in results for a in sub]
    print(f"--- parallel_scrape : {len(all_found)} articles bruts trouvés sur {len(SCRAPER_REGISTRY)} sites ---")
    return {"found_articles": all_found}


async def fetch_articles_node(state: AgentState) -> dict:
    """Télécharge et extrait le contenu des articles en parallèle (httpx + trafilatura)."""
    all_found = state.get("found_articles", [])
    veille_id = state["veille_id"]
    client = state["http_client"]

    if not all_found:
        return {"prepared_articles": []}

    unique_articles = list({a["url"]: a for a in all_found}.values())
    print(f"--- fetch_articles : extraction parallèle de {len(unique_articles)} articles uniques ---")

    sem = asyncio.Semaphore(FETCH_CONCURRENCY)

    async def fetch_one(art: FoundArticle) -> Dict[str, Any]:
        data: Dict[str, Any] = {
            "veille_id": veille_id,
            "source_url": art["url"],
            "source_name": art["source"],
            "title": art["title"],
            "status": ArticleStatus.PENDING,
            "status_message": None,
            "publication_date": None,
            "image_urls": [],
            "content": None,
            "analysis": None,
            "pertinence_cluster": None,
            "cluster_id": None,
        }
        async with sem:
            try:
                resp = await client.get(art["url"], headers=DEFAULT_HEADERS)
                resp.raise_for_status()
                html = resp.text
            except Exception as e:
                data["status"] = ArticleStatus.FAILED
                data["status_message"] = f"Téléchargement échoué: {e}"
                return data

            try:
                content = trafilatura.extract(html, favor_recall=True)
                metadata = trafilatura.extract_metadata(html)
                soup = BeautifulSoup(html, "html.parser")

                pub_date = extract_publication_date(soup, metadata)
                if pub_date is None:
                    pub_date = datetime.datetime.utcnow()

                image_urls = extract_main_images(soup, metadata, base_url=art["url"])

                data.update({
                    "publication_date": pub_date,
                    "image_urls": image_urls,
                    "content": content,
                })

                if not content or len(content) <= 250:
                    data["status"] = ArticleStatus.FAILED
                    data["status_message"] = "Contenu insuffisant"
            except Exception as e:
                data["status"] = ArticleStatus.FAILED
                data["status_message"] = f"Erreur d'extraction: {e}"
        return data

    prepared = await asyncio.gather(*(fetch_one(a) for a in unique_articles))
    ok = sum(1 for d in prepared if d["status"] == ArticleStatus.PENDING)
    print(f"--- fetch_articles : {ok}/{len(prepared)} articles avec contenu exploitable ---")
    return {"prepared_articles": prepared}


async def analyze_articles_node(state: AgentState) -> dict:
    """Analyse LLM en parallèle (Semaphore LLM_CONCURRENCY), puis persistance séquentielle."""
    prepared = state.get("prepared_articles", [])
    db = state["db_session"]
    provider = state.get("llm_provider") or DEFAULT_LLM_PROVIDER

    if not prepared:
        print("Aucun article préparé à analyser.")
        return {"status": "SUCCESS", "processed_articles": 0}

    print(f"--- analyze_articles : provider LLM = '{provider}' ---")
    # `method="function_calling"` est le seul commun dénominateur supporté par
    # les 3 providers : DeepSeek a désactivé `response_format=json_schema`
    # ("This response_format type is unavailable now"), OpenAI et Anthropic
    # acceptent tous deux le tool-calling pour la sortie structurée.
    analysis_chain = _analysis_prompt | get_llm(provider).with_structured_output(
        veille_schema.ArticleAnalysis,
        method="function_calling",
    )
    sem = asyncio.Semaphore(LLM_CONCURRENCY)

    async def analyze_one(data: Dict[str, Any]) -> Dict[str, Any]:
        # On skip ceux qui ont déjà échoué au fetch
        if data["status"] != ArticleStatus.PENDING or not data.get("content"):
            return data
        async with sem:
            try:
                raw = await analysis_chain.ainvoke({"content": data["content"][:8000]})
                obj = veille_schema.ArticleAnalysis.model_validate(raw)
                data["analysis"] = obj.model_dump()
                data["pertinence_cluster"] = obj.pertinence_cluster
                data["status"] = ArticleStatus.PROCESSED
            except Exception as e:
                data["status"] = ArticleStatus.FAILED
                data["status_message"] = f"Erreur du LLM: {e}"
                print(f"[LLM ERROR] {data.get('source_url')} ({type(e).__name__}): {e}")
        return data

    finalized = await asyncio.gather(*(analyze_one(d) for d in prepared))

    # Persistance séquentielle : AsyncSession n'est pas thread-safe.
    processed = 0
    for data in finalized:
        try:
            await crud_article.create_or_update(db=db, article_data=data)
            if data["status"] == ArticleStatus.PROCESSED:
                processed += 1
        except Exception as e:
            print(f"[WARN] Persistance KO pour {data.get('source_url')}: {e}")

    print(f"--- analyze_articles : {processed}/{len(finalized)} articles processed ---")
    return {"status": "SUCCESS", "processed_articles": processed}


async def index_articles_node(state: AgentState) -> dict:
    """Embed les articles PROCESSED via Gemini puis upsert dans Qdrant.

    Tolérant aux pannes : si Gemini ou Qdrant fail, on log et on retourne
    sans casser le workflow de veille (les articles restent en DB).
    Le cluster_id sera assigné en PR5 (HDBSCAN sur les vecteurs).
    """
    db = state["db_session"]
    veille_id = state["veille_id"]

    try:
        articles = await crud_article.get_all(
            db=db,
            veille_id=veille_id,
            status=ArticleStatus.PROCESSED,
            limit=1000,
        )
        if not articles:
            print(f"--- index_articles : aucun article processed à indexer ---")
            return {"indexed_articles": 0}

        items_with_text = []
        for art in articles:
            text = build_text_from_analysis(art.title, art.analysis)
            if text.strip():
                items_with_text.append((art, text))

        if not items_with_text:
            print(f"--- index_articles : pas de texte exploitable ---")
            return {"indexed_articles": 0}

        print(f"--- index_articles : embedding de {len(items_with_text)} articles via multilingual-e5-base ---")

        await ensure_collection()
        texts = [t for _, t in items_with_text]
        vectors = await embed_texts(texts, task_type="CLUSTERING")

        if len(vectors) != len(items_with_text):
            print(f"[WARN] mismatch vecteurs/articles ({len(vectors)} vs {len(items_with_text)}), abandon de l'upsert")
            return {"indexed_articles": 0}

        items = []
        for (art, _), vec in zip(items_with_text, vectors):
            analysis = art.analysis or {}
            pub = art.publication_date or datetime.datetime.utcnow()
            payload = {
                "veille_id": art.veille_id,
                "cluster_id": art.cluster_id,
                "title": art.title,
                "source_url": art.source_url,
                "source_name": art.source_name,
                "score_pertinence": analysis.get("score_pertinence"),
                "created_at": pub.isoformat(),
            }
            items.append({
                "article_id": art.id,
                "vector": vec,
                "payload": payload,
            })

        count = await upsert_article_vectors(items)
        print(f"--- index_articles : {count} vecteurs upsertés dans Qdrant ---")
        return {"indexed_articles": count}

    except Exception as e:
        print(f"[ERROR] index_articles a échoué (workflow continue) : {e}")
        return {"indexed_articles": 0}


def create_langgraph_app() -> Runnable[AgentState, Dict[str, Any]]:
    workflow = StateGraph(AgentState)
    workflow.add_node("scrape", parallel_scrape_node)
    workflow.add_node("fetch", fetch_articles_node)
    workflow.add_node("analyze", analyze_articles_node)
    workflow.add_node("index", index_articles_node)
    workflow.set_entry_point("scrape")
    workflow.add_edge("scrape", "fetch")
    workflow.add_edge("fetch", "analyze")
    workflow.add_edge("analyze", "index")
    workflow.add_edge("index", END)
    return workflow.compile()

langgraph_app: Runnable[AgentState, Dict[str, Any]] = create_langgraph_app()


# --- Fonction principale du Service (MIS À JOUR) ---
async def run_veille_workflow(
    db: AsyncSession,
    query: str,
    veille_id: int,
    llm_provider: str = DEFAULT_LLM_PROVIDER,
):
    # Le statut PENDING est défini avant d'appeler ce service (dans la tâche Celery/routeur)

    limits = httpx.Limits(max_connections=50, max_keepalive_connections=20)
    timeout = httpx.Timeout(30.0, connect=15.0)

    print(f"Lancement du workflow de veille pour la requête : '{query}' (Veille ID: {veille_id}, LLM: {llm_provider})")

    async with httpx.AsyncClient(limits=limits, timeout=timeout, follow_redirects=True) as http_client:
        initial_state: AgentState = {
            "db_session": db,
            "veille_id": veille_id,
            "query": query,
            "llm_provider": llm_provider,
            "http_client": http_client,
            "found_articles": [],
            "prepared_articles": [],
        }

        try:
            result = await langgraph_app.ainvoke(initial_state)

            veille_update_data = veille_schema.VeilleUpdate(status=VeilleStatus.SUCCESS)
            await crud_session_veille.update(db, veille_id=veille_id, veille_in=veille_update_data)

            print(f"Workflow de veille terminé pour ID {veille_id}. Statut mis à jour à SUCCESS.")
            return result
        except Exception as e:
            error_message = f"Échec du workflow de veille : {e}"
            print(f"--- ERREUR dans le workflow de veille (ID: {veille_id}) : {error_message} ---")
            veille_update_data = veille_schema.VeilleUpdate(status=VeilleStatus.FAILED, status_message=error_message)
            await crud_session_veille.update(db, veille_id=veille_id, veille_in=veille_update_data)
            raise

# --- NOUVEAU : Orchestrateur de Backfill (MIS À JOUR) ---
async def run_full_backfill_service(db: AsyncSession, llm_provider: str = DEFAULT_LLM_PROVIDER, veille_id: Optional[int] = None):
    """
    Orchestre l'exécution de toutes les étapes du backfill (clustering et pertinence).

    veille_id fourni → ne traite que cette veille ; None → toutes les veilles.
    """
    print(f"--- Démarrage du service de backfill complet orchestré (LLM: {llm_provider}, veille: {veille_id or 'toutes'}) ---")

    try:
        print("Étape 1: Exécution du backfill des clusters.")
        await backfill_clusters_service(db, llm_provider=llm_provider, veille_id=veille_id)
        print("Étape 1: Backfill des clusters terminé.")

        print("Étape 2: Exécution du backfill de la pertinence.")
        await backfill_pertinence_service(db, llm_provider=llm_provider)
        print("Étape 2: Backfill de la pertinence terminé.")
        
        print(f"--- Fin du service de backfill complet orchestré. ---")
        return {"status": "SUCCESS", "message": "Backfill complet terminé."}
    except Exception as e:
        error_message = f"Le backfill complet a échoué: {e}"
        print(f"--- ERREUR dans le service de backfill complet : {error_message} ---")
        raise # Relaisser l'exception pour que Celery la capture


# --- backfill_clusters_service (clustering v2 — agglomératif sur vecteurs) ---
async def backfill_clusters_service(
    db: AsyncSession,
    llm_provider: str = DEFAULT_LLM_PROVIDER,
    veille_id: Optional[int] = None,
):
    """
    Backfill du clustering. Délègue au moteur v2 (regroupement agglomératif sur
    les vecteurs Qdrant, cf. app/services/clustering.py) : le LLM ne fait que
    nommer les clusters, le regroupement est déterministe.

    veille_id fourni → clusterise cette veille.
    veille_id None   → rétro-compat : clusterise chaque veille existante.
    """
    if veille_id is not None:
        return await cluster_articles_for_veille(db, veille_id, llm_provider)

    veilles = await crud_session_veille.get_all(db, limit=1000)
    print(f"--- Backfill clustering : {len(veilles)} veille(s) à traiter ---")
    details = []
    for v in veilles:
        details.append(await cluster_articles_for_veille(db, v.id, llm_provider))
    return {"status": "SUCCESS", "veilles_traitees": len(details), "details": details}


# --- backfill_pertinence_service (MIS À JOUR) ---
async def backfill_pertinence_service(db: AsyncSession, llm_provider: str = DEFAULT_LLM_PROVIDER):
    """
    Service de backfill pour générer la justification de pertinence pour chaque article.
    """
    print(f"--- Démarrage du service de backfill de pertinence (Étape 2 : Justification, LLM: {llm_provider}) ---")

    articles_to_process = await crud_article.get_articles_needing_pertinence(db)
    if not articles_to_process:
        print("Aucun article à traiter pour la justification. Fin.")
        return

    print(f"Trouvé {len(articles_to_process)} articles nécessitant une justification de pertinence.")

    pertinence_prompt_template = """
    Analyse la situation suivante :
    - **Thématique du Cluster :** "{cluster_title}"
    - **Contenu de l'article :** "{contenu_article}"

    Ta mission : Rédige une seule phrase concise qui explique pourquoi cet article spécifique appartient à cette thématique.
    Commence ta phrase par "Cet article traite de..." ou une formulation similaire.

    **Exemple :**
    Cet article traite de la levée de fonds d'une startup de paiement, illustrant directement les défis de la régulation financière en Afrique.
    """
    pertinence_prompt = ChatPromptTemplate.from_template(pertinence_prompt_template)
    pertinence_chain = pertinence_prompt | get_llm(llm_provider) | StrOutputParser()

    updated_count = 0
    for article_db_obj in articles_to_process:
        if not article_db_obj.cluster_id:
            print(f"[WARNING] Article {article_db_obj.id} sans cluster_id alors qu'il devrait en avoir un.")
            continue
        
        db_cluster = await crud_cluster.get(db, article_db_obj.cluster_id)
        cluster_title = db_cluster.title if db_cluster else "Cluster inconnu"

        if not article_db_obj.content or not cluster_title:
            continue

        try:
            justification = await pertinence_chain.ainvoke({
                "cluster_title": cluster_title,
                "contenu_article": article_db_obj.content[:4000]
            })

            if justification:
                article_update_data = veille_schema.ArticleUpdate(pertinence_cluster=justification.strip())
                updated_article = await crud_article.update(db, article_id=article_db_obj.id, article_in=article_update_data)
                
                if updated_article:
                    updated_count += 1
                    print(f"Article {article_db_obj.id} → Pertinence générée.")
        except Exception as e:
            print(f"[ERREUR] Impossible de générer la pertinence pour l'article {article_db_obj.id}: {e}")

    print(f"--- Fin du backfill de pertinence. {updated_count} articles mis à jour. ---")



# --- NOUVEL ORCHESTRATEUR : Génération de Contenu de Cluster ---
async def generate_cluster_content_service(
    db: AsyncSession,
    cluster_id: int,
    llm_provider: str = DEFAULT_LLM_PROVIDER,
):
    """
    Orchestre la génération du contenu complet pour un cluster :
    1.  Génère l'article de synthèse.
    2.  Génère les slides à partir de la synthèse.
    """
    print(f"--- Démarrage de l'orchestrateur de génération de contenu pour le cluster ID : '{cluster_id}' (LLM: {llm_provider}) ---")

    try:
        # Étape 1 : Générer l'article de synthèse
        print(f"Étape 1 : Génération de l'article de synthèse pour le cluster ID '{cluster_id}'.")
        await generate_article_by_cluster_belong(db, cluster_id, llm_provider=llm_provider)
        print(f"Étape 1 : Article de synthèse pour le cluster ID '{cluster_id}' généré avec succès.")

        # Étape 2 : Générer les slides à partir de l'article
        print(f"Étape 2 : Génération des slides pour le cluster ID '{cluster_id}'.")
        await generate_slides_for_summary_article(db, cluster_id, llm_provider=llm_provider)
        print(f"Étape 2 : Slides pour le cluster ID '{cluster_id}' générés avec succès.")
        
        print(f"--- Fin de l'orchestrateur de génération de contenu pour le cluster ID '{cluster_id}'. ---")
        return {"status": "SUCCESS", "message": "Contenu du cluster généré."}

    except Exception as e:
        error_message = f"L'orchestrateur de génération de contenu a échoué pour le cluster ID '{cluster_id}': {e}"
        print(f"--- ERREUR dans l'orchestrateur de génération de contenu : {error_message} ---")
        # L'exception est levée par les fonctions internes et sera capturée par la tâche Celery
        raise


# --- generate_article_by_cluster_belong (MIS À JOUR) ---
async def generate_article_by_cluster_belong(
    db: AsyncSession,
    cluster_id: int,
    llm_provider: str = DEFAULT_LLM_PROVIDER,
):
    """
    Génère un article de synthèse basé sur les résumés neutres de tous les articles d'un cluster.
    """
    print(f"--- Démarrage de la génération d'article de synthèse pour le cluster ID : '{cluster_id}' (LLM: {llm_provider}) ---")

    db_cluster = await crud_cluster.get(db, cluster_id)
    if not db_cluster:
        print(f"Cluster avec ID '{cluster_id}' non trouvé. Fin du processus.")
        raise ValueError(f"Cluster avec ID '{cluster_id}' non trouvé.") # Lever une erreur pour l'orchestrateur
    cluster_title = db_cluster.title

    summaries = await crud_article.get_neutral_summaries_by_cluster_id(db, cluster_id)
    if not summaries:
        print(f"Aucun résumé trouvé pour le cluster '{cluster_title}' (ID: {cluster_id}). Fin du processus.")
        raise ValueError(f"Aucun résumé d'article trouvé pour le cluster '{cluster_title}' (ID: {cluster_id}).") # Lever une erreur
    
    print(f"Nombre de caractères des résumés concaténés pour le cluster '{cluster_title}' : {len(summaries)}")

    synthesis_prompt_template = """
    Tu es un journaliste spécialisé dans la tech africaine, reconnu pour ta capacité à synthétiser des informations complexes.

    **Mission :**
    À partir de la série de résumés d'articles ci-dessous, qui traitent tous de la même thématique, rédige un article de fond unique et cohérent.

    **Instructions :**
    1.  **Analyse et Synthèse :** Lis attentivement tous les résumés pour en extraire les idées clés, les tendances, les chiffres importants et les points de vue divergents.
    2.  **Structure :** L'article doit avoir un titre percutant, une introduction qui pose le contexte, un corps de texte qui développe l'analyse, et une conclusion qui ouvre des perspectives.
    3.  **Ton :** Adopte un style journalistique, informatif et engageant. Ne te contente pas de juxtaposer les résumés, mais crée un récit fluide et logique.
    4.  **Contenu :** L'article final doit être une œuvre originale qui apporte une plus-value par rapport aux articles sources, en connectant les points et en offrant une vue d'ensemble.
    5.  **Format :** La sortie doit être un texte brut, bien formaté, prêt à être publié.

    **Résumés à synthétiser :**
    {summaries}
    """
    synthesis_prompt = ChatPromptTemplate.from_template(synthesis_prompt_template)
    synthesis_chain = synthesis_prompt | get_llm(llm_provider) | StrOutputParser()

    try:
        print("Appel au LLM pour la génération de l'article de synthèse...")
        synthesized_article = await synthesis_chain.ainvoke({"summaries": summaries})
        print("Article de synthèse généré.")

        if synthesized_article:
            cluster_update_data = veille_schema.ClusterUpdate(
                summary_article=synthesized_article
                # is_published=True # La publication est maintenant déclenchée par un endpoint dédié ou après slides
            )
            await crud_cluster.update(db, cluster_id=cluster_id, cluster_in=cluster_update_data)
            print(f"Article de synthèse pour le cluster '{cluster_title}' (ID: {cluster_id}) sauvegardé avec succès.")
            return {"status": "SUCCESS", "message": "Synthèse générée"}
        else:
            print(f"[AVERTISSEMENT] Le LLM a retourné un contenu vide pour l'article de synthèse du cluster '{cluster_title}'.")
            raise ValueError("Le LLM a retourné un contenu vide pour la synthèse.")

    except Exception as e:
        print(f"[ERREUR] Impossible de générer l'article de synthèse pour le cluster '{cluster_title}' (ID: {cluster_id}): {e}")
        raise # Relaisser l'exception


# --- generate_slides_for_summary_article (MIS À JOUR) ---
async def generate_slides_for_summary_article(
    db: AsyncSession,
    cluster_id: int,
    llm_provider: str = DEFAULT_LLM_PROVIDER,
):
    """
    Génère un carrousel de 10 slides à partir de l'article de synthèse d'un cluster.
    """
    print(f"--- Démarrage de la génération de slides pour le cluster ID : '{cluster_id}' (LLM: {llm_provider}) ---")

    db_cluster = await crud_cluster.get_summary_article_by_cluster(db, cluster_id)
    if not db_cluster or not db_cluster.summary_article:
        print(f"Aucun article de synthèse trouvé ou contenu vide pour le cluster ID '{cluster_id}'. Fin.")
        raise ValueError(f"Aucun article de synthèse trouvé ou contenu vide pour le cluster ID '{cluster_id}'.")

    cluster_title = db_cluster.title
    summary_article_content = db_cluster.summary_article

    slides_prompt_template = """
    **Instructions :**
    **Ta mission est de transformer l'article de fond qui te sera fourni en un carrousel de slides captivants et engageants, optimisés pour les plateformes sociales, en suivant une structure narrative claire et percutante.**

    ---

    **Instructions détaillées pour la génération des slides :**

    1.  **Analyse et Synthèse (Contenu) :**
        *   Lis attentivement l'article fourni. Ton rôle est d'en extraire les idées principales, les faits clés, les arguments et les points culminants.
        *   Chaque slide doit présenter une idée unique, claire et forte, directement tirée de l'article et s'intégrant logiquement au récit global.
        *   **Ne pas inventer d'informations :** Le contenu de chaque slide doit être basé exclusivement sur l'article fourni.

    2.  **Storytelling Captivant (Structure narrative) :**
        *   Crée un récit cohérent et dynamique à travers les slides. Chaque slide doit susciter l'envie de découvrir le suivant, comme les chapitres d'une histoire.
        *   **Début :** Commence par une accroche forte et intrigante qui capte immédiatement l'attention.
        *   **Milieu :** Développe l'intrigue, la tension, les faits clés ou les explications essentielles de l'article.
        *   **Fin :** Termine par une conclusion mémorable, une réflexion finale impactante ou un appel à l'action clair.

    3.  **Ton & Style (Engagement) :**
        *   Adopte un ton direct, percutant, engageant et parfaitement adapté aux codes des réseaux sociaux.
        *   Utilise des questions rhétoriques, des affirmations audacieuses, des faits surprenants, des statistiques clés ou des emojis pertinents pour maintenir l'intérêt et l'interaction.

    4.  **Longueur du Texte (Concise & Impact) :**
        *   Le texte de chaque slide doit être concis pour une lecture rapide et efficace.
        *   Vise une moyenne d'environ 200 caractères par slide. Cette longueur est un guide ; la flexibilité est permise pour maximiser l'impact ou la clarté, mais la concision reste primordiale.

    5.  **Nombre de Slides :** Le nombre total de slides est 10. Adapte-le pour raconter l'histoire de l'article de la manière la plus efficace et la plus complète possible, sans diluer le propos ni surcharger d'informations.

    **Exemple de format de sortie :**
        [
    {{"slide": 1, "texte": "Depuis une semaine, le Sénégal fait face à une Cyberattaque qui paralyse ses finances. "}},
    {{"slide": 2, "texte": "Une offensive informatique de grande ampleur a neutralisé les outils de gestion et de recouvrement de l'administration fiscale.. "}},
    {{"slide": 3, "texte": "Les auteurs, situés selon les premières investigations en Europe, demandent une rançon de 10 millions d'euros pour restaurer l'accès aux systèmes. Soit 6,5 milliards FCFA"}},
    ...
    {{"slide": 4, "texte": "Pour appuyer leur revendication, les pirates ont publié des fragments de données internes à la DGID, montrant qu'ils occupent déjà une position critique dans les systèmes."}},
    ...
    en terminant par un eveil de conscience au 10ème slide.
    ]

    **Article à transformer :**
    {summary_article}
    """
    slides_prompt = ChatPromptTemplate.from_template(slides_prompt_template)
    slides_chain = slides_prompt | get_llm(llm_provider) | StrOutputParser()

    llm_response_str = ""
    try:
        print("Appel au LLM pour la génération des slides...")
        llm_response_str = await slides_chain.ainvoke({"summary_article": summary_article_content})
        
        json_match = re.search(r"\[.*\]", llm_response_str, re.DOTALL)
        if not json_match:
            raise json.JSONDecodeError("Aucune liste JSON trouvée dans la réponse du LLM.", llm_response_str, 0)
        
        slides_raw_data = json.loads(json_match.group(0))
        slides_data_pydantic = [veille_schema.Slide(**s) for s in slides_raw_data]
        
        print("Slides générés et parsés avec succès.")

        await crud_cluster.update_slides_for_cluster(db, cluster_id=cluster_id, slides_data=slides_data_pydantic)
        print(f"Slides pour le cluster '{cluster_title}' (ID: {cluster_id}) sauvegardés avec succès.")
        return {"status": "SUCCESS", "message": "Slides générés"}

    except json.JSONDecodeError as e:
        print(f"[ERREUR] La réponse du LLM n'est pas un JSON valide : {e.msg}\nRéponse brute: {llm_response_str}")
        raise # Relaisser l'exception
    except Exception as e:
        print(f"[ERREUR] Impossible de générer les slides pour le cluster '{cluster_title}' (ID: {cluster_id}): {e}")
        raise # Relaisser l'exception