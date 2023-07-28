from fastapi.testclient import TestClient
from main import app
from queries.playlists import PlaylistRepository
from authenticator import authenticator

client = TestClient(app)


class Playlist:
    def __init__(
        self,
        id,
        name,
        owner,
        description,
        songs,
        artists,
        music_files,
        covers,
        durations,
        cover_url,
    ):
        self.id = id
        self.name = name
        self.owner = owner
        self.description = description
        self.songs = songs
        self.artists = artists
        self.music_files = music_files
        self.covers = covers
        self.durations = durations
        self.cover_url = cover_url

    def to_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "owner": self.owner,
            "description": self.description,
            "songs": self.songs,
            "artists": self.artists,
            "music_files": self.music_files,
            "covers": self.covers,
            "durations": self.durations,
            "cover_url": self.cover_url,
        }


dummyPlaylistsData = [
    {
        "id": 1,
        "name": "test",
        "owner": "test",
        "description": "hello",
        "songs": [],
        "artists": [],
        "music_files": [],
        "covers": [],
        "durations": [],
        "cover_url": "default_cover.jpg",
    },
]

dummyPlaylist = [Playlist(**data) for data in dummyPlaylistsData]


dummyUser = {
    "id": 1,
    "username": "test",
    "email": "testemail@test.com",
    "avatar_url": "default_avatar.jpg",
    "bio": "",
    "friends_count": 0,
    "following_count": 0,
}


def override():
    return dummyUser


class TestPlaylistQueries:
    def get_all(self):
        return dummyPlaylistsData

    def get(self, playlist_id):
        for playlist in dummyPlaylist:
            if playlist.id == playlist_id:
                return playlist.to_dict()
        return None

    def get_one(self, playlist_id):
        for playlist in dummyPlaylist:
            if playlist.id == playlist_id:
                return playlist
        return None

    def delete(self, playlist_id):
        return True


def test_get_all_playlists(monkeypatch):
    monkeypatch.setattr(
        PlaylistRepository, "get_all_playlists", TestPlaylistQueries.get_all
    )

    response = client.get("/playlists")
    assert response.status_code == 200
    assert response.json() == dummyPlaylistsData


def test_get_one_playlist(monkeypatch):
    monkeypatch.setattr(
        PlaylistRepository, "get_playlist_by_id", TestPlaylistQueries.get
    )
    response = client.get("/playlists/1")
    expected_response = vars(dummyPlaylist[0])
    assert response.status_code == 200
    assert response.json() == expected_response


def test_delete_playlist(monkeypatch):
    monkeypatch.setattr(
        PlaylistRepository, "get_playlist_by_id", TestPlaylistQueries.get_one
    )
    monkeypatch.setattr(
        PlaylistRepository, "delete_playlist", TestPlaylistQueries.delete
    )
    app.dependency_overrides[authenticator.get_current_account_data] = override

    response = client.delete("/playlists/1")
    app.dependency_overrides = {}
    assert response.status_code == 200
    assert response.json() == {"deleted": "success"}
