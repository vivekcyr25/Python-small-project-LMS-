# Full-Stack LMS - Phase 1

This project is a Learning Management System (LMS) built with FastAPI and React.

## Stack

- **Backend**: Python FastAPI, SQLAlchemy, Alembic, PostgreSQL (via Docker or local).
- **Frontend**: Vite, React, TypeScript, Tailwind CSS, Zustand, React Query.

## Setup & Running

> [!IMPORTANT]
> PostgreSQL is required for final verification of Phase 1. SQLite is only used for temporary logic checks.

### Backend


1. Navigate to backend directory:
   ```bash
   cd backend
   ```
2. Create virtual environment:
   ```bash
   python -m venv venv
   ```
3. Activate virtual environment:
   ```bash
   # Windows
   .\venv\Scripts\activate
   # Linux/Mac
   source venv/bin/activate
   ```
4. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
5. Run migrations (Ensure PostgreSQL is running):
   ```bash
   alembic upgrade head
   ```
6. Start the server:
   ```bash
   uvicorn app.main:app --reload
   ```

### Frontend

1. Navigate to frontend directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create `.env` file from `.env.example` and set `VITE_API_URL` and `VITE_SYNCFUSION_LICENSE`.
4. Run development server:
   ```bash
   npm run dev
   ```

## Environment Variables

### Backend
Create a `.env` file in `backend/` (or use system env):
- `DATABASE_URL`: PostgreSQL connection string.
- `SECRET_KEY`: Secret key for JWT.
- `BACKEND_CORS_ORIGINS`: Allowed origins.

### Frontend
Create a `.env` file in `frontend/`:
- `VITE_API_URL`: Backend API URL (e.g., `http://localhost:8000/api/v1`).
- `VITE_SYNCFUSION_LICENSE`: Syncfusion license key.
- `VITE_FIREBASE_USE_MOCK`: Set `true` for local Google/Phone login without a Firebase project.

See [docs/FIREBASE_SETUP.md](docs/FIREBASE_SETUP.md) for Google sign-in and Phone OTP with a real Firebase project.
