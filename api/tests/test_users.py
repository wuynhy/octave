from fastapi.testclient import TestClient
from main import app
from queries.users import UserRepository
from authenticator import authenticator
from io import BytesIO


client = TestClient(app)

dummyUser = {
    "id": 1,
    "username": "test",
    "email": "email@test.com",
    "avatar_url": "default_avatar.jpg",
    "bio": "",
    "friends_count": 0,
    "following_count": 0,
}


def override():
    return dummyUser


class TestUserQueries:
    def get_all(self):
        return {"users": [dummyUser]}

    def delete(self, username):
        return True

    def get(self, username):
        if username == dummyUser['username']:
            return dummyUser
        return None

    async def update(self, current_username, user, hashed_password):
        return {**dummyUser, **user.dict()}


def test_get_all_users():
    app.dependency_overrides[UserRepository] = TestUserQueries
    app.dependency_overrides[
        authenticator.get_current_account_data
        ] = override
    response = client.get("/users")
    app.dependency_overrides = {}
    assert response.status_code == 200
    assert response.json() == {"users": [dummyUser]}


def test_get_one_user():
    app.dependency_overrides[UserRepository] = TestUserQueries
    app.dependency_overrides[
        authenticator.get_current_account_data
        ] = override
    response = client.get("/users/test")
    app.dependency_overrides = {}
    assert response.status_code == 200
    assert response.json() == dummyUser


def test_update_user():
    app.dependency_overrides[UserRepository] = TestUserQueries
    app.dependency_overrides[
        authenticator.get_current_account_data
        ] = override
    data = {
        "username": "stingy",
        "password": "test",
        "email": "test@gmail.com",
        "bio": "test",
    }
    files = {
        "avatar": ("filename.jpg", BytesIO(b"test"), "image/jpeg"),
    }
    response = client.put(
        "/users/test",
        data=data,
        files=files
    )
    app.dependency_overrides = {}
    assert response.status_code == 200
    response_data = response.json()
    assert "avatar" in response_data
    del response_data["avatar"]
    assert response_data == {
        "id": 1,
        "username": "stingy",
        "password": "test",
        "email": "test@gmail.com",
        "bio": "test",
        "avatar_url": "default_avatar.jpg",
        "friends_count": 0,
        "following_count": 0,
    }


def test_delete_user():
    app.dependency_overrides[UserRepository] = TestUserQueries
    app.dependency_overrides[
        authenticator.get_current_account_data
        ] = override
    response = client.delete("/users/test")
    app.dependency_overrides = {}
    assert response.status_code == 200
    expected_response = True
    assert response.json() == expected_response


class TestInvalidToken:
    def get_all(self):
        return invalidToken


invalidToken = {"detail": "Invalid token"}


def test_invalid_token():
    app.dependency_overrides[UserRepository] = TestUserQueries
    response = client.get("/users")
    app.dependency_overrides = {}
    assert response.status_code == 401
    assert response.json() == invalidToken
