FROM python:3.12-slim
RUN apt-get update && apt-get install -y --no-install-recommends ffmpeg && rm -rf /var/lib/apt/lists/*
WORKDIR /app
COPY packages/python /app/packages/python
COPY apps/api /app/apps/api
RUN pip install --no-cache-dir torch --index-url https://download.pytorch.org/whl/cpu
RUN pip install --no-cache-dir '/app/packages/python[local]' /app/apps/api
RUN useradd --create-home speech && mkdir -p /app/.runtime && chown speech:speech /app/.runtime
USER speech
EXPOSE 8000
CMD ["uvicorn", "natlaskit_api.main:app", "--host", "0.0.0.0", "--port", "8000", "--workers", "1"]
