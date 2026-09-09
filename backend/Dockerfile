# ──────────────────────────────────────────────────────────────────────────────
# CAT Backend — FastAPI / Uvicorn
# ──────────────────────────────────────────────────────────────────────────────
FROM python:3.11-slim

# Prevent .pyc files and enable unbuffered logs
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1

WORKDIR /app

# Install system dependencies
RUN apt-get update \
    && apt-get install -y --no-install-recommends gcc \
    && rm -rf /var/lib/apt/lists/*

# Install Python dependencies first (layer cache)
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application source
COPY app/ ./app/

# Expose default port (Render overrides via $PORT)
EXPOSE 8000

# Start command — uses $PORT env var set by Render (defaults to 8000 locally)
CMD ["sh", "-c", "uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-8000}"]
