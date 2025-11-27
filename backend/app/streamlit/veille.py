import streamlit as st
import requests
from typing import Dict, Any, List, Optional
from collections import defaultdict
from urllib.parse import quote

# --- Configuration de la Page ---
st.set_page_config(page_title="Dashboard de Veille", layout="wide")

# --- URL de l'API ---
FASTAPI_BASE_URL = "http://127.0.0.1:8000"


# --- Fonctions d'aide ---
def format_key(key_string):
    """Transforme une clé_snake_case en Titre lisible."""
    return ' '.join(word.capitalize() for word in key_string.split('_'))

@st.cache_data(ttl=600)
def get_available_clusters():
    """Récupère la liste des clusters disponibles depuis l'API."""
    try:
        response = requests.get(f"{FASTAPI_BASE_URL}/api/veille/clusters")
        if response.status_code == 200:
            clusters_data = response.json()
            cluster_names = [cluster['sujet_cluster'] for cluster in clusters_data if 'sujet_cluster' in cluster]
            return ["Tous"] + cluster_names
        return ["Tous"]
    except requests.exceptions.ConnectionError:
        return ["Tous"]

@st.cache_data(ttl=30)
def get_summary_for_cluster(cluster_name: str):
    """Récupère l'article de synthèse pour un cluster donné."""
    if not cluster_name or cluster_name == "Tous":
        return None
    try:
        encoded_cluster_name = quote(cluster_name)
        endpoint = f"{FASTAPI_BASE_URL}/api/veille/clusters/{encoded_cluster_name}/summary"
        response = requests.get(endpoint)
        if response.status_code == 200:
            return response.json()
        return None
    except requests.exceptions.ConnectionError:
        return None

@st.cache_data(ttl=30)
def get_slides_for_cluster(cluster_name: str) -> List[Dict[str, Any]] | None:
    """Récupère les slides générés pour un cluster."""
    if not cluster_name or cluster_name == "Tous":
        return None
    try:
        encoded_cluster_name = quote(cluster_name)
        endpoint = f"{FASTAPI_BASE_URL}/api/veille/clusters/{encoded_cluster_name}/slides"
        response = requests.get(endpoint)
        if response.status_code == 200:
            return response.json()
        return None
    except requests.exceptions.ConnectionError:
        return None

@st.cache_data(ttl=30)
def get_images_for_cluster(cluster_name: str) -> Optional[List[str]]:
    """
    Récupère la liste des URLs d'images de l'article le plus pertinent pour un cluster.
    """
    if not cluster_name or cluster_name == "Tous":
        return None
    try:
        encoded_cluster_name = quote(cluster_name)
        endpoint = f"{FASTAPI_BASE_URL}/api/veille/clusters/{encoded_cluster_name}/image"
        response = requests.get(endpoint)
        if response.status_code == 200 and response.json():
            return response.json()
        return None
    except requests.exceptions.ConnectionError:
        return None

# --- Interface Principale ---
st.title("📊 Dashboard de Veille Technologique")
st.info("Ce dashboard appelle directement les routes de l'API sans authentification pour le test.")

# --- Section 1: Actions Globales ---
with st.expander("🚀 Actions Globales", expanded=False):
    veille_query = st.text_input("Sujet de la veille", "Tendances IA en Afrique")
    if st.button("Démarrer la veille"):
        endpoint = f"{FASTAPI_BASE_URL}/api/veille/run"
        try:
            with st.spinner("Lancement de la tâche de veille..."):
                response = requests.post(endpoint, params={"query": veille_query})
                if response.status_code == 202:
                    st.success(f"✅ {response.json().get('message')}")
                else:
                    st.error(f"❌ Erreur: {response.text}")
        except requests.exceptions.ConnectionError as e:
            st.error(f"🔌 Impossible de se connecter à l'API: {e}")

# --- Section 2: Afficher les articles collectés ---
st.header("📚 Articles Collectés")

# Filtres
clusters = get_available_clusters()
selected_cluster = st.selectbox("Filtrer par Sujet (Cluster)", clusters)

