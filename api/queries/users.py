from pydantic import BaseModel, validator
from typing import List, Optional, Union
import boto3
import uuid
from botocore.exceptions import NoCredentialsError
from .pool import pool
from fastapi import UploadFile
import os


class Error(BaseModel):
    message: str


class DuplicateUserError(ValueError):
    pass


class UserIn(BaseModel):
    username: str
    password: str
    email: str


class UserUpdate(UserIn):
    avatar: Optional[UploadFile] = None
    bio: Optional[str] = ""

    @validator("avatar")
    def validate_avatar(cls, file):
        if not file.filename.lower().endswith((".jpg", ".jpeg", ".png")):
            raise ValueError(
                "Only JPG, JPEG, and PNG files are allowed for the cover art."
            )
        return file


class UserOut(BaseModel):
    id: int
    username: str
    email: str
    avatar_url: Optional[str] = None
    bio: Optional[str] = None
    friends_count: int = 0
    following_count: int = 0


class UsersOut(BaseModel):
    users: List[UserOut]


class UserOutWithPassword(UserOut):
    password_hash: str


class UserRepository:
    def __init__(self):
        self.access_key = os.environ.get("AWS_ACCESS_KEY_ID")
        self.secret_key = os.environ.get("AWS_SECRET_ACCESS_KEY")
        self.region_name = os.environ.get("AWS_DEFAULT_REGION")
        self.bucket_name = os.environ.get("AWS_BUCKET_NAME")
        self.s3_client = boto3.client(
            "s3",
            region_name=self.region_name,
            aws_access_key_id=self.access_key,
            aws_secret_access_key=self.secret_key,
        )

    async def upload_to_s3(self, file_name, bucket, object_name=None):
        if object_name is None:
            object_name = os.path.basename(file_name.filename)
            object_name = object_name.replace(" ", "-")

        temp = f"/tmp/{object_name}"
        with open(temp, "wb") as f:
            f.write(await file_name.read())

        try:
            self.s3_client.upload_file(temp, bucket, object_name)
            return True
        except NoCredentialsError:
            return False
        except Exception as e:
            print(f"Error uploading file to S3: {e}")
            return False
        finally:
            os.remove(temp)

    def delete_from_s3(self, file_name: str):
        try:
            self.s3_client.delete_object(
                Bucket=self.bucket_name, Key=file_name
            )
            print("Deletion Successful")
            return True
        except NoCredentialsError:
            print("Credentials not available")
            return False
        except Exception as e:
            print(f"Error deleting file from S3: {e}")
            return False

    def record_to_user_out(self, record):
        return UserOutWithPassword(
            id=record[0],
            username=record[1],
            email=record[2],
            avatar_url=record[3],
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
                    db.execute(
                        """
                        SELECT u.id, u.username, u.email, u.avatar, u.bio,
                        (SELECT COUNT(*) FROM friendships WHERE (user_id = u.id OR friend_id = u.id)
                        AND status = 'accepted') AS friends_count,
                        (SELECT COUNT(*) FROM friendships WHERE user_id = u.id
                        AND status = 'pending') AS following_count,
                        u.password_hash
                        FROM users AS u
                        WHERE u.username = %s;
                        """,
                        [username],
                    )
                    record = db.fetchone()
                    if record is None:
                        return None
                    return self.record_to_user_out(record)
        except Exception:
            raise Exception("Failed to get user")

    def get_all(self) -> UsersOut:
        try:
            with pool.connection() as conn:
                with conn.cursor() as db:
                    db.execute(
                        """
                            SELECT u.id, u.username, u.email, u.avatar, u.bio,
                            (SELECT COUNT(*) FROM friendships WHERE (user_id = u.id
                            OR friend_id = u.id) AND status = 'accepted') AS friends_count,
                            (SELECT COUNT(*) FROM friendships WHERE (user_id = u.id)
                            AND status = 'pending') AS following_count
                            FROM users AS u
                            ORDER BY u.id;
                        """
                    )
                    records = db.fetchall()

                    users = [
                        UserOut(
                            id=record[0],
                            username=record[1],
                            email=record[2],
                            avatar_url=record[3],
                            bio=record[4],
                            friends_count=record[5],
                            following_count=record[6],
                        )
                        for record in records
                    ]

                    return UsersOut(users=list(users))
        except Exception:
            raise Exception("Failed to get all users")

    async def create(
        self, user: UserIn, password_hash: str
    ) -> UserOutWithPassword:
        try:
            with pool.connection() as conn:
                with conn.cursor() as db:
                    result = db.execute(
                        """
                        INSERT INTO users (username, email, password_hash)
                        VALUES (%s, %s, %s)
                        RETURNING id, username, email, avatar, bio, friends_count, following_count, password_hash;
                        """,
                        [
                            user.username,
                            user.email,
                            password_hash,
                        ],
                    )
                    record = result.fetchone()
                    if record is None:
                        raise Exception("Failed to create the user")
                    user_id = record[0]

            return UserOutWithPassword(
                id=user_id,
                username=user.username,
                email=user.email,
                avatar_url="default_avatar.jpg",
                bio="",
                friends_count=0,
                following_count=0,
                password_hash=password_hash,
            )
        except Exception as e:
            if "duplicate key value violates unique constraint" in str(e):
                raise DuplicateUserError("Username already exists")
            raise Exception("Failed to create the user")

    async def update(
        self, old_username: str, user: UserUpdate, password_hash: str
    ) -> Union[UserOutWithPassword, Error]:
        try:
            exitsting_user = self.get(old_username)
            if exitsting_user is None:
                return Error(message="User not found")

            avatar_file = exitsting_user.avatar_url
            temp_cover_file = None
            avatar_key_name = None

            if (
                user.avatar is not None
                and user.avatar.filename != exitsting_user.avatar_url
            ):
                if (
                    exitsting_user.avatar_url is not None
                    and exitsting_user.avatar_url != "default_avatar.jpg"
                ):
                    avatar_key = exitsting_user.avatar_url.split("/")[-1]
                    self.delete_from_s3(avatar_key)

                temp_cover_file = user.avatar
                avatar_key_name = (
                    f"{user.username.replace(' ', '-')}-cover-"
                    f"{temp_cover_file.filename}-{uuid.uuid4().hex}"
                )
                avatar_file = f"https://{self.bucket_name}.s3.{self.region_name}.amazonaws.com/{avatar_key_name}"

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
                            avatar_file,
                            user.bio,
                            password_hash,
                            old_username,
                        ],
                    )
                    record = result.fetchone()
                    if record is None:
                        return Error(message="User not found")

            if temp_cover_file is not None and avatar_key_name is not None:
                await self.upload_to_s3(
                    temp_cover_file, self.bucket_name, avatar_key_name
                )

            return self.record_to_user_out(record)
        except Exception as e:
            if "duplicate key value violates unique constraint" in str(e):
                raise DuplicateUserError("Username already exists")
            raise Exception("Failed to update the user")

    def delete(self, username: str) -> bool:
        try:
            user = self.get(username)
            if user is None:
                return False
            existing_avatar = None
            if user.avatar_url:
                existing_avatar = user.avatar_url.split("/")[-1]
            if existing_avatar is not None:
                self.delete_from_s3(existing_avatar)

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
