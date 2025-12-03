FROM python:3.11-slim
WORKDIR /app

# System deps for scientific libs
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# Python deps
COPY requirements.txt /app/requirements.txt
RUN pip install --no-cache-dir -r requirements.txt

# Copy source
COPY . /app

ENV HOST=0.0.0.0
ENV PORT=10000
ENV FLASK_ENV=development
ENV DEBUG=true
EXPOSE 10000

# Use Flask dev server with auto-reload
CMD ["python", "app.py"]
