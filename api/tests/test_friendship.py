from fastapi.testclient import TestClient
from main import app
from queries.friends import FriendshipRepository
from authenticator import authenticator


client = TestClient(app)


dummyFriendship = [
    {
        "id": 1,
        "user_id": 1,
        "friend_id": 2,
        "status": "pending",
    },
    {
        "id": 2,
        "user_id": 1,
        "friend_id": 4,
        "status": "pending",
    },
]


dummyUser = {
    "users": [
        {
            "id": 1,
            "username": "test",
            "email": "test@ex.com",
            "avatar_url": "default_avatar.jpg",
            "bio": "",
            "friends_count": 0,
            "following_count": 0,
        },
        {
            "id": 2,
            "username": "test2",
            "email": "test2@ex.com",
            "avatar_url": "default_avatar.jpg",
            "bio": "",
            "friends_count": 0,
            "following_count": 0,
        },
        {
            "id": 3,
            "username": "test3",
            "email": "test3@ex.com",
            "avatar_url": "default_avatar.jpg",
            "bio": "hi",
            "friends_count": 0,
            "following_count": 0,
        },
        {
            "id": 4,
            "username": "test4",
            "email": "test4@ex.com",
            "avatar_url": "default_avatar.jpg",
            "bio": "hi hi",
            "friends_count": 0,
            "following_count": 0,
        },
    ]
}


def override():
    return dummyUser["users"][0]


class TestFriendshipQueries:
    def get_all(self):
        return dummyFriendship

    def get(self, friendship_id):
        if friendship_id == dummyFriendship[0]["id"]:
            return dummyFriendship[0]
        return None

    def delete_friendship(self, username, friendname):
        return True

    def check_friendship_exist(self, username, friendname):
        return True


def test_get_all_friendships(monkeypatch):
    monkeypatch.setattr(
        FriendshipRepository, "get_all", TestFriendshipQueries.get_all
    )
    response = client.get("/friendships")
    assert response.status_code == 200
    assert response.json() == dummyFriendship


def test_get_one_friendship(monkeypatch):
    monkeypatch.setattr(FriendshipRepository, "get", TestFriendshipQueries.get)
    response = client.get("/friendships/1")
    assert response.status_code == 200
    assert response.json() == dummyFriendship[0]


def test_delete_friendship():
    app.dependency_overrides[FriendshipRepository] = TestFriendshipQueries
    app.dependency_overrides[authenticator.get_current_account_data] = override
    response = client.delete("/friendships/test3/delete")
    app.dependency_overrides = {}
    assert response.status_code == 200
    assert response.json()
