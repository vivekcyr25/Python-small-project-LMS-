# Supervisor entrypoint. Re-exports the FastAPI app from app.main so that
# `uvicorn server:app` (the Emergent-managed command) works without changes.
from app.main import app  # noqa: F401
