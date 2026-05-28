"""
Firebase Admin SDK service.
Single primary path through firebase_admin.verify_id_token().
Falls back to PyJWT with 5-minute leeway when the system clock is skewed
more than 60 s (the firebase-admin cap).
"""

import os
from datetime import timedelta
from typing import Optional

import requests as _requests
from fastapi import HTTPException, status
from app.core.config import settings

_firebase_app = None
_init_error: Optional[str] = None

FIREBASE_CERTS_URL = (
    "https://www.googleapis.com/robot/v1/metadata/x509/"
    "securetoken@system.gserviceaccount.com"
)


def _init_firebase() -> None:
    global _firebase_app, _init_error

    if _firebase_app is not None:
        return

    if _init_error is not None:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=f"Firebase is not properly configured: {_init_error}",
        )

    try:
        import firebase_admin
        from firebase_admin import credentials

        service_account_path = settings.FIREBASE_SERVICE_ACCOUNT_PATH

        if not os.path.isfile(service_account_path):
            _init_error = (
                f"Service account file not found at '{service_account_path}'. "
                "Please set FIREBASE_SERVICE_ACCOUNT_PATH in your .env."
            )
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail=f"Firebase is not properly configured: {_init_error}",
            )

        try:
            _firebase_app = firebase_admin.get_app()
        except ValueError:
            cred = credentials.Certificate(service_account_path)
            _firebase_app = firebase_admin.initialize_app(cred)

    except HTTPException:
        raise
    except Exception as exc:
        _init_error = str(exc)
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=f"Firebase initialisation failed: {_init_error}",
        )


def _is_clock_skew_error(exc: Exception) -> bool:
    """Return True if the error is purely a clock-skew / timing problem."""
    msg = str(exc).lower()
    return (
        "too early" in msg
        or "used before" in msg
        or "clock" in msg
        or "iat" in msg
        or "issued at" in msg
    )


def _verify_with_pyjwt(id_token: str) -> dict:
    """
    Manual fallback: verify Firebase ID token using PyJWT with a 5-minute
    leeway so that up to 5 minutes of clock skew is tolerated.
    Signature is verified against Google's live public keys.
    """
    import jwt  # PyJWT

    # Identify which public key signed this token.
    try:
        header = jwt.get_unverified_header(id_token)
    except Exception as exc:
        raise ValueError(f"Cannot decode token header: {exc}")

    kid = header.get("kid")
    if not kid:
        raise ValueError("Token header missing 'kid'.")

    # Fetch Google's signing certificates (short-lived cache is fine here).
    try:
        resp = _requests.get(FIREBASE_CERTS_URL, timeout=5)
        resp.raise_for_status()
        certs: dict = resp.json()
    except Exception as exc:
        raise ValueError(f"Failed to fetch Firebase public keys: {exc}")

    if kid not in certs:
        raise ValueError(f"Unknown key id '{kid}' in Firebase token.")

    # Load the X.509 certificate and extract the public key.
    from cryptography import x509
    from cryptography.hazmat.backends import default_backend

    cert_pem = certs[kid].encode("utf-8")
    cert_obj = x509.load_pem_x509_certificate(cert_pem, default_backend())
    public_key = cert_obj.public_key()

    project_id = settings.FIREBASE_PROJECT_ID

    # Decode + verify with 5-minute leeway.
    decoded = jwt.decode(
        id_token,
        public_key,
        algorithms=["RS256"],
        audience=project_id,
        issuer=f"https://securetoken.google.com/{project_id}",
        leeway=timedelta(minutes=5),
    )

    # Normalise uid field (firebase_admin uses 'uid', raw JWT uses 'sub').
    uid = decoded.get("user_id") or decoded.get("sub") or decoded.get("uid")
    if not uid:
        raise ValueError("Token has no subject (uid).")
    decoded["uid"] = uid

    # Ensure firebase sign-in provider info is present.
    if "firebase" not in decoded:
        decoded["firebase"] = {}

    return decoded


def verify_firebase_token(id_token: str) -> dict:
    """
    Verify a Firebase ID token and return decoded claims.
    Mock tokens are handled first for local dev.
    Real tokens:
      1. Try firebase_admin (60 s clock-skew tolerance).
      2. On clock-skew errors, fall back to PyJWT (5 min tolerance).
    """
    # ── Mock tokens for VITE_FIREBASE_USE_MOCK=true ──────────────────────
    if id_token == "mock-google-token":
        return {
            "uid": "mock-google-uid-123",
            "email": "testuser@example.com",
            "name": "Mock Google User",
            "email_verified": True,
            "firebase": {"sign_in_provider": "google.com"},
        }
    if id_token == "mock-phone-token":
        return {
            "uid": "mock-phone-uid-456",
            "phone_number": "+1234567890",
            "firebase": {"sign_in_provider": "phone"},
        }

    # ── Primary path: firebase_admin ─────────────────────────────────────
    _init_firebase()

    from firebase_admin import auth as firebase_auth

    try:
        return firebase_auth.verify_id_token(id_token, clock_skew_seconds=60)

    except Exception as primary_exc:
        primary_msg = str(primary_exc)
        print("Firebase verify (primary) failed:", type(primary_exc).__name__, primary_msg[:200])

        if not _is_clock_skew_error(primary_exc):
            # Not a clock issue — token is genuinely invalid.
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid or expired Firebase token.",
            )

        # ── Fallback: PyJWT with 5-minute leeway ─────────────────────────
        print("Clock-skew detected — retrying with PyJWT 5-min leeway.")
        try:
            return _verify_with_pyjwt(id_token)
        except Exception as fallback_exc:
            print("Firebase verify (fallback) failed:", type(fallback_exc).__name__, str(fallback_exc)[:200])
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid or expired Firebase token.",
            )
