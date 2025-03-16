#!/usr/bin/env python3
"""
Script to generate a load on the PostgreSQL database
and test monitoring dashboards.
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

# Logging configuration
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Default configuration
DEFAULT_DB_URL = "postgresql://postgres:postgres@localhost:5432/postgres"
DEFAULT_DURATION = 60  # in seconds
DEFAULT_CONCURRENT_CONNECTIONS = 5
DEFAULT_OPERATION_DELAY = 0.1  # in seconds

def parse_args():
    parser = argparse.ArgumentParser(description='Generate a load on the PostgreSQL database and test monitoring dashboards.')
    parser.add_argument('--db-url', type=str, default=os.environ.get('DB_URL', DEFAULT_DB_URL),
                      help='URL of the PostgreSQL database')
    parser.add_argument('--duration', type=int, default=DEFAULT_DURATION,
                      help='Duration of the test in seconds')
    parser.add_argument('--connections', type=int, default=DEFAULT_CONCURRENT_CONNECTIONS,
                      help='Number of concurrent connections')
    parser.add_argument('--delay', type=float, default=DEFAULT_OPERATION_DELAY,
                      help='Delay between operations in seconds')
    return parser.parse_args()

async def create_test_table(conn):
    """Create the test table if it does not exist."""
    await conn.execute('''
        CREATE TABLE IF NOT EXISTS test_metrics (
            id SERIAL PRIMARY KEY,
            name TEXT NOT NULL,
            value FLOAT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    
    # Create an index for testing optimization
    await conn.execute('''
        CREATE INDEX IF NOT EXISTS idx_test_metrics_name ON test_metrics(name)
    ''')
    
    logger.info("Test table created or verified.")

async def select_operation(conn):
    """Execute a random SELECT operation."""
    operations = [
        # Simple SELECT
        lambda: conn.fetch("SELECT * FROM test_metrics ORDER BY RANDOM() LIMIT 10"),
        # SELECT with filter
        lambda: conn.fetch("SELECT * FROM test_metrics WHERE name = 'metric_" + str(random.randint(1, 5)) + "'"),
        # SELECT with aggregation
        lambda: conn.fetch("SELECT name, AVG(value) FROM test_metrics GROUP BY name"),
        # SELECT with join (self-join in this case)
        lambda: conn.fetch("""
            SELECT a.name, a.value, b.value as related_value 
            FROM test_metrics a 
            JOIN test_metrics b ON a.name = b.name AND a.id != b.id 
            LIMIT 10
        """),
        # SELECT with subquery
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
    """Execute an INSERT operation."""
    metric_name = f"metric_{random.randint(1, 5)}"
    value = random.uniform(0, 100)
    
    await conn.execute(
        "INSERT INTO test_metrics(name, value) VALUES($1, $2)",
        metric_name, value
    )
    return "INSERT"

async def update_operation(conn):
    """Execute an UPDATE operation."""
    value = random.uniform(0, 100)
    
    # Update with a random condition
    await conn.execute(
        "UPDATE test_metrics SET value = $1 WHERE id IN (SELECT id FROM test_metrics ORDER BY RANDOM() LIMIT 1)",
        value
    )
    return "UPDATE"

async def delete_operation(conn):
    """Execute a DELETE operation."""
    # Delete with a random condition but limited to avoid deleting everything
    await conn.execute(
        "DELETE FROM test_metrics WHERE id IN (SELECT id FROM test_metrics ORDER BY RANDOM() LIMIT 1)"
    )
    return "DELETE"

async def vacuum_operation(conn):
    """Execute a VACUUM operation."""
    await conn.execute("VACUUM ANALYZE test_metrics")
    return "VACUUM"

async def run_operations(db_url, duration, delay):
    """Execute random operations for a determined duration."""
    conn = await asyncpg.connect(db_url)
    
    # Create the test table if it does not exist
    await create_test_table(conn)
    
    # Ensure there are some initial data
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
            # Random selection of operations with weights
            # To favorize SELECTs and avoid too many DELETEs
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
                
                # Simulate a delay between operations
                await asyncio.sleep(delay)
            except Exception as e:
                logger.error(f"Error during {operation_type} operation: {e}")
    
    finally:
        # Display statistics
        logger.info(f"Operation statistics: {operations}")
        await conn.close()

async def main():
    args = parse_args()
    
    logger.info(f"Starting DB load test with {args.connections} connections for {args.duration} seconds")
    logger.info(f"Database URL: {args.db_url}")
    
    # Create concurrent connections
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
    
    # Wait for all tasks to complete
    await asyncio.gather(*tasks)
    
    logger.info("DB load test completed")

if __name__ == "__main__":
    asyncio.run(main())
