import os
from typing import Optional, Union, List
import boto3
import uuid
from botocore.exceptions import NoCredentialsError
import mutagen.mp3
from .pool import pool
from pydantic import BaseModel, validator
from fastapi import UploadFile, HTTPException


class Error(BaseModel):
    message: str


class SongIn(BaseModel):
    uploader: int
    title: str
    artist: str
    music_file: UploadFile
    cover: UploadFile
    genres: Optional[List[str]] = []

    @validator("music_file")
    def validate_music_file(cls, file):
        if not file.filename.lower().endswith(".mp3"):
            raise ValueError("Only MP3 files are allowed.")
        return file

    @validator("cover")
    def validate_cover(cls, file):
        if not file.filename.lower().endswith((".jpg", ".jpeg", ".png")):
            raise ValueError(
                "Only JPG, JPEG, and PNG files are allowed for the cover art."
            )
        return file


class SongOut(BaseModel):
    id: int
    uploader: str
    title: str
    artist: str
    music_file_url: str
    cover_url: str
    duration: int
    genres: Optional[List[str]]


class SongRepository:
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

    def calculate_duration(self, file_path):
        audio = mutagen.mp3.MP3(file_path)
        duration_seconds = int(audio.info.length)
        return duration_seconds

    async def upload_to_s3(self, file_name, bucket, object_name=None):
        if object_name is None:
            object_name = os.path.basename(file_name.filename)
            object_name = object_name.replace(" ", "-")

        temp = f"/tmp/{object_name}"
        with open(temp, "wb") as f:
            f.write(await file_name.read())

        try:
            response = self.s3_client.upload_file(
                temp, bucket, object_name
            )
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

    def record_to_song_out(self, record: dict, genres: List[str] = []) -> SongOut:
        return SongOut(
            id=record["id"],
            uploader=record["uploader"],
            title=record["title"],
            artist=record["artist"],
            music_file_url=record["music_file"],
            cover_url=record["cover"],
            duration=record["duration"],
            genres=genres
        )

    async def create(self, uploader: int, song: SongIn) -> Optional[SongOut]:
        try:
            if song.music_file.filename is not None:
                key_name = os.path.basename(song.music_file.filename)
                key_name = key_name.replace(" ", "-")
                key_name = f"{key_name}-{uuid.uuid4().hex}"
                temp_file = song.music_file
            else:
                raise ValueError("Music file not found")

            if song.cover.filename is not None:
                cover_key_name = os.path.basename(song.cover.filename)
                cover_key_name = cover_key_name.replace(" ", "-")
                cover_key_name = f"{cover_key_name}-{uuid.uuid4().hex}"
                temp_cover_file = song.cover
            else:
                raise ValueError("Cover file not found")

            music_file = f"https://{self.bucket_name}.s3.{self.region_name}.amazonaws.com/{key_name}"
            cover_file = f"https://{self.bucket_name}.s3.{self.region_name}.amazonaws.com/{cover_key_name}"

            duration_seconds = self.calculate_duration(temp_file.file)

            with pool.connection() as conn:
                with conn.cursor() as db:
                    db.execute(
                        """
                        SELECT id FROM users WHERE id = %s;
                        """,
                        [uploader],
                    )
                    db.execute(
                        """
                        INSERT INTO songs (uploader, title, artist, music_file, cover, duration)
                        VALUES (%s, %s, %s, %s, %s, %s)
                        RETURNING id;
                        """,
                        [
                            uploader,
                            song.title,
                            song.artist,
                            music_file,
                            cover_file,
                            duration_seconds,
                        ],
                    )
                    result = db.fetchone()
                    if result is not None:
                        song_id = result[0]
                    else:
                        raise ValueError("Failed to create song")
                        
                    if song.genres is not None:
                        for genre in song.genres:
                            db.execute(
                                """
                                INSERT INTO song_genres (song_id, genre_id)
                                VALUES (%s, (SELECT id FROM genres WHERE name = %s));
                                """,
                                [song_id, genre],
                            )

            await self.upload_to_s3(temp_file, self.bucket_name, key_name)
            await self.upload_to_s3(temp_cover_file, self.bucket_name, cover_key_name)
            
            return self.get(song_id)
        except Exception as e:
            print(f"Error creating song: {e}")
            return None

    async def update(
        self, uploader: int, song_id: int, song: SongIn
    ) -> Union[Error, SongOut]:
        try:
            existing_song = self.get(song_id)
            if existing_song is None:
                return Error(message="Song not found")

            if (
                song.music_file
                and song.music_file.filename != existing_song.music_file_url
            ):
                existing_song_key = existing_song.music_file_url.split("/")[-1]
                try:
                    self.delete_from_s3(existing_song_key)
                except Exception as e:
                    raise HTTPException(
                        status_code=500,
                        detail=f"Failed to delete song from S3: {e}",
                    )

                file_name = song.music_file
                key_name = f"{song.title.replace(' ', '-')}-{file_name.filename}-{uuid.uuid4().hex}"
                try:
                    await self.upload_to_s3(
                        file_name, self.bucket_name, key_name
                    )
                except Exception as e:
                    raise HTTPException(
                        status_code=500,
                        detail=f"Failed to upload song to S3: {e}",
                    )

                s3_file = f"https://{self.bucket_name}.s3.{self.region_name}.amazonaws.com/{key_name}"
                duration_seconds = self.calculate_duration(
                    song.music_file.file
                )
            else:
                s3_file = existing_song.music_file_url
                duration_seconds = existing_song.duration

            if song.cover and song.cover.filename != existing_song.cover_url:
                existing_cover_key = existing_song.cover_url.split("/")[-1]
                try:
                    self.delete_from_s3(existing_cover_key)
                except Exception as e:
                    raise HTTPException(
                        status_code=500,
                        detail=f"Failed to delete cover from S3: {e}",
                    )

                file_name = song.cover
                key_name = f"{song.title.replace(' ', '-')}-cover-{file_name.filename}-{uuid.uuid4().hex}"
                try:
                    await self.upload_to_s3(
                        file_name, self.bucket_name, key_name
                    )
                except Exception as e:
                    raise HTTPException(
                        status_code=500,
                        detail=f"Failed to upload cover to S3: {e}",
                    )

                s3_cover = f"https://{self.bucket_name}.s3.{self.region_name}.amazonaws.com/{key_name}"
            else:
                s3_cover = existing_song.cover_url

            with pool.connection() as conn:
                with conn.cursor() as db:
                    db.execute(
                        """
                            UPDATE songs
                            SET  uploader = %s, title = %s, artist = %s, music_file = %s, cover = %s, duration = %s
                            WHERE id = %s
                            """,
                        [
                            song.uploader,
                            song.title,
                            song.artist,
                            s3_file,
                            s3_cover,
                            duration_seconds,
                            song_id,
                        ],
                    )

                    if song.genres is not None:
                        db.execute(
                            """
                                DELETE FROM song_genres
                                WHERE song_id = %s
                            """,
                            [song_id],
                        )

                        for genre in song.genres:
                            db.execute(
                                """
                                    INSERT INTO song_genres (song_id, genre_id)
                                    VALUES (%s, (SELECT id FROM genres WHERE name = %s));
                                """,
                                [song_id, genre],
                            )

            updated_song = self.get(song_id)
            if updated_song is None:
                return Error(message="Song not found")
            return updated_song
        except Exception as e:
            print(f"Error updating song: {e}")
            raise HTTPException(
                status_code=500, detail="Failed to update song"
            )

    def delete(self, song_id: int) -> bool:
        try:
            existing_song = self.get(song_id)

            if existing_song is None:
                return False
            existing_song_key = existing_song.music_file_url.split("/")[-1]
            existing_cover_key = existing_song.cover_url.split("/")[-1]

            self.delete_from_s3(existing_song_key)
            self.delete_from_s3(existing_cover_key)

            with pool.connection() as conn:
                with conn.cursor() as db:
                    db.execute(
                        """
                        DELETE FROM songs
                        WHERE id = %s;
                        """,
                        [song_id],
                    )
                    return True
        except Exception as e:
            print(f"Error deleting song: {e}")
            return False

    def get(self, song_id: int) -> Optional[SongOut]:
        try:
            with pool.connection() as conn:
                with conn.cursor() as db:
                    db.execute(
                        """
                        SELECT s.id, u.username as uploader, s.title, s.artist, s.music_file, s.cover, s.duration, string_agg(g.name, ', ')
                        FROM songs s
                        LEFT JOIN song_genres sg ON s.id = sg.song_id
                        LEFT JOIN genres g ON sg.genre_id = g.id
                        LEFT JOIN users u ON s.uploader = u.id
                        WHERE s.id = %s
                        GROUP BY s.id, u.username;
                        """,
                        [song_id],
                    )
                    record = db.fetchone()
                    if record is None:
                        return None
                    return SongOut(
                        id=record[0],
                        uploader=record[1],
                        title=record[2],
                        artist=record[3],
                        music_file_url=record[4],
                        cover_url=record[5],
                        duration=record[6],
                        genres=record[7].split(', ') if record[7] else []
                    )
        except Exception as e:
            print(f"Error getting song: {e}")
            return None

    def get_all(self) -> List[SongOut]:
        try:
            with pool.connection() as conn:
                with conn.cursor() as db:
                    db.execute(
                        """
                        SELECT s.id, u.username as uploader, s.title,s.artist, s.music_file, s.cover, s.duration, string_agg(g.name, ', ')
                        FROM songs s
                        LEFT JOIN song_genres sg ON s.id = sg.song_id
                        LEFT JOIN genres g ON sg.genre_id = g.id
                        LEFT JOIN users u ON s.uploader = u.id
                        GROUP BY s.id, u.username
                        ORDER BY s.id;
                        """
                    )
                    result = db.fetchall()
                    return [
                        SongOut(
                            id=record[0],
                            uploader=record[1],
                            title=record[2],
                            artist=record[3],
                            music_file_url=record[4],
                            cover_url=record[5],
                            duration=record[6],
                            genres=record[7].split(', ') if record[7] else []
                        )
                        for record in result
                    ]
        except Exception as e:
            print(f"Error getting all songs: {e}")
            raise Exception("Failed to get all songs")

    def create_song_genre(self, song_id, genre_id):
        try:
            with pool.connection() as conn:
                with conn.cursor() as db:
                    db.execute(
                        """
                        INSERT INTO song_genres (song_id, genre_id)
                        VALUES (%s, %s);
                        """,
                        [song_id, genre_id],
                    )
                    return True
        except Exception as e:
            print(f"Error adding song genre: {e}")
            return False
        
    
    def delete_song_genre(self, song_id: int) -> bool:
        try:
            with pool.connection() as conn:
                with conn.cursor() as db:
                    db.execute(
                        """
                        DELETE FROM song_genres
                        WHERE song_id = %s;
                        """,
                        [song_id],
                    )
                    return True
        except Exception as e:
            print(f"Error deleting song genre: {e}")
            return False