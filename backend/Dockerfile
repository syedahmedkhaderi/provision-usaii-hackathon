FROM python:3.11-slim

# Set working directory
WORKDIR /app

# Copy only requirements first for better layer caching
COPY requirements.txt ./

# Install system deps required to build common Python packages
RUN apt-get update \
  && apt-get install -y --no-install-recommends \
     build-essential \
     gcc \
     g++ \
     libssl-dev \
     curl \
  && rm -rf /var/lib/apt/lists/*

# Upgrade pip and install wheels from requirements
RUN python -m pip install --upgrade pip setuptools wheel
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY . /app

# Default PORT support (Render provides $PORT at runtime)
CMD ["sh", "-c", "uvicorn main:app --host 0.0.0.0 --port ${PORT:-8000}"]
