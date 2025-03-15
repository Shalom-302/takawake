#!/usr/bin/env python3

LOG_LEVELS = ["INFO", "WARNING", "ERROR", "DEBUG"]
SOURCES = ["api", "database", "auth", "system", "frontend"]
OPERATIONS = ["read", "write", "update", "delete", "query"]

# Format command template for Docker exec
command_template = """
docker exec kaapi-api curl -s -X POST http://localhost:8000/plugins/advanced_logging/logs \\
  -H "Content-Type: application/json" \\
  -d '{{"level": "{level}", "message": "{message}", "labels": {{"source": "{source}", "operation": "{operation}"}}}}'
"""

# Generate shell commands for different log levels
commands = []

for level in LOG_LEVELS:
    for source in SOURCES[:2]:  # Use only first 2 sources to keep it simpler
        for operation in OPERATIONS[:2]:  # Use only first 2 operations
            message = f"{level} log message from {source} during {operation} operation"
            cmd = command_template.format(
                level=level,
                message=message,
                source=source,
                operation=operation
            )
            commands.append(cmd)

# Write commands to a shell script
with open('generate_logs.sh', 'w') as f:
    f.write("#!/bin/bash\n\n")
    f.write("echo 'Generating test logs for the Advanced Logging dashboard...'\n\n")
    
    for cmd in commands:
        f.write(f"{cmd}\n")
        f.write("sleep 0.5\n\n")
    
    f.write("echo 'Done generating test logs.'\n")

print("Created generate_logs.sh script. Run it with 'chmod +x generate_logs.sh && ./generate_logs.sh'")
