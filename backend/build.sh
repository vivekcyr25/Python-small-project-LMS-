#!/usr/bin/env bash
# Render build script - runs before the server starts
set -o errexit

pip install -r requirements.txt
alembic upgrade head
python -m app.scripts.seed_demo_course
