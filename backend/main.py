"""
Vault OS Backend — FastAPI
Swap SECRET_KEY and user store for production.
pip install fastapi uvicorn python-jose[cryptography] passlib
Run: uvicorn main:app --reload
"""

from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel
from jose import JWTError, jwt
from passlib.context import CryptContext
from datetime import datetime, timedelta

SECRET_KEY = "CHANGE_THIS_IN_PRODUCTION"
ALGORITHM = "HS256"
TOKEN_EXPIRE_HOURS = 8

app = FastAPI(title="Vault OS API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # Add production domain
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

pwd = CryptContext(schemes=["bcrypt"], deprecated="auto")
bearer = HTTPBearer()

# Replace with real DB
USERS_DB = {
    "admin": {
        "id": "1",
        "username": "admin",
        "hashed_password": pwd.hash("vault2025"),  # Change this
        "role": "admin",
    }
}


class LoginRequest(BaseModel):
    username: str
    password: str


def create_token(data: dict) -> str:
    payload = {**data, "exp": datetime.utcnow() + timedelta(hours=TOKEN_EXPIRE_HOURS)}
    return jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)


def decode_token(token: str) -> dict:
    try:
        return jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")


@app.post("/login")
def login(body: LoginRequest):
    user = USERS_DB.get(body.username)
    if not user or not pwd.verify(body.password, user["hashed_password"]):
        raise HTTPException(status_code=401, detail="Invalid credentials")

    token = create_token({"sub": user["id"], "username": user["username"], "role": user["role"]})
    return {
        "token": token,
        "user": {"id": user["id"], "username": user["username"], "role": user["role"]},
    }


@app.get("/me")
def get_me(creds: HTTPAuthorizationCredentials = Depends(bearer)):
    payload = decode_token(creds.credentials)
    return {"id": payload["sub"], "username": payload["username"], "role": payload["role"]}


@app.get("/health")
def health():
    return {"status": "ok"}
