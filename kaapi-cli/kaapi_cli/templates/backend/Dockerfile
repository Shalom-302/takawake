FROM python:3.11-slim

WORKDIR /app

# Set environment variables
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1
ENV PYTHONPATH=/app

# Install system dependencies and build tools
RUN apt-get update \
    && apt-get install -y --no-install-recommends \
    gcc \
    g++ \
    libc6-dev \
    python3-dev \
    libpq-dev \
    linux-libc-dev \
    make \
    curl \
    gnupg \
    git \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# Use pip to install wheels where possible instead of building from source
RUN pip install --upgrade pip setuptools wheel

# Install psutil and other problematic packages with binary wheels where possible
RUN pip install --no-cache-dir --only-binary=:all: psutil

# Copy requirements.txt and install dependencies
COPY ./requirements.txt /app/
RUN pip install --no-cache-dir -r requirements.txt

# Copy the application first
COPY . .

# Install all plugin requirements with error handling
RUN python install_plugin_requirements.py

# Expose the port the app runs on
EXPOSE 8000

# Command to run the application
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000", "--reload"]
