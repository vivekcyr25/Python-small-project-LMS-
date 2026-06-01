# Firebase Auth Setup (Google + Phone OTP)

This LMS uses **Firebase Auth on the client** and verifies ID tokens on the **FastAPI backend**.

## Quick local dev (no Firebase project)

1. In `frontend/.env`, keep:
   ```env
   VITE_FIREBASE_USE_MOCK=true
   ```
2. Restart the Vite dev server (`npm run dev`).
3. Use **Continue with Google** or **Phone OTP** — any phone number and any 6-digit OTP work in mock mode.

The backend accepts `mock-google-token` and `mock-phone-token` without a service account file.

---

## Production / real Firebase

### 1. Create a Firebase project

1. Open [Firebase Console](https://console.firebase.google.com/).
2. **Add project** (or use an existing one).
3. **Project settings** → **Your apps** → **Add app** → **Web** (`</>`).
4. Copy the `firebaseConfig` values into `frontend/.env`:

```env
VITE_FIREBASE_USE_MOCK=false
VITE_FIREBASE_API_KEY=AIza...
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_APP_ID=1:123456789:web:abc...
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com
```

### 2. Enable sign-in providers

**Authentication** → **Sign-in method**:

| Provider | Action |
|----------|--------|
| **Google** | Enable, set support email |
| **Phone** | Enable |

For Phone OTP on `localhost`, add a test number under **Phone** → **Phone numbers for testing** (optional for dev).

### 3. Authorized domains

**Authentication** → **Settings** → **Authorized domains**:

- `localhost` (for Vite dev)
- Your production domain when deployed

### 4. Backend service account

1. **Project settings** → **Service accounts** → **Generate new private key**.
2. Save the JSON as `backend/firebase-service-account.json`.
3. Add to `backend/.env`:

```env
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_SERVICE_ACCOUNT_PATH=./firebase-service-account.json
```

`firebase-service-account.json` is gitignored — never commit it.

### 5. API key restrictions (if login fails)

In [Google Cloud Console](https://console.cloud.google.com/) → **APIs & Services** → **Credentials** → your **Browser key**:

- Application restrictions: **HTTP referrers** — include `http://localhost:5173/*`
- API restrictions: ensure **Identity Toolkit API** is allowed

The error `auth/api-key-not-valid` usually means a wrong key, placeholder key, or overly strict key restrictions.

### 6. Restart servers

```bash
# frontend
cd frontend && npm run dev

# backend
cd backend && uvicorn app.main:app --reload
```

---

## Flow

```
User → Google popup / Phone OTP (Firebase client)
     → Firebase ID token
     → POST /api/v1/auth/firebase-login
     → Backend verifies token (Admin SDK or mock)
     → App JWT + user record in PostgreSQL
```
