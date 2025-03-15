#!/bin/bash

# Script to generate a large number of logs of different levels to test the Grafana dashboard
# Usage: ./generate_logs.sh [number_of_logs]

# Number of logs to generate (default: 50)
NUM_LOGS=${1:-50}
API_ENDPOINT="http://localhost:8000/plugins/advanced-logging/logs"

# Array of different elements to generate varied logs
LEVELS=("info" "warning" "error" "debug")
COMPONENTS=("api" "auth" "database" "cache" "frontend" "backend" "worker" "scheduler")
SOURCES=("test_script" "load_test" "performance_monitoring" "system_check")
MESSAGES=(
  "Operation successful"
  "Process completed successfully"
  "Resource created correctly"
  "Update applied"
  "Response time acceptable"
  "SQL query executed"
  "User session started"
  "Cache recharged"
  "Connection established"
  "Attention, resource almost exhausted"
  "Response time high detected"
  "Reconnection attempt"
  "Session expired"
  "Request limit exceeded"
  "Timeout almost exceeded"
  "Database connection failed"
  "Uncaught exception"
  "Service unavailable"
  "Authentication failed"
  "Integrity constraint violation"
  "Information search"
  "System state verification"
  "Service initialization"
  "Configuration loaded"
)

# Function to generate a random log
generate_random_log() {
  local level=${LEVELS[$RANDOM % ${#LEVELS[@]}]}
  local component=${COMPONENTS[$RANDOM % ${#COMPONENTS[@]}]}
  local source=${SOURCES[$RANDOM % ${#SOURCES[@]}]}
  local message=${MESSAGES[$RANDOM % ${#MESSAGES[@]}]}
  
  if [ "$level" == "error" ]; then
    message="ERROR: $message"
  elif [ "$level" == "warning" ]; then
    message="WARNING: $message"
  fi
  
  # Prepare the JSON payload
  local json_payload="{\"level\": \"$level\", \"message\": \"$message\", \"labels\": {\"source\": \"$source\", \"component\": \"$component\"}}"
  
  # Send the POST request
  curl -s -X POST "$API_ENDPOINT" \
       -H "Content-Type: application/json" \
       -d "$json_payload" > /dev/null
  
  echo "Log sent: [$level] $message (source: $source, component: $component)"
}

echo "Generating $NUM_LOGS logs..."

for ((i=1; i<=NUM_LOGS; i++)); do
  generate_random_log
  
  # Small random pause to simulate more realistic traffic
  sleep 0.$(( RANDOM % 5 + 1 ))
  
  # Show progress
  if (( i % 10 == 0 )); then
    echo "Progress: $i/$NUM_LOGS logs generated"
  fi
done

echo "Completed! $NUM_LOGS logs generated and sent to the API."
