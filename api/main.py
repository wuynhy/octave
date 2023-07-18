from databases import Database
from fastapi import FastAPI, WebSocket, WebSocketDisconnect, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.encoders import jsonable_encoder
from pydantic import BaseModel
from typing import Optional
import json
import os
from routers import users, genres, songs, friends, stages
from authenticator import authenticator

DATABASE_URL = os.environ.get("DATABASE_URL")

database = Database(DATABASE_URL)

app = FastAPI()

origins = [
    os.environ.get("CORS_HOST", "http://localhost:3000"),
]

app.include_router(authenticator.router)
app.include_router(users.router)
app.include_router(genres.router)
app.include_router(songs.router)
app.include_router(friends.router)
app.include_router(stages.router)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[os.environ.get("CORS_HOST", "http://localhost:3000")],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class ChatIn(BaseModel):
    sender_id: int
    stage_id: int
    message: str


class ChatOut(ChatIn):
    id: int
    username: Optional[str] = None


class ChatQueries:
    async def create(self, chat: ChatIn) -> Optional[ChatOut]:
        query = "INSERT INTO chats (stage_id, sender_id, message) VALUES (:stage_id, :sender_id, :message) RETURNING id"
        values = {
            "stage_id": chat.stage_id,
            "sender_id": chat.sender_id,
            "message": chat.message,
        }
        res = await database.execute(query, values)
        return await self.get_chat_by_id(res) if res else None

    async def get_chat_by_id(self, id: int) -> Optional[ChatOut]:
        query = "SELECT * FROM chats WHERE id = :id"
        res = await database.fetch_one(query, {"id": id})
        if res:
            return ChatOut(**res)
        return None

    async def get_chats_by_stage_id(self, stage_id: int) -> list[ChatOut]:
        query = """
        SELECT chats.*, users.username
        FROM chats
        LEFT JOIN users ON chats.sender_id = users.id
        WHERE stage_id = :stage_id
        ORDER BY chats.id ASC
        """
        res = await database.fetch_all(query, {"stage_id": stage_id})
        return [ChatOut(**chat) for chat in res]


@app.on_event("startup")
async def startup():
    await database.connect()


@app.on_event("shutdown")
async def shutdown():
    await database.disconnect()


@app.get("/stages/{stage_id}/chats")
async def read_chats(
    stage_id: int, queries: ChatQueries = Depends(ChatQueries)
):
    chats = await queries.get_chats_by_stage_id(stage_id)
    if chats is None:
        return {"detail": "No chats found for this stage_id"}
    return jsonable_encoder(chats)


connections = {}


@app.websocket("/stages/{stage_id}/chats/{sender_id}")
async def websocket_endpoint(
    stage_id: int,
    sender_id: int,
    websocket: WebSocket,
    queries: ChatQueries = Depends(ChatQueries),
):
    await websocket.accept()
    connections[sender_id] = {"connection": websocket, "stage_id": stage_id}
    try:
        while True:
            data = await websocket.receive_text()
            parsed = json.loads(data)
            chat = ChatIn(
                sender_id=parsed["sender_id"],
                stage_id=parsed["stage_id"],
                message=parsed["message"],
            )
            new_chat = await queries.create(chat)
            new_chat.username = parsed["username"]
            if new_chat:
                for connection in connections.values():
                    if connection["stage_id"] == stage_id:
                        await connection["connection"].send_text(
                            json.dumps(new_chat.dict())
                        )
    except WebSocketDisconnect:
        del connections[sender_id]
