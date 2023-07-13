from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import os
from routers import users, genres, songs, friends
from authenticator import authenticator

app = FastAPI()
app.include_router(authenticator.router)
app.include_router(users.router)
app.include_router(genres.router)
app.include_router(songs.router)
app.include_router(friends.router)


app.add_middleware(
    CORSMiddleware,
    allow_origins=[os.environ.get("CORS_HOST", "http://localhost:3000")],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
