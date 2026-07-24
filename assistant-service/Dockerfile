FROM python:3.11-slim AS runtime

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    ASSISTANT_HOST=0.0.0.0 \
    ASSISTANT_PORT=8787

WORKDIR /app
RUN addgroup --system assistant && adduser --system --ingroup assistant assistant
COPY pyproject.toml README.md ./
COPY app ./app
RUN pip install --no-cache-dir .
USER assistant
EXPOSE 8787
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD python -c "import urllib.request; urllib.request.urlopen('http://127.0.0.1:8787/health', timeout=3).read()"
CMD ["sh", "-c", "uvicorn app.main:app --host ${ASSISTANT_HOST} --port ${ASSISTANT_PORT}"]
