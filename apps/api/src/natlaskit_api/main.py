from concurrent.futures import ThreadPoolExecutor
from contextlib import asynccontextmanager, contextmanager
from dataclasses import asdict
from pathlib import Path
from typing import Literal
import hmac
import os
import sqlite3
import tempfile
import time
import uuid
from fastapi import Depends, FastAPI, File, Form, Header, HTTPException, UploadFile
from pydantic import BaseModel
from natlaskit import LocalSpeech, NatlasError, MODELS
from natlaskit.local import LABELS

Language = Literal["hausa", "yoruba", "igbo", "english"]


class Job(BaseModel):
    id: str
    status: Literal["queued", "running", "completed", "failed"]
    language: Language
    model: str
    text: str | None = None
    error: str | None = None
    audio_duration_seconds: float | None = None
    processing_seconds: float | None = None


class ModelInfo(BaseModel):
    id: Language
    label: str
    model: str
    loaded: bool


def authorize(authorization: str | None = Header(default=None)):
    key = os.getenv("NATLAS_API_KEY")
    if key and not hmac.compare_digest((authorization or "").encode(), f"Bearer {key}".encode()):
        raise HTTPException(401, "Invalid speech service credentials.")


@contextmanager
def database():
    db = sqlite3.connect(app.state.database, timeout=10)
    db.row_factory = sqlite3.Row
    try:
        with db:
            yield db
    finally:
        db.close()


def update_job(job_id: str, **values):
    with database() as db:
        db.execute(
            f"UPDATE jobs SET {', '.join(f'{key}=?' for key in values)} WHERE id=?",
            [*values.values(), job_id],
        )


def process(job_id: str, path: str, language: str):
    try:
        update_job(job_id, status="running")
        result = asdict(app.state.runtime.transcribe(path, language))
        update_job(
            job_id,
            status="completed",
            **{
                key: value
                for key, value in result.items()
                if key not in ("language", "model")
            },
        )
    except NatlasError as exc:
        update_job(job_id, status="failed", error=str(exc))
    except Exception:
        update_job(
            job_id,
            status="failed",
            error="Transcription failed. Check the service logs and retry.",
        )
    finally:
        Path(path).unlink(missing_ok=True)


@asynccontextmanager
async def lifespan(application: FastAPI):
    directory = Path(os.getenv("NATLAS_RUNTIME_DIR", ".runtime"))
    directory.mkdir(parents=True, exist_ok=True)
    application.state.directory = directory
    application.state.database = str(directory / "jobs.sqlite3")
    application.state.runtime = LocalSpeech()
    application.state.executor = ThreadPoolExecutor(
        max_workers=1, thread_name_prefix="natlas-speech"
    )
    with database() as db:
        db.execute(
            "CREATE TABLE IF NOT EXISTS jobs (id TEXT PRIMARY KEY, status TEXT, language TEXT, model TEXT, text TEXT, error TEXT, audio_duration_seconds REAL, processing_seconds REAL, created REAL)"
        )
        db.execute(
            "UPDATE jobs SET status='failed', error='The service restarted before this job completed. Please submit again.' WHERE status IN ('queued','running')"
        )
    for file in directory.glob("audio-*"):
        file.unlink(missing_ok=True)
    yield
    application.state.executor.shutdown(wait=True)


app = FastAPI(
    title="natlaskit Speech API",
    version="0.1.0",
    description="CPU speech service for the official N-ATLAS ASR models. This is an independent toolkit API.",
    lifespan=lifespan,
)


@app.get("/health")
def health():
    return {
        "status": "ok",
        "device": "cpu",
        "loaded_language": app.state.runtime.loaded_language,
        "model_access_verified": app.state.runtime.loaded_language is not None,
    }


@app.get(
    "/v1/models", response_model=list[ModelInfo], dependencies=[Depends(authorize)]
)
def models():
    return [
        {
            "id": language,
            "label": LABELS[language],
            "model": model,
            "loaded": app.state.runtime.loaded_language == language,
        }
        for language, model in MODELS.items()
    ]


@app.post(
    "/v1/transcriptions",
    response_model=Job,
    status_code=202,
    dependencies=[Depends(authorize)],
)
async def create_transcription(
    audio: UploadFile = File(...), language: Language = Form(...)
):
    data = await audio.read(10 * 1024 * 1024 + 1)
    await audio.close()
    if not data or len(data) > 10 * 1024 * 1024:
        raise HTTPException(400, "Choose a non-empty audio file smaller than 10 MB.")
    job_id = uuid.uuid4().hex
    with database() as db:
        db.execute(
            "DELETE FROM jobs WHERE created < ? AND status IN ('completed','failed')",
            [time.time() - 3600],
        )
        db.execute("BEGIN IMMEDIATE") if not db.in_transaction else None
        active = db.execute(
            "SELECT count(*) FROM jobs WHERE status IN ('queued','running')"
        ).fetchone()[0]
        if active >= 16:
            raise HTTPException(
                429, "The CPU service queue is full. Try again shortly."
            )
        db.execute(
            "INSERT INTO jobs (id,status,language,model,created) VALUES (?,?,?,?,?)",
            [job_id, "queued", language, MODELS[language], time.time()],
        )
    path = None
    try:
        with tempfile.NamedTemporaryFile(
            prefix="audio-", dir=app.state.directory, delete=False
        ) as file:
            path = file.name
            file.write(data)
        app.state.executor.submit(process, job_id, path, language)
    except Exception:
        if path:
            Path(path).unlink(missing_ok=True)
        update_job(
            job_id,
            status="failed",
            error="The service could not queue this recording. Try again shortly.",
        )
        raise HTTPException(
            503, "The service could not queue this recording. Try again shortly."
        )
    return Job(id=job_id, status="queued", language=language, model=MODELS[language])


@app.get(
    "/v1/transcriptions/{job_id}", response_model=Job, dependencies=[Depends(authorize)]
)
def get_transcription(job_id: str):
    with database() as db:
        row = db.execute("SELECT * FROM jobs WHERE id=?", [job_id]).fetchone()
    if not row:
        raise HTTPException(404, "Transcription not found or expired.")
    return {key: row[key] for key in Job.model_fields}
