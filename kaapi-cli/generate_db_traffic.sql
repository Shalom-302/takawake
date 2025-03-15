-- Script SQL pour générer du trafic dans la base de données
-- Création d'une table de test si elle n'existe pas
CREATE TABLE IF NOT EXISTS test_monitoring (
    id SERIAL PRIMARY KEY,
    metric_name VARCHAR(50) NOT NULL,
    metric_value FLOAT NOT NULL,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Création d'un index pour tester les performances
CREATE INDEX IF NOT EXISTS idx_test_monitoring_name ON test_monitoring(metric_name);
CREATE INDEX IF NOT EXISTS idx_test_monitoring_timestamp ON test_monitoring(timestamp);

-- Insertion de données de test (1000 entrées)
DO $$
DECLARE
    i INT;
    metric_name VARCHAR(50);
    metric_value FLOAT;
BEGIN
    FOR i IN 1..1000 LOOP
        -- Choisir aléatoirement parmi 5 noms de métriques
        CASE floor(random() * 5)::INT + 1
            WHEN 1 THEN metric_name := 'cpu_usage';
            WHEN 2 THEN metric_name := 'memory_usage';
            WHEN 3 THEN metric_name := 'disk_io';
            WHEN 4 THEN metric_name := 'network_traffic';
            ELSE metric_name := 'query_time';
        END CASE;
        
        -- Générer une valeur aléatoire entre 0 et 100
        metric_value := random() * 100;
        
        -- Insérer la donnée
        INSERT INTO test_monitoring (metric_name, metric_value, timestamp)
        VALUES (
            metric_name, 
            metric_value, 
            NOW() - (random() * INTERVAL '1 hour')
        );
    END LOOP;
END $$;

-- Effectuer quelques analyses lourdes pour générer de la charge
ANALYZE VERBOSE test_monitoring;

-- Exécuter quelques requêtes complexes pour stimuler le système
SELECT 
    metric_name, 
    AVG(metric_value) as avg_value,
    MIN(metric_value) as min_value,
    MAX(metric_value) as max_value,
    COUNT(*) as count
FROM test_monitoring
GROUP BY metric_name;

-- Calculer les moyennes mobiles sur une fenêtre de temps
SELECT 
    metric_name,
    timestamp,
    metric_value,
    AVG(metric_value) OVER (
        PARTITION BY metric_name 
        ORDER BY timestamp 
        ROWS BETWEEN 10 PRECEDING AND CURRENT ROW
    ) as moving_avg
FROM test_monitoring
ORDER BY metric_name, timestamp;

-- Effectuer des jointures pour simuler des requêtes complexes
WITH recent_metrics AS (
    SELECT * FROM test_monitoring
    WHERE timestamp > NOW() - INTERVAL '30 minutes'
)
SELECT 
    t.metric_name,
    t.timestamp,
    t.metric_value,
    r.metric_value as recent_value,
    t.metric_value - r.metric_value as delta
FROM test_monitoring t
JOIN recent_metrics r ON t.metric_name = r.metric_name
WHERE t.timestamp < r.timestamp
LIMIT 1000;

-- Créer une deuxième série de données pour comparer
DO $$
DECLARE
    i INT;
    metric_name VARCHAR(50);
    metric_value FLOAT;
BEGIN
    FOR i IN 1..500 LOOP
        -- Utiliser les mêmes noms de métriques
        CASE floor(random() * 5)::INT + 1
            WHEN 1 THEN metric_name := 'cpu_usage';
            WHEN 2 THEN metric_name := 'memory_usage';
            WHEN 3 THEN metric_name := 'disk_io';
            WHEN 4 THEN metric_name := 'network_traffic';
            ELSE metric_name := 'query_time';
        END CASE;
        
        -- Générer une valeur aléatoire différente
        metric_value := 50 + (random() * 50);
        
        -- Insérer la donnée avec un timestamp plus récent
        INSERT INTO test_monitoring (metric_name, metric_value, timestamp)
        VALUES (
            metric_name, 
            metric_value, 
            NOW() - (random() * INTERVAL '15 minutes')
        );
    END LOOP;
END $$;

-- Exécuter une autre analyse pour mettre à jour les statistiques
ANALYZE VERBOSE test_monitoring;

-- Effectuer une requête d'agrégation par intervalles de temps
SELECT 
    metric_name,
    date_trunc('minute', timestamp) as minute,
    AVG(metric_value) as avg_per_minute
FROM test_monitoring
GROUP BY metric_name, date_trunc('minute', timestamp)
ORDER BY metric_name, minute;
