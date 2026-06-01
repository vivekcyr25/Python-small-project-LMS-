from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.deps import get_db, get_current_user
from app.core.security import get_password_hash, verify_password, create_access_token
from app.models.user import User, UserRole
from app.schemas.user import UserCreate, UserResponse
from app.schemas.auth import LoginRequest, TokenResponse
from app.schemas.firebase_auth import FirebaseLoginRequest, FirebaseLoginResponse

router = APIRouter()

@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
def register(user_in: UserCreate, db: Session = Depends(get_db)):
    # Check if user exists
    user = db.query(User).filter(User.email == user_in.email).first()
    if user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="The user with this email already exists in the system.",
        )
    
    # Create user
    db_user = User(
        email=user_in.email,
        hashed_password=get_password_hash(user_in.password),
        full_name=user_in.full_name,
        role=user_in.role or UserRole.STUDENT.value,
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

@router.post("/login", response_model=TokenResponse)
def login(login_in: LoginRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == login_in.email).first()
    if not user or not verify_password(login_in.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
        )
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Inactive user",
        )
    
    access_token = create_access_token(subject=user.id)
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": user
    }

@router.get("/me", response_model=UserResponse)
def read_user_me(current_user: User = Depends(get_current_user)):
    return current_user


@router.post("/firebase-login", response_model=FirebaseLoginResponse)
def firebase_login(body: FirebaseLoginRequest, db: Session = Depends(get_db)):
    """
    Verify a Firebase ID token (from Google or Phone provider) and return
    an existing app JWT for the corresponding local PostgreSQL user.

    The endpoint:
    - Verifies the Firebase token server-side (never trusts the client).
    - Creates a local user (role=student) if none exists.
    - Never downgrades or overwrites an existing user's role.
    - Never creates an admin via this endpoint.
    - Returns the same JWT shape as /login.
    """
    import secrets
    from app.services.firebase_auth import verify_firebase_token

    # 1. Verify token with Firebase Admin SDK.
    decoded = verify_firebase_token(body.id_token)

    # 2. Extract claims.
    uid: str = decoded.get("uid", "")
    email = decoded.get("email")
    name = decoded.get("name")
    picture = decoded.get("picture")
    phone_number = decoded.get("phone_number")
    email_verified: bool = decoded.get("email_verified", False)

    # Determine provider.
    firebase_info = decoded.get("firebase", {})
    sign_in_provider: str = firebase_info.get("sign_in_provider", "firebase")
    if sign_in_provider == "google.com":
        provider = "google"
    elif sign_in_provider == "phone":
        provider = "phone"
    else:
        provider = "firebase"

    # 3. Try to find existing local user (priority: firebase_uid > email > phone).
    user = None

    if uid:
        user = db.query(User).filter(User.firebase_uid == uid).first()

    if user is None and email:
        user = db.query(User).filter(User.email == email).first()

    if user is None and phone_number:
        user = db.query(User).filter(User.phone_number == phone_number).first()

    # 4. Update or create local user.
    if user is not None:
        # Attach firebase_uid if not yet set.
        if not user.firebase_uid:
            user.firebase_uid = uid
        if not user.auth_provider:
            user.auth_provider = provider
        # Refresh name and photo from latest Google profile on every login.
        if name:
            user.full_name = name
        if picture:
            user.photo_url = picture
        # Safely update optional fields — never overwrite role.
        if phone_number and not user.phone_number:
            user.phone_number = phone_number
        if email_verified and not user.email_verified:
            user.email_verified = email_verified
        db.commit()
        db.refresh(user)
    else:
        # Determine a sensible full_name.
        full_name = name or phone_number or email or "Firebase User"

        # Phone-only users have no email — generate a non-loginable placeholder.
        if email:
            user_email = email
        else:
            user_email = f"phone_{uid}@firebase.local"

        # Generate an unusable hashed password (satisfies the non-nullable column).
        # This cannot be used to log in via the normal /login endpoint.
        unusable_password = get_password_hash(secrets.token_hex(16)[:32])

        user = User(
            email=user_email,
            full_name=full_name,
            hashed_password=unusable_password,
            role=UserRole.STUDENT.value,          # Always student — never admin.
            firebase_uid=uid,
            auth_provider=provider,
            phone_number=phone_number,
            photo_url=picture,
            email_verified=email_verified,
        )
        db.add(user)
        db.commit()
        db.refresh(user)

    # 5. Issue the existing app JWT.
    access_token = create_access_token(subject=user.id)
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": user,
    }
