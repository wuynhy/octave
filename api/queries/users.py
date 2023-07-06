from pydantic import BaseModel
from typing import List, Optional, Union
from .pool import pool


class Error(BaseModel):
    message: str


class DuplicateUserError(ValueError):
    pass


class UserIn(BaseModel):
    username: str
    password: str
    email: str
    avatar: Optional[str] = ""
    bio: Optional[str] = ""


class UserOut(BaseModel):
    id: int
    username: str
    email: str
    avatar: str
    bio: str
    friends_count: int
    following_count: int


class UsersOut(BaseModel):
    users: List[UserOut]


class UserOutWithPassword(UserOut):
    password_hash: str


class UserRepository:
    def record_to_user_out(self, record):
        return UserOutWithPassword(
            id=record[0],
            username=record[1],
            email=record[2],
            avatar=record[3],
            bio=record[4],
            friends_count=record[5],
            following_count=record[6],
            password_hash=record[7],
        )

    def user_in_to_out(self, username: str, user: UserIn, password_hash: str):
        old_data = user.dict()
        return UserOutWithPassword(
            username=username, password_hash=password_hash, **old_data
        )

    def get(self, username: str) -> Optional[UserOutWithPassword]:
        try:
            with pool.connection() as conn:
                with conn.cursor() as db:
                    result = db.execute(
                        """
                        SELECT id, username, email, avatar, bio, friends_count, following_count, password_hash
                        FROM users
                        WHERE username = %s;
                        """,
                        [username],
                    )
                    record = result.fetchone()
                    if record is None:
                        return None
                    return self.record_to_user_out(record)
        except Exception:
            raise Exception("Failed to get user")

    def get_all(self):
        try:
            with pool.connection() as conn:
                with conn.cursor() as db:
                    result = db.execute(
                        """
                        SELECT id, username, email, avatar, bio, friends_count, following_count, password_hash
                        FROM users
                        ORDER BY id;
                        """
                    )
                    return [
                        UserOut(
                            id=record[0],
                            username=record[1],
                            email=record[2],
                            avatar=record[3],
                            bio=record[4],
                            friends_count=record[5],
                            following_count=record[6],
                        )
                        for record in result
                    ]
        except Exception:
            raise Exception("Failed to get all users")

    def create(self, user: UserIn, password_hash: str) -> UserOutWithPassword:
        try:
            with pool.connection() as conn:
                with conn.cursor() as db:
                    result = db.execute(
                        """
                        INSERT INTO users (username, email, password_hash)
                        VALUES (%s, %s, %s)
                        RETURNING id, username, email, avatar, bio, friends_count, following_count, password_hash;
                        """,
                        [user.username, user.email, password_hash],
                    )
                    user_id = result.fetchone()[0]
                    return UserOutWithPassword(
                        id=user_id,
                        username=user.username,
                        email=user.email,
                        avatar="",
                        bio="",
                        friends_count=0,
                        following_count=0,
                        password_hash=password_hash,
                    )
        except Exception as e:
            if "duplicate key value violates unique constraint" in str(e):
                raise DuplicateUserError("Username already exists")
            raise Exception("Failed to create the user")

    def update(
        self, username: str, user: UserIn, password_hash: str
    ) -> Union[UserOutWithPassword, Error]:
        try:
            with pool.connection() as conn:
                with conn.cursor() as db:
                    result = db.execute(
                        """
                        UPDATE users
                        SET username = %s, email = %s, avatar = %s, bio = %s, password_hash = %s
                        WHERE username = %s
                        RETURNING id, username, email, avatar, bio, friends_count, following_count, password_hash;
                        """,
                        [
                            user.username,
                            user.email,
                            user.avatar,
                            user.bio,
                            password_hash,
                            username,
                        ],
                    )
                    record = result.fetchone()
                    if record is None:
                        return Error(message="User not found")
                    return self.record_to_user_out(record)
        except Exception as e:
            if "duplicate key value violates unique constraint" in str(e):
                raise DuplicateUserError("Username already exists")
            raise Exception("Failed to update the user")

    def delete(self, username: str) -> bool:
        try:
            with pool.connection() as conn:
                with conn.cursor() as db:
                    db.execute(
                        """
                        DELETE FROM users
                        WHERE username = %s;
                        """,
                        [username],
                    )
                    return True
        except Exception:
            return False
