import os
from typing import Optional, Union, List
from .pool import pool
from pydantic import BaseModel, validator
from fastapi import UploadFile, HTTPException
from .users import UserOut
import uuid
import boto3

class Error(BaseModel):
    message: str

class PlaylistIn(BaseModel):
    name: str
    user_id: int
    description: Optional[str] = None
    cover: Optional[UploadFile] = None
    songs: Optional[List[str]] = []

    @validator("cover")
    def validate_cover(cls, file):
        if not file.filename.lower().endswith((".jpg", ".jpeg", ".png")):
            raise ValueError("Only JPG, JPEG, and PNG files are allowed for the cover image.")
        return file

class PlaylistOut(BaseModel):
    id: int
    name: str
    description: Optional[str] = None
    owner: str
    songs: List[str] = []  # Add the songs field
    cover: Optional[str] = None




class PlaylistRepository:
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

    def get_playlist_by_id(self, playlist_id: int) -> Optional[PlaylistOut]:
        try:
            with pool.connection() as conn:
                with conn.cursor() as db:
                    db.execute(
                        """
                        SELECT
                            p.id,
                            p.name,
                            p.description,
                            u.username as owner,
                            STRING_AGG(DISTINCT CAST(ps.song_id AS TEXT), ',') as songs,
                            p.cover
                        FROM playlists p
                        LEFT JOIN playlist_songs ps ON p.id = ps.playlist_id
                        LEFT JOIN songs s ON ps.song_id = s.id
                        LEFT JOIN users u ON p.user_id = u.id
                        WHERE p.id = %s
                        GROUP BY p.id, u.username;
                        """,
                        [playlist_id],
                    )
                    record = db.fetchone()
                    if record is not None:
                        return PlaylistOut(
                            id=record[0],
                            name=record[1],
                            description=record[2],
                            owner=record[3],
                            songs=record[4].split(",") if record[4] else [],
                            cover=record[5],
                        )
                    return None  # If no playlist is found, return None
        except Exception as e:
            print(f"Error fetching playlist: {e}")
            return None  # Return None on error


    def get_all_playlists(self) -> List[PlaylistOut]:
        try:
            with pool.connection() as conn:
                with conn.cursor() as db:
                    db.execute(
                        """
                        SELECT
                            p.id,
                            p.name,
                            p.description,
                            u.username as owner,
                            STRING_AGG(DISTINCT p.name, ',') as songs,
                            p.cover  -- Include the 'cover' field in the SELECT query
                        FROM playlists p
                        LEFT JOIN playlist_songs ps ON p.id = ps.playlist_id
                        LEFT JOIN songs s ON ps.song_id = s.id
                        LEFT JOIN users u ON p.user_id = u.id
                        GROUP BY p.id, u.username
                        ORDER BY p.id
                        """
                    )
                    records = db.fetchall()
                    if len(records) == 0:
                        return []

                    playlists = [
                        PlaylistOut(
                            id=record[0],
                            name=record[1],
                            description=record[2],
                            owner=record[3],
                            songs=record[4].split(",") if record[4] else [],
                            cover=record[5],
)
                        for record in records
                    ]
        except Exception as e:
            print(f"Error fetching playlists: {e}")
            return []

        return playlists

    async def create_playlist(self, user_id: int, playlist: PlaylistIn) -> Optional[PlaylistOut]:
        try:
            cover_key_name = f"{uuid.uuid4().hex}-{playlist.cover.filename}"
            self.s3_client.upload_fileobj(playlist.cover.file, self.bucket_name, cover_key_name)
            cover_file = f"https://{self.bucket_name}.s3.{self.region_name}.amazonaws.com/{cover_key_name}"
            with pool.connection() as conn:
                with conn.cursor() as db:
                    db.execute(
                        """
                        INSERT INTO playlists(user_id, name, description, cover)
                        VALUES(%s, %s, %s, %s)
                        RETURNING id;
                        """,
                        [
                            user_id,
                            playlist.name,
                            playlist.description,
                            cover_file,
                        ],
                    )
                    result = db.fetchone()
                    if result is not None:
                        playlist_id = result[0]
                    else:
                        raise ValueError("Failed to create playlist")

                    if playlist.songs is not None:
                        for song in playlist.songs:
                            db.execute(
                                """
                                INSERT INTO playlist_songs(playlist_id, song_id)
                                VALUES(%s, (SELECT id FROM songs WHERE title = %s));
                                """,
                                [playlist_id, song],
                            )

            # After inserting the playlist, fetch the details and return the PlaylistOut object
            return self.get_playlist_by_id(playlist_id)
        except Exception as e:
            print(f"Error creating playlist: {e}")
            return None

    async def update_playlist(
    self, user_id: int, playlist_id: int, playlist: PlaylistIn
) -> Union[Error, PlaylistOut]:
        try:
            existing_playlist = self.get_playlist_by_id(playlist_id)
            if existing_playlist is None:
                return Error(message="Playlist not found")

            if playlist.cover:  # If a new cover image is provided
                cover_key_name = f"{uuid.uuid4().hex}-{playlist.cover.filename}"
                self.s3_client.upload_fileobj(playlist.cover.file, self.bucket_name, cover_key_name)  # Upload to S3
                cover_file = f"https://{self.bucket_name}.s3.{self.region_name}.amazonaws.com/{cover_key_name}"
            else:  # If no new cover image is provided, use the existing cover image
                cover_file = existing_playlist.cover

            with pool.connection() as conn:
                with conn.cursor() as db:
                    db.execute(
                        """
                        UPDATE playlists
                        SET name = %s, description = %s, cover = %s
                        WHERE id = %s AND user_id = %s
                        """,
                        [playlist.name, playlist.description, cover_file, playlist_id, user_id],
                    )

                    db.execute(
                        """
                        DELETE FROM playlist_songs
                        WHERE playlist_id = %s
                        """,
                        [playlist_id],
                    )
                    if playlist.songs is not None:
                        for song in playlist.songs:
                            db.execute(
                                """
                                INSERT INTO playlist_songs (playlist_id, song_id)
                                VALUES (%s, (SELECT id FROM songs WHERE name = %s));
                                """,
                                [playlist_id, song],
                            )

            updated_playlist = self.get_playlist_by_id(playlist_id)
            if updated_playlist is None:
                return Error(message="Playlist is nowhere")
            return updated_playlist
        except Exception as e:
            print(f"Error updating playlist: {e}")
            raise HTTPException(
                status_code=500, detail="Failed to update playlist"
            )


    def delete_playlist(self, playlist_id: int):
        try:
            existing_playlist = self.get_playlist_by_id(playlist_id)
            if existing_playlist is None:
                return False

            with pool.connection() as conn:
                with conn.cursor() as db:
                    db.execute(
                        """
                        DELETE FROM playlists
                        WHERE id = %s
                        """,
                        [playlist_id],
                    )
                    return True
        except Exception as e:
            print(f"Error deleting playlist: {e}")
            return False
