from fastapi.testclient import TestClient
from main import app
from queries.genres import GenreRepository


client = TestClient(app)

dummyGenre = [
    {"id": 1, "name": "acoustic"},
    {"id": 2, "name": "afrobeat"},
    {"id": 3, "name": "alt-rock"},
    {"id": 4, "name": "alternative"},
    {"id": 5, "name": "ambient"},
    {"id": 6, "name": "anime"},
]


class TestGenreQueries:
    def get_all(self):
        return dummyGenre

    def get_one(self, genre_id):
        if genre_id == dummyGenre[0]["id"]:
            return dummyGenre[0]
        return None


def test_get_all_genres():
    app.dependency_overrides[GenreRepository] = TestGenreQueries
    response = client.get("/genres")
    app.dependency_overrides = {}
    assert response.status_code == 200
    assert response.json() == dummyGenre


def test_get_one_genre():
    app.dependency_overrides[GenreRepository] = TestGenreQueries
    response = client.get("/genres/1")
    app.dependency_overrides = {}
    assert response.status_code == 200
    assert response.json() == dummyGenre[0]
