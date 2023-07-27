from fastapi.testclient import TestClient
from main import app
from queries.songs import SongRepository
from authenticator import authenticator

client = TestClient(app)


class Song:
    def __init__(self, id, uploader, title, artist, music_file_url, cover_url, duration, genres):
        self.id = id
        self.uploader = uploader
        self.title = title
        self.artist = artist
        self.music_file_url = music_file_url
        self.cover_url = cover_url
        self.duration = duration
        self.genres = genres

    def covert_to_dict(self):
        return {
            "id": self.id,
            "uploader": self.uploader,
            "title": self.title,
            "artist": self.artist,
            "music_file_url": self.music_file_url,
            "cover_url": self.cover_url,
            "duration": self.duration,
            "genres": self.genres,
        }


dummySongData = [
    {
        "id": 1,
        "uploader": "quynh",
        "title": "wave to earth",
        "artist": "season",
        "music_file_url":
        "https://myoctavebucket.s3.us-west-1.amazonaws.com/"
        "spotifydown.com---seasons.mp3-f655185f9d3e492f98d7baacd0d64f1f",
        "cover_url": "https://myoctavebucket.s3.us-west-1.amazonaws.com/ชจนบข.jpg-ece55fcb555d40b6a8f39f1f1a128977",
        "duration": 256,
        "genres": ["ambient", "alternative", "afrobeat"],
    }
]

dummyUser = {
    "id": 1,
    "username": "quynh",
    "email": "email@test.com",
    "avatar_url": "default_avatar.jpg",
    "bio": "",
    "friends_count": 0,
    "following_count": 0,
}

dummySong = [Song(**data) for data in dummySongData]


def override():
    return dummyUser


class TestSongQueries:
    def get_all_songs(self):
        return dummySongData

    def get(self, song_id):
        for playlist in dummySong:
            if playlist.id == song_id:
                return playlist.covert_to_dict()
        return None

    def get_one(self, song_id):
        for playlist in dummySong:
            if playlist.id == song_id:
                return playlist
        return None

    def delete(self, song_id):
        return True


def test_get_all_songs(monkeypatch):
    monkeypatch.setattr(
        SongRepository, "get_all", TestSongQueries.get_all_songs
    )
    monkeypatch.setattr(authenticator, "get_current_account_data", override)
    response = client.get("/songs")
    assert response.status_code == 200
    assert response.json() == dummySongData


def test_get_one_song(monkeypatch):
    monkeypatch.setattr(SongRepository, "get", TestSongQueries.get)
    monkeypatch.setattr(authenticator, "get_current_account_data", override)
    response = client.get("/songs/1")
    assert response.status_code == 200
    assert response.json() == vars(dummySong[0])


def test_delete_song(monkeypatch):
    monkeypatch.setattr(SongRepository, "get", TestSongQueries.get_one)
    monkeypatch.setattr(SongRepository, "delete", TestSongQueries.delete)
    app.dependency_overrides[
        authenticator.get_current_account_data
        ] = override

    response = client.delete("/songs/1")
    app.dependency_overrides = {}
    assert response.status_code == 200
    assert response.json() == {"message": "Song deleted successfully"}