# --- Affichage de la Synthèse et des Slides ---
if selected_cluster and selected_cluster != "Tous":
    
    # --- SYNTHÈSE ---
    st.subheader(f"Synthèse pour : {selected_cluster}")
    
    # Fetch and display images with navigation
    cluster_image_urls = get_images_for_cluster(selected_cluster)
    if cluster_image_urls:
        # Initialiser l'index de l'image dans l'état de la session
        if 'image_index' not in st.session_state:
            st.session_state.image_index = 0

        # S'assurer que l'index est valide
        if st.session_state.image_index >= len(cluster_image_urls):
            st.session_state.image_index = 0

        # Afficher l'image actuelle
        st.image(cluster_image_urls[st.session_state.image_index], caption=f"Image {st.session_state.image_index + 1}/{len(cluster_image_urls)} pour le cluster", use_container_width=True)

        # Boutons de navigation pour les images, uniquement si plusieurs images sont disponibles
        if len(cluster_image_urls) > 1:
            img_col1, img_col2, img_col3 = st.columns([1, 8, 1])
            with img_col1:
                if st.button("⬅️", key="prev_image", use_container_width=True):
                    st.session_state.image_index = (st.session_state.image_index - 1) % len(cluster_image_urls)
                    st.rerun()
            with img_col3:
                if st.button("➡️", key="next_image", use_container_width=True):
                    st.session_state.image_index = (st.session_state.image_index + 1) % len(cluster_image_urls)
                    st.rerun()
    else:
        st.info("Aucune image pertinente trouvée pour ce cluster.")

    summary_article = get_summary_for_cluster(selected_cluster)
    
    if summary_article:
        with st.container(border=True):
            st.markdown(f"##### {summary_article['title']}")
            st.caption(f"Source: {summary_article['source']} | Date de génération: {summary_article.get('date', 'N/A')}")
            st.markdown(summary_article['summary_article'])
    else:
        st.info("Aucune synthèse n'a encore été générée pour ce cluster.")
    
    if st.button("🔄 Générer ou Mettre à jour la synthèse", key=f"gen_summary_{selected_cluster}", use_container_width=True):
        encoded_cluster_name = quote(selected_cluster)
        endpoint = f"{FASTAPI_BASE_URL}/api/veille/clusters/{encoded_cluster_name}/generate-summary"
        try:
            response = requests.post(endpoint)
            if response.status_code == 202:
                st.success("Tâche de génération de synthèse lancée. Actualisez dans un instant.")
                st.cache_data.clear()
                st.rerun()
            else:
                st.error(f"Erreur: {response.text}")
        except requests.exceptions.ConnectionError:
            st.error("API non joignable.")

    st.divider()

    # --- SLIDES ---
    st.subheader("Carrousel de Slides")
    slides = get_slides_for_cluster(selected_cluster)

    if slides:
        # Initialiser l'index du slide dans l'état de la session
        if 'slide_index' not in st.session_state:
            st.session_state.slide_index = 0

        # Afficher le slide actuel
        current_slide = slides[st.session_state.slide_index]
        with st.container(border=True):
            st.markdown(f"<p style='text-align: center; font-size: 24px;'>{current_slide['texte']}</p>", unsafe_allow_html=True)
            st.caption(f"Slide {current_slide['slide']}/{len(slides)}")

        # Boutons de navigation
        col1, col2, col3 = st.columns([1, 8, 1])
        with col1:
            if st.button("⬅️ Précédent", use_container_width=True):
                if st.session_state.slide_index > 0:
                    st.session_state.slide_index -= 1
                    st.rerun()
        with col3:
            if st.button("Suivant ➡️", use_container_width=True):
                if st.session_state.slide_index < len(slides) - 1:
                    st.session_state.slide_index += 1
                    st.rerun()
    else:
        st.info("Aucun slide n'a encore été généré pour ce cluster.")

    if st.button("✨ Générer les slides", key=f"gen_slides_{selected_cluster}", use_container_width=True):
        encoded_cluster_name = quote(selected_cluster)
        endpoint = f"{FASTAPI_BASE_URL}/api/veille/clusters/{encoded_cluster_name}/generate-slides"
        try:
            response = requests.post(endpoint)
            if response.status_code == 202:
                st.success("Tâche de génération de slides lancée. Actualisez dans un instant.")
                st.cache_data.clear()
                st.rerun()
            else:
                st.error(f"Erreur: {response.text}")
        except requests.exceptions.ConnectionError:
            st.error("API non joignable.")


# --- Affichage des Articles Sources ---
st.header("Articles Sources")
col1, col2 = st.columns(2)
with col1:
    published_status = st.selectbox("Filtrer par Statut", ["Tous", "Publiés", "Non publiés"])
with col2:
    min_score = st.slider("Filtrer par Score de Pertinence Minimum", 1, 10, 1)

if st.button("🔄 Récupérer les articles sources", use_container_width=True):
    params: Dict[str, Any] = {"score_min": min_score}
    if published_status == "Publiés": params["published"] = True
    elif published_status == "Non publiés": params["published"] = False
    if selected_cluster != "Tous": params["cluster"] = selected_cluster
    
    endpoint = f"{FASTAPI_BASE_URL}/api/veille/articles"
    try:
        response = requests.get(endpoint, params=params)
        if response.status_code == 200:
            st.session_state['articles'] = [a for a in response.json() if a.get('source') != 'Kaapi AI']
        else:
            st.error(f"❌ Erreur: {response.text}")
            st.session_state['articles'] = []
    except requests.exceptions.ConnectionError as e:
        st.error(f"🔌 Impossible de se connecter à l'API: {e}")
        st.session_state['articles'] = []

if 'articles' in st.session_state and st.session_state['articles']:
    articles = st.session_state['articles']
    st.success(f"🔍 {len(articles)} article(s) source(s) trouvé(s).")
    
    for article in articles:
        with st.container(border=True):
            col_info, col_action = st.columns([4, 1])
            with col_info:
                st.markdown(f"##### <span style='color: #28a745;'>Score: {article.get('score_pertinence', 'N/A')}/10</span> | {article['title']}", unsafe_allow_html=True)
                st.caption(f"Source: {article['source']} | Date: {article.get('date', 'N/A')}")
                st.markdown(f"[Lire l'article original]({article['url']})", unsafe_allow_html=True)
            with col_action:
                is_published = article['published']
                button_text = "✅ Dépublier" if is_published else "▶️ Publier"
                if st.button(button_text, key=f"pub_{article['id']}", use_container_width=True):
                    pass
            if article.get('analysis'):
                with st.expander("🧠 Voir l'analyse stratégique"):
                    for key, value in article['analysis'].items():
                        if value:
                            st.markdown(f"**{format_key(key)}**")
                            st.markdown(f"> {value}")
else:
    st.info("Cliquez sur 'Récupérer les articles sources' pour charger les données.")