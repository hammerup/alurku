import os
import bcrypt
import jwt
from datetime import datetime, timedelta
from fastapi import HTTPException, Depends, Header
from fastapi.security import OAuth2PasswordBearer
from typing import Optional
from sqlalchemy.orm import Session

# Import get_db and User model from database
from database import get_db, User

# Konfigurasi Keamanan (JWT & Bcrypt)
SECRET_KEY = os.getenv("SECRET_KEY")
if not SECRET_KEY:
    raise ValueError(
        "FATAL ERROR: SECRET_KEY environment variable is not set. "
        "The application cannot start in an insecure state."
    )

ALGORITHM = "HS256"
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="api/login", auto_error=False)

def get_password_hash(password: str) -> str:
    # Batasi 71 karakter dan hash langsung menggunakan bcrypt (tanpa passlib)
    salt = bcrypt.gensalt()
    return bcrypt.hashpw(password.encode("utf-8")[:71], salt).decode("utf-8")

def verify_password(plain_password: str, hashed_password: str) -> bool:
    try:
        return bcrypt.checkpw(
            plain_password.encode("utf-8")[:71], hashed_password.encode("utf-8")
        )
    except Exception:
        return False

def create_access_token(data: dict, expires_delta: timedelta = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(days=30)  # Berlaku 30 hari (standar ideal SaaS)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

def get_current_user(
    token: Optional[str] = Depends(oauth2_scheme),
    x_authorization: Optional[str] = Header(None, alias="X-Authorization"),
    db: Session = Depends(get_db)
):
    # Jika token dari Authorization header kosong, coba ambil dari X-Authorization (bypass proxy filter)
    if not token and x_authorization:
        if x_authorization.startswith("Bearer "):
            token = x_authorization.split(" ")[1]
        else:
            token = x_authorization

    if not token:
        raise HTTPException(
            status_code=401,
            detail="Invalid authentication credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )

    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            raise HTTPException(
                status_code=401, detail="Invalid authentication credentials"
            )

        user = db.query(User).filter(User.username == username).first()
        if not user:
            raise HTTPException(status_code=401, detail="User account no longer exists")
        if user.account_status == "pending_deletion":
            raise HTTPException(
                status_code=403, detail="Account is disabled and scheduled for deletion"
            )

    except jwt.PyJWTError as e:
        print("JWT Decode Error:", str(e))
        raise HTTPException(
            status_code=401, detail="Invalid authentication credentials"
        )
