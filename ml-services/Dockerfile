FROM python:3.12.13-slim
COPY --from=ghcr.io/astral-sh/uv:0.11.16 /uv /uvx /bin/
WORKDIR /app

# System deps for scientific libs
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# Locked Python dependencies
COPY pyproject.toml uv.lock .python-version /app/
RUN uv sync --frozen --no-dev

# Copy source
COPY . /app

ENV HOST=0.0.0.0
ENV PORT=10000
ENV FLASK_ENV=production
ENV DEBUG=false
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1
EXPOSE 10000

# Keep one model process in free-tier memory limits; use threads for I/O.
CMD ["sh", "-c", "uv run --frozen --no-sync gunicorn --bind 0.0.0.0:${PORT:-10000} --workers 1 --threads 4 --timeout 120 app:app"]
