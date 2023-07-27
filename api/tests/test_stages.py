from fastapi.testclient import TestClient
from main import app
from queries.stages import StageRepository
from authenticator import authenticator

client = TestClient(app)


class Stage:
    def __init__(
        self, id, name, host, cover_url, genres, participants, playlists
    ):
        self.id = id
        self.name = name
        self.host = host
        self.cover_url = cover_url
        self.genres = genres
        self.participants = participants
        self.playlists = playlists

    def to_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "host": self.host,
            "cover_url": self.cover_url,
            "genres": self.genres,
            "participants": self.participants,
            "playlists": self.playlists,
        }


dummyStagesData = [
    {
        "id": 1,
        "name": "test",
        "host": "host",
        "cover_url": "https://myoctavebucket.s3.us-west-1.amazonaws.com/"
        "94c1335375a3a2f1bfb11d0709d4d94d.jpg-98ee92b0e9cb493f877c369ab49dae24",
        "genres": ["afrobeat,ambient"],
        "participants": ["string"],
        "playlists": [],
    }
]


dummyUser = {
    "id": 1,
    "username": "host",
    "email": "host@ex.com",
    "avatar_url": "default_avatar.jpg",
    "bio": "",
    "friends_count": 0,
    "following_count": 0,
}

dummyStage = [Stage(**data) for data in dummyStagesData]


def override():
    return dummyUser


class TestStageQueries:
    def get_all(self):
        return dummyStagesData

    def get(self, stage_id):
        for stage in dummyStage:
            if stage.id == stage_id:
                return stage.to_dict()

    def get_one(self, stage_id):
        for stage in dummyStage:
            if stage.id == stage_id:
                return stage
        return None

    def delete(self, stage_id):
        return True


def test_get_all(monkeypatch):
    monkeypatch.setattr(StageRepository, "get_all", TestStageQueries.get_all)
    response = client.get("/stages")
    assert response.status_code == 200
    assert response.json() == dummyStagesData


def test_get_one(monkeypatch):
    monkeypatch.setattr(StageRepository, "get_one", TestStageQueries.get)
    response = client.get("/stages/1")
    assert response.status_code == 200
    assert response.json() == vars(dummyStage[0])


def test_delete(monkeypatch):
    monkeypatch.setattr(StageRepository, "get_one", TestStageQueries.get_one)
    monkeypatch.setattr(StageRepository, "delete", TestStageQueries.delete)
    app.dependency_overrides[authenticator.get_current_account_data] = override
    response = client.delete("/stages/1")
    app.dependency_overrides = {}
    assert response.status_code == 200
    assert response.json() == {"message": "Stage deleted successfully"}
