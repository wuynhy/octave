import os
from typing import Optional, Union, List
from .pool import pool
from pydantic import BaseModel, validator
from fastapi import UploadFile, HTTPException
from botocore.exceptions import NoCredentialsError
import uuid
import boto3


class Error(BaseModel):
    message: str


class PlaylistIn(BaseModel):
    name: str
    user_id: int
    description: Optional[str] = None
    cover: UploadFile
    songs: Optional[List[str]] = []

    @validator("cover")
    def validate_cover(cls, file):
        if not file.filename.lower().endswith((".jpg", ".jpeg", ".png")):
            raise ValueError(
                "Only JPG, JPEG, and PNG files are allowed for the cover image."
            )
        return file


class PlaylistOut(BaseModel):
    id: int
    name: str
    owner: str
    description: Optional[str] = None
    songs: Optional[List[str]] = []

    artists: Optional[List[str]]
    music_files: Optional[List[str]]
    covers: Optional[List[str]]
    durations: Optional[List[str]]
    cover_url: str


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

    def get_playlist_by_id(self, playlist_id: int) -> Optional[PlaylistOut]:
        try:
            with pool.connection() as conn:
                with conn.cursor() as db:
                    db.execute(
                        """
                        SELECT
                            p.id,
                            p.name,
                            u.username as owner,
                            p.description,
                            array_agg(s.title) FILTER (WHERE s.title IS NOT NULL) as songs,
                            array_agg(s.artist) FILTER (WHERE s.artist IS NOT NULL) as artists,
                            array_agg(s.music_file) FILTER (WHERE s.music_file IS NOT NULL) as music_files,
                            array_agg(s.cover) FILTER (WHERE s.cover IS NOT NULL) as covers,
                            array_agg(s.duration) FILTER (WHERE s.duration IS NOT NULL) as durations,
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
                            owner=record[2],
                            description=record[3],
                            songs=record[4],
                            artists=record[5],
                            music_files=record[6],
                            covers=record[7],
                            durations=record[8],
                            cover_url=record[9],
                        )
                    return None
        except Exception as e:
            print(f"Error fetching playlist: {e}")
            return None

    def get_all_playlists(self) -> List[PlaylistOut]:
        try:
            with pool.connection() as conn:
                with conn.cursor() as db:
                    db.execute(
                        """
                        SELECT
                            p.id,
                            p.name,
                            u.username as owner,
                            p.description,
                            array_agg(s.title) FILTER (WHERE s.title IS NOT NULL) as songs,
                            array_agg(s.artist) FILTER (WHERE s.artist IS NOT NULL) as artists,
                            array_agg(s.music_file) FILTER (WHERE s.music_file IS NOT NULL) as music_files,
                            array_agg(s.cover) FILTER (WHERE s.cover IS NOT NULL) as covers,
                            array_agg(s.duration) FILTER (WHERE s.duration IS NOT NULL) as durations,
                            p.cover
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
                            owner=record[2],
                            description=record[3],
                            songs=record[4],
                            artists=record[5],
                            music_files=record[6],
                            covers=record[7],
                            durations=record[8],
                            cover_url=record[9],
                        )
                        for record in records
                    ]
        except Exception as e:
            print(f"Error fetching playlists: {e}")
            return []

        return playlists

    async def create_playlist(self, user_id: int, playlist: PlaylistIn):
        try:
            if (
                playlist.cover is not None
                and playlist.cover.filename is not None
            ):
                cover_key_name = os.path.basename(playlist.cover.filename)
                cover_key_name = cover_key_name.replace(" ", "-")
                cover_key_name = f"{cover_key_name}-{uuid.uuid4().hex}"
                temp_cover_file = playlist.cover
            else:
                raise ValueError("Cover file not found")
            cover_file = f"https://{self.bucket_name}.s3.{self.region_name}.amazonaws.com/{cover_key_name}"

            with pool.connection() as conn:
                with conn.cursor() as db:
                    db.execute(
                        """
                        SELECT id from users WHERE id = %s
                        """,
                        [user_id],
                    )
                    db.execute(
                        """
                        INSERT INTO playlists (name, user_id, description, cover)
                        VALUES (%s, %s, %s, %s)
                        RETURNING id;
                        """,
                        [
                            playlist.name,
                            user_id,
                            playlist.description,
                            cover_file,
                        ],
                    )
                    result = db.fetchone()
                    if result is not None:
                        playlist_id = result[0]
                        if playlist.songs is not None:
                            for song in playlist.songs:
                                db.execute(
                                    """
                                    INSERT INTO playlist_songs (playlist_id, song_id)
                                    VALUES (%s, (SELECT id FROM songs WHERE name = %s));
                                    """,
                                    [playlist_id, song],
                                )
                    else:
                        raise Exception("Failed to create playlist")

            await self.upload_to_s3(
                temp_cover_file, self.bucket_name, cover_key_name
            )

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

            if (
                playlist.cover
                and playlist.cover.filename != existing_playlist.cover_url
            ):
                playlist_cover_key = existing_playlist.cover_url.split("/")[-1]
                try:
                    self.delete_from_s3(playlist_cover_key)
                except Exception as e:
                    raise HTTPException(
                        status_code=500,
                        detail=f"Failed to delete cover from S3: {str(e)}",
                    )
                file_name = playlist.cover
                key_name = f"{playlist.name.replace(' ', '-')}-cover-{file_name.filename}-{uuid.uuid4().hex}"
                try:
                    await self.upload_to_s3(
                        file_name, self.bucket_name, key_name
                    )
                except Exception as e:
                    raise HTTPException(
                        status_code=500,
                        detail=f"Failed to upload cover to S3: {str(e)}",
                    )
                s3_cover = f"https://{self.bucket_name}.s3.{self.region_name}.amazonaws.com/{key_name}"
            else:
                s3_cover = existing_playlist.cover_url

            with pool.connection() as conn:
                with conn.cursor() as db:
                    db.execute(
                        """
                        UPDATE playlists
                        SET name = %s, user_id = %s, description = %s, cover = %s
                        WHERE id = %s
                        """,
                        [
                            playlist.name,
                            playlist.user_id,
                            playlist.description,
                            s3_cover,
                            playlist_id,
                        ],
                    )

            updated_playlist = self.get_playlist_by_id(playlist_id)
            if updated_playlist is None:
                raise Exception("Failed to update playlist")
            return updated_playlist

        except Exception as e:
            print(f"Error updating playlist: {str(e)}")
            raise HTTPException(status_code=500, detail=str(e))


    def create_playlist_song(self, playlist_id, song_id):
        try:
            with pool.connection() as conn:
                with conn.cursor() as db:
                    db.execute(
                        """
                        INSERT INTO playlist_songs (playlist_id, song_id)
                        VALUES (%s, %s)
                        """,
                        [playlist_id, song_id],
                    )
                    return True
        except Exception as e:
            print(f"Error creating playlist song: {e}")
            return False

    async def search_for_songs(self, title: str):
        try:
            with pool.connection() as conn:
                with conn.cursor() as db:
                    db.execute(
                        """
                        SELECT id, title FROM songs WHERE title LIKE %s
                        """,
                        [f"%{title}%"],
                    )
                    songs = db.fetchall()
            return songs
        except Exception as e:
            print(f"Error searching for songs: {e}")
            raise HTTPException(
                status_code=500, detail="Internal server error."
            )

    async def add_song_to_playlist(self, playlist_id: int, song_id: int):
        try:
            with pool.connection() as conn:
                with conn.cursor() as db:
                    db.execute(
                        """
                        INSERT INTO playlist_songs (playlist_id, song_id)
                        VALUES (%s, %s);
                        """,
                        [playlist_id, song_id],
                    )

                    db.execute(
                        """
                        SELECT * FROM songs WHERE id = %s;
                        """,
                        [song_id],
                    )
                    row = db.fetchone()
                    if row is None:
                        raise Exception("Song not found")

                    added_song = {
                        "id": row[0],
                        "title": row[2],
                        "artist": row[3],
                        "music_file": row[4],
                        "cover": row[5],
                        "duration": row[6],
                    }

            return added_song
        except Exception as e:
            print(f"Error adding song to playlist: {e}")
            return False

    async def check_song_in_playlist(self, playlist_id: int, song_id: int) -> bool:
        try:
            with pool.connection() as conn:
                with conn.cursor() as db:
                    db.execute(
                        """
                        SELECT * FROM playlist_songs
                        WHERE playlist_id = %s AND song_id = %s;
                        """,
                        [playlist_id, song_id],
                    )
                    song_in_playlist = db.fetchone()

            return bool(song_in_playlist)
        except Exception as e:
            print(f"Error checking if song is in playlist: {e}")
            return False
