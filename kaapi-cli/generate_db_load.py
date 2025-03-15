#!/usr/bin/env python3
"""
Script pour générer une charge sur la base de données PostgreSQL
et tester les tableaux de bord de monitoring.
"""

import asyncio
import random
import time
import os
import concurrent.futures
import logging
import asyncpg
import argparse
from datetime import datetime

# Configuration du logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Configuration par défaut
DEFAULT_DB_URL = "postgresql://postgres:postgres@localhost:5432/postgres"
DEFAULT_DURATION = 60  # en secondes
DEFAULT_CONCURRENT_CONNECTIONS = 5
DEFAULT_OPERATION_DELAY = 0.1  # en secondes

def parse_args():
    parser = argparse.ArgumentParser(description='Générer une charge sur la base de données PostgreSQL.')
    parser.add_argument('--db-url', type=str, default=os.environ.get('DB_URL', DEFAULT_DB_URL),
                      help='URL de connexion à la base de données PostgreSQL')
    parser.add_argument('--duration', type=int, default=DEFAULT_DURATION,
                      help='Durée du test en secondes')
    parser.add_argument('--connections', type=int, default=DEFAULT_CONCURRENT_CONNECTIONS,
                      help='Nombre de connexions concurrentes')
    parser.add_argument('--delay', type=float, default=DEFAULT_OPERATION_DELAY,
                      help='Délai entre les opérations en secondes')
    return parser.parse_args()

async def create_test_table(conn):
    """Crée la table de test si elle n'existe pas."""
    await conn.execute('''
        CREATE TABLE IF NOT EXISTS test_metrics (
            id SERIAL PRIMARY KEY,
            name TEXT NOT NULL,
            value FLOAT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    
    # Créer un index pour tester l'optimisation
    await conn.execute('''
        CREATE INDEX IF NOT EXISTS idx_test_metrics_name ON test_metrics(name)
    ''')
    
    logger.info("Table de test créée ou vérifiée.")

async def select_operation(conn):
    """Exécute une opération SELECT aléatoire."""
    operations = [
        # SELECT simple
        lambda: conn.fetch("SELECT * FROM test_metrics ORDER BY RANDOM() LIMIT 10"),
        # SELECT avec filtre
        lambda: conn.fetch("SELECT * FROM test_metrics WHERE name = 'metric_" + str(random.randint(1, 5)) + "'"),
        # SELECT avec agrégation
        lambda: conn.fetch("SELECT name, AVG(value) FROM test_metrics GROUP BY name"),
        # SELECT avec jointure (self-join dans ce cas)
        lambda: conn.fetch("""
            SELECT a.name, a.value, b.value as related_value 
            FROM test_metrics a 
            JOIN test_metrics b ON a.name = b.name AND a.id != b.id 
            LIMIT 10
        """),
        # SELECT complexe avec sous-requête
        lambda: conn.fetch("""
            SELECT * FROM test_metrics 
            WHERE value > (SELECT AVG(value) FROM test_metrics)
            LIMIT 20
        """)
    ]
    
    operation = random.choice(operations)
    await operation()
    return "SELECT"

async def insert_operation(conn):
    """Exécute une opération INSERT."""
    metric_name = f"metric_{random.randint(1, 5)}"
    value = random.uniform(0, 100)
    
    await conn.execute(
        "INSERT INTO test_metrics(name, value) VALUES($1, $2)",
        metric_name, value
    )
    return "INSERT"

async def update_operation(conn):
    """Exécute une opération UPDATE."""
    value = random.uniform(0, 100)
    
    # Mise à jour avec une condition aléatoire
    await conn.execute(
        "UPDATE test_metrics SET value = $1 WHERE id IN (SELECT id FROM test_metrics ORDER BY RANDOM() LIMIT 1)",
        value
    )
    return "UPDATE"

async def delete_operation(conn):
    """Exécute une opération DELETE."""
    # Suppression avec une condition aléatoire mais limitée pour éviter de tout supprimer
    await conn.execute(
        "DELETE FROM test_metrics WHERE id IN (SELECT id FROM test_metrics ORDER BY RANDOM() LIMIT 1)"
    )
    return "DELETE"

async def vacuum_operation(conn):
    """Exécute une opération VACUUM."""
    await conn.execute("VACUUM ANALYZE test_metrics")
    return "VACUUM"

async def run_operations(db_url, duration, delay):
    """Exécute des opérations aléatoires pendant une durée déterminée."""
    conn = await asyncpg.connect(db_url)
    
    # Créer la table de test si nécessaire
    await create_test_table(conn)
    
    # S'assurer qu'il y a quelques données initiales
    for _ in range(100):
        await insert_operation(conn)
    
    start_time = time.time()
    end_time = start_time + duration
    
    operations = {
        "SELECT": 0,
        "INSERT": 0,
        "UPDATE": 0,
        "DELETE": 0,
        "VACUUM": 0
    }
    
    try:
        while time.time() < end_time:
            # Choix aléatoire des opérations avec une pondération
            # Pour favoriser les SELECTs et éviter trop de DELETEs
            operation_type = random.choices(
                ["SELECT", "INSERT", "UPDATE", "DELETE", "VACUUM"],
                weights=[60, 20, 15, 4, 1],
                k=1
            )[0]
            
            try:
                if operation_type == "SELECT":
                    result = await select_operation(conn)
                elif operation_type == "INSERT":
                    result = await insert_operation(conn)
                elif operation_type == "UPDATE":
                    result = await update_operation(conn)
                elif operation_type == "DELETE":
                    result = await delete_operation(conn)
                elif operation_type == "VACUUM":
                    result = await vacuum_operation(conn)
                
                operations[result] += 1
                
                # Simuler un délai entre les opérations
                await asyncio.sleep(delay)
            except Exception as e:
                logger.error(f"Erreur lors de l'opération {operation_type}: {e}")
    
    finally:
        # Afficher les statistiques
        logger.info(f"Statistiques des opérations: {operations}")
        await conn.close()

async def main():
    args = parse_args()
    
    logger.info(f"Démarrage du test de charge DB avec {args.connections} connexions pendant {args.duration} secondes")
    logger.info(f"URL de la base de données: {args.db_url}")
    
    # Créer plusieurs connexions concurrentes
    tasks = []
    for i in range(args.connections):
        task = asyncio.create_task(
            run_operations(
                args.db_url,
                args.duration,
                args.delay
            )
        )
        tasks.append(task)
    
    # Attendre que toutes les tâches soient terminées
    await asyncio.gather(*tasks)
    
    logger.info("Test de charge DB terminé")

if __name__ == "__main__":
    asyncio.run(main())
