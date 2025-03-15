#!/usr/bin/env python3
import requests
import random
import time

# Configuration
API_URL = "http://localhost:8000/plugins/advanced_logging/logs"
LOG_LEVELS = ["INFO", "WARNING", "ERROR", "DEBUG"]
SOURCES = ["api", "database", "auth", "system", "frontend"]
OPERATIONS = ["read", "write", "update", "delete", "query"]

def generate_log(level):
    source = random.choice(SOURCES)
    operation = random.choice(OPERATIONS)
    
    message = f"{level} log message from {source} during {operation} operation"
    
    payload = {
        "level": level,
        "message": message,
        "labels": {
            "source": source,
            "operation": operation
        }
    }
    
    try:
        response = requests.post(API_URL, json=payload)
        if response.status_code == 200:
            print(f"Successfully created {level} log: {message}")
        else:
            print(f"Failed to create log. Status code: {response.status_code}")
            print(f"Response: {response.text}")
    except Exception as e:
        print(f"Error creating log: {str(e)}")

def main():
    print("Generating test logs for the Advanced Logging dashboard...")
    
    # Generate 5 logs of each level
    for _ in range(5):
        for level in LOG_LEVELS:
            generate_log(level)
            time.sleep(0.5)  # Small delay to avoid flooding
    
    print("Done generating test logs.")

if __name__ == "__main__":
    main()
