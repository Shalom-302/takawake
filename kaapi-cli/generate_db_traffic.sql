-- SQL script to generate database traffic
-- Create a test table if none exists
CREATE TABLE IF NOT EXISTS test_monitoring (
    id SERIAL PRIMARY KEY,
    metric_name VARCHAR(50) NOT NULL,
    metric_value FLOAT NOT NULL,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for performance testing
CREATE INDEX IF NOT EXISTS idx_test_monitoring_name ON test_monitoring(metric_name);
CREATE INDEX IF NOT EXISTS idx_test_monitoring_timestamp ON test_monitoring(timestamp);

-- Insert test data (1000 entries)
DO $$
DECLARE
    i INT;
    metric_name VARCHAR(50);
    metric_value FLOAT;
BEGIN
    FOR i IN 1..1000 LOOP
        -- Choose randomly from 5 metric names
        CASE floor(random() * 5)::INT + 1
            WHEN 1 THEN metric_name := 'cpu_usage';
            WHEN 2 THEN metric_name := 'memory_usage';
            WHEN 3 THEN metric_name := 'disk_io';
            WHEN 4 THEN metric_name := 'network_traffic';
            ELSE metric_name := 'query_time';
        END CASE;
        
        -- Generate a random value between 0 and 100
        metric_value := random() * 100;
        
        -- Insert the data
        INSERT INTO test_monitoring (metric_name, metric_value, timestamp)
        VALUES (
            metric_name, 
            metric_value, 
            NOW() - (random() * INTERVAL '1 hour')
        );
    END LOOP;
END $$;

-- Perform some heavy analyses to generate load
ANALYZE VERBOSE test_monitoring;

-- Execute some complex queries to stimulate the system
SELECT 
    metric_name, 
    AVG(metric_value) as avg_value,
    MIN(metric_value) as min_value,
    MAX(metric_value) as max_value,
    COUNT(*) as count
FROM test_monitoring
GROUP BY metric_name;

-- Calculate moving averages over a time window
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

-- Perform some complex joins to stimulate the system
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

-- Create a second series of data to compare
DO $$
DECLARE
    i INT;
    metric_name VARCHAR(50);
    metric_value FLOAT;
BEGIN
    FOR i IN 1..500 LOOP
        -- Use the same metric names
        CASE floor(random() * 5)::INT + 1
            WHEN 1 THEN metric_name := 'cpu_usage';
            WHEN 2 THEN metric_name := 'memory_usage';
            WHEN 3 THEN metric_name := 'disk_io';
            WHEN 4 THEN metric_name := 'network_traffic';
            ELSE metric_name := 'query_time';
        END CASE;
        
        -- Generate a different random value
        metric_value := 50 + (random() * 50);
        
        -- Insert the data with a more recent timestamp
        INSERT INTO test_monitoring (metric_name, metric_value, timestamp)
        VALUES (
            metric_name, 
            metric_value, 
            NOW() - (random() * INTERVAL '15 minutes')
        );
    END LOOP;
END $$;

-- Execute another analysis to update statistics
ANALYZE VERBOSE test_monitoring;

-- Perform an aggregation by time intervals
SELECT 
    metric_name,
    date_trunc('minute', timestamp) as minute,
    AVG(metric_value) as avg_per_minute
FROM test_monitoring
GROUP BY metric_name, date_trunc('minute', timestamp)
ORDER BY metric_name, minute;
