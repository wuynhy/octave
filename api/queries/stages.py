from typing import Optional, Union, List
from .pool import pool
from pydantic import BaseModel, validator
import os
from botocore.exceptions import NoCredentialsError
import boto3
from fastapi import UploadFile, HTTPException
import uuid


class Error(BaseModel):
    message: str


class Stagein(BaseModel):
    name: str
    host_id: int
    genres: Optional[List[str]] = []
    participants: Optional[List[str]] = []
    playlists: Optional[List[str]] = []
    cover: UploadFile

    @validator("cover")
    def validate_cover(cls, file):
        if not file.filename.lower().endswith((".jpg", ".jpeg", ".png")):
            raise ValueError(
                "Only JPG, JPEG, and PNG files are allowed for the cover art."
            )
        return file


class StageOut(BaseModel):
    id: int
    name: str
    host: str
    cover_url: str
    genres: Optional[List[str]]
    participants: Optional[List[str]]
    playlists: Optional[List[str]]


class StageRepository:
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

    def get_one(self, stage_id: int) -> Optional[StageOut]:
        try:
            with pool.connection() as conn:
                with conn.cursor() as db:
                    db.execute(
                        """
                        SELECT
                            s.id,
                            s.name,
                            u.username as host,
                            STRING_AGG(DISTINCT g.name, ',') as genres,
                            STRING_AGG(DISTINCT u2.username, ',') as participants,
                            STRING_AGG(DISTINCT l.name, ',') as playlists,
                            s.cover
                        FROM stages s
                        LEFT JOIN stage_genres sg ON s.id = sg.stage_id
                        LEFT JOIN genres g ON sg.genre_id = g.id
                        LEFT JOIN stage_participants sp ON s.id = sp.stage_id
                        LEFT JOIN users u2 ON sp.participant_id = u2.id
                        LEFT JOIN stage_playlists sl ON s.id = sl.stage_id
                        LEFT JOIN playlists l ON sl.playlist_id = l.id
                        LEFT JOIN users u ON s.host_id = u.id
                        WHERE s.id = %s
                        GROUP BY s.id, u.username
                        """,
                        [stage_id],
                    )
                    record = db.fetchone()
                    if record is None:
                        return None

                    return StageOut(
                        id=record[0],
                        name=record[1],
                        host=record[2],
                        genres=record[3].split(", ") if record[3] else [],
                        participants=record[4].split(", ")
                        if record[4]
                        else [],
                        playlists=record[5].split(", ") if record[5] else [],
                        cover_url=record[6],
                    )
        except Exception as e:
            raise Exception("Could not get the specific stage: " + str(e))

    def get_all(self) -> List[StageOut]:
        try:
            with pool.connection() as conn:
                with conn.cursor() as db:
                    db.execute(
                        """
                        SELECT
                            s.id,
                            s.name,
                            u.username as host,
                            s.cover,
                            STRING_AGG(DISTINCT g.name, ',') as genres,
                            STRING_AGG(DISTINCT u2.username, ',') as participants,
                            STRING_AGG(DISTINCT l.name, ',') as playlists
                        FROM stages s
                        LEFT JOIN stage_genres sg ON s.id = sg.stage_id
                        LEFT JOIN genres g ON sg.genre_id = g.id
                        LEFT JOIN stage_participants sp ON s.id = sp.stage_id
                        LEFT JOIN users u2 ON sp.participant_id = u2.id
                        LEFT JOIN stage_playlists sl ON s.id = sl.stage_id
                        LEFT JOIN playlists l ON sl.playlist_id = l.id
                        LEFT JOIN users u ON s.host_id = u.id
                        GROUP BY s.id, u.username
                        ORDER BY s.id
                        """
                    )
                    records = db.fetchall()
                    if len(records) == 0:
                        return []

                    stages = [
                        StageOut(
                            id=record[0],
                            name=record[1],
                            host=record[2],
                            cover_url=record[3],
                            genres=record[4].split(", ") if record[4] else [],
                            participants=record[5].split(", ")
                            if record[5]
                            else [],
                            playlists=record[6].split(", ")
                            if record[6]
                            else [],
                        )
                        for record in records
                    ]
        except Exception as e:
            print(f"Error fetching stages: {e}")
            return []

        return stages

    async def create_stage(self, host_id: int, stage: Stagein):
        try:
            if stage.cover.filename is not None:
                cover_key_name = os.path.basename(stage.cover.filename)
                cover_key_name = cover_key_name.replace(" ", "-")
                cover_key_name = f"{cover_key_name}-{uuid.uuid4().hex}"
                temp_cover_file = stage.cover
            else:
                raise ValueError("Cover file not found")
            cover_file = f"https://{self.bucket_name}.s3.{self.region_name}.amazonaws.com/{cover_key_name}"
            with pool.connection() as conn:
                with conn.cursor() as db:
                    db.execute(
                        """
                        SELECT id FROM users WHERE id = %s;
                        """,
                        [host_id],
                    )
                    db.execute(
                        """
                        INSERT INTO stages(name, host_id, cover)
                        VALUES(%s, %s, %s)
                        RETURNING id;
                        """,
                        [
                            stage.name,
                            host_id,
                            cover_file,
                        ],
                    )
                    result = db.fetchone()
                    if result is not None:
                        stage_id = result[0]
                    else:
                        raise ValueError("Failed to create song")
                    if stage.genres is not None:
                        for genre in stage.genres:
                            db.execute(
                                """
                                INSERT INTO stage_genres(stage_id, genre_id)
                                VALUES(%s, (SELECT id FROM genres WHERE name = %s));
                                """,
                                [stage_id, genre],
                            )
                    if stage.participants is not None:
                        for participant in stage.participants:
                            db.execute(
                                """
                                INSERT INTO stage_participants(stage_id, participant_id)
                                VALUES(%s, (SELECT id FROM participants WHERE name = %s));
                                """,
                                [stage_id, participant],
                            )
                    if stage.playlists is not None:
                        for playlist in stage.playlists:
                            db.execute(
                                """
                                INSERT INTO stage_playlists(stage_id, playlist_id)
                                VALUES(%s, (SELECT id FROM playlists WHERE name = %s));
                                """,
                                [stage_id, playlist],
                            )

            await self.upload_to_s3(
                temp_cover_file, self.bucket_name, cover_key_name
            )
            return self.get_one(stage_id)
        except Exception as e:
            print(f"Error creating stage: {e}")
            return None

    async def upload_to_s3(self, file_name, bucket, object_name=None):
        if object_name is None:
            object_name = os.path.basename(file_name.filename)
            object_name = object_name.replace(" ", "-")

        temp = f"/tmp/{object_name}"
        with open(temp, "wb") as f:
            f.write(await file_name.read())

        try:
            self.s3_client.upload_file(temp, bucket, object_name)
            print("Upload Successful")
            return True
        except NoCredentialsError:
            print("Credentials not available")
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

    def create_stage_genre(self, stage_id, genre_id):
        try:
            with pool.connection() as conn:
                with conn.cursor() as db:
                    db.execute(
                        """
                        INSERT INTO stage_genres(stage_id, genre_id)
                        VALUES(%s, %s);
                        """,
                        [stage_id, genre_id],
                    )
                    return True

        except Exception as e:
            print(f"Error creating stage genre: {e}")
            return False

    def create_stage_participant(self, stage_id, participant_id):
        try:
            with pool.connection() as conn:
                with conn.cursor() as db:
                    db.execute(
                        """
                        INSERT INTO stage_participants(stage_id, participant_id)
                        VALUES(%s, %s);
                        """,
                        [stage_id, participant_id],
                    )
                    return True

        except Exception as e:
            print(f"Error creating stage participant: {e}")
            return False

    def create_stage_playlist(self, stage_id, playlist_id):
        try:
            with pool.connection() as conn:
                with conn.cursor() as db:
                    db.execute(
                        """
                        INSERT INTO stage_playlists(stage_id, playlist_id)
                        VALUES(%s, %s);
                        """,
                        [stage_id, playlist_id],
                    )
                    return True

        except Exception as e:
            print(f"Error creating stage playlist: {e}")
            return False

    async def update(
        self, host_id: int, stage_id: int, stage: Stagein
    ) -> Union[Error, StageOut]:
        try:
            existing_stage = self.get_one(stage_id)
            if existing_stage is None:
                return Error(message="Stage not found")
            if (
                stage.cover
                and stage.cover.filename != existing_stage.cover_url
            ):
                stage_cover_key = existing_stage.cover_url.split("/")[-1]
                try:
                    self.delete_from_s3(stage_cover_key)
                except Exception:
                    raise HTTPException(
                        status_code=500,
                        detail=f"Failed to delete cover from S3: {3}",
                    )
                file_name = stage.cover
                key_name = f"{stage.name.replace(' ', '-')}-cover-{file_name.filename}-{uuid.uuid4().hex}"
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
                s3_cover = existing_stage.cover_url
            with pool.connection() as conn:
                with conn.cursor() as db:
                    db.execute(
                        """
                            UPDATE stages
                            SET name = %s, host_id = %s, cover = %s
                            WHERE id = %s
                            """,
                        [stage.name, stage.host_id, s3_cover, stage_id],
                    )
                    if stage.genres is not None:
                        db.execute(
                            """
                                DELETE FROM stage_genres
                                WHERE stage_id = %s
                            """,
                            [stage_id],
                        )
                        for genre in stage.genres:
                            db.execute(
                                """
                                    INSERT INTO stage_genres (stage_id, genre_id)
                                    VALUES (%s, (SELECT id FROM genres WHERE name = %s));
                                """,
                                [stage_id, genre],
                            )
                    if stage.participants is not None:
                        db.execute(
                            """
                                DELETE FROM stage_participants
                                WHERE stage_id = %s
                            """,
                            [stage_id],
                        )
                        for participant in stage.participants:
                            db.execute(
                                """
                                    INSERT INTO stage_participants (stage_id, participant_id)
                                    VALUES (%s, (SELECT id FROM users WHERE name = %s));
                                """,
                                [stage_id, participant],
                            )
                    if stage.playlists is not None:
                        db.execute(
                            """
                                DELETE FROM stage_playlists
                                WHERE stage_id = %s
                            """,
                            [stage_id],
                        )
                        for playlist in stage.playlists:
                            db.execute(
                                """
                                    INSERT INTO stage_playlists (stage_id, playlist_id)
                                    VALUES (%s, (SELECT id FROM playlists WHERE name = %s));
                                """,
                                [stage_id, playlist],
                            )
            updated_stage = self.get_one(stage_id)
            if updated_stage is None:
                return Error(message="Stage is nowhere")
            return updated_stage
        except Exception as e:
            print(f"Error updating stage: {e}")
            raise HTTPException(
                status_code=500, detail="Failed to update stage"
            )

    def delete(self, stage_id):
        try:
            existing_stage = self.get_one(stage_id)
            if existing_stage is None:
                return False
            existing_cover_key = existing_stage.cover_url.split("/")[-1]
            self.delete_from_s3(existing_cover_key)
            with pool.connection() as conn:
                with conn.cursor() as db:
                    db.execute(
                        """
                        DELETE FROM stages
                        WHERE id = %s
                        """,
                        [stage_id],
                    )
                    return True
        except Exception as e:
            print(f"Error deleteing stage: {e}")
            return False

    def remove_participant(self, stage_id: int, participant_id: int):
        try:
            with pool.connection() as conn:
                with conn.cursor() as db:
                    db.execute(
                        """
                        DELETE FROM stage_participants
                        WHERE stage_id = %s AND participant_id = %s
                        """,
                        [stage_id, participant_id],
                    )
                    return True
        except Exception as e:
            print(f"Error removing participant: {e}")
            return False

    def get_stages_by_participant(self, participant_id: int):
        try:
            with pool.connection() as conn:
                with conn.cursor() as db:
                    db.execute(
                        """
                        SELECT stages.id, stages.name, stages.host_id, stage_participants.participant_id
                        FROM stages
                        JOIN stage_participants ON stages.id = stage_participants.stage_id
                        WHERE stage_participants.participant_id = %s
                        """,
                        [participant_id],
                    )
                    results = db.fetchall()
                    stages = []
                    for row in results:
                        stage = {
                            "id": row[0],
                            "name": row[1],
                            "host_id": row[2],
                        }
                        stages.append(stage)
                    return stages
        except Exception as e:
            print(f"Error retrieving stages by participant: {e}")
            return []

    def get_stages_by_host(self, host_id: int):
        try:
            with pool.connection() as conn:
                with conn.cursor() as db:
                    db.execute(
                        """
                        SELECT id, name, host_id
                        FROM stages
                        WHERE host_id = %s
                        """,
                        [host_id],
                    )
                    results = db.fetchall()
                    stages = []
                    for row in results:
                        stage = {
                            "id": row[0],
                            "name": row[1],
                            "host_id": row[2],
                        }
                        stages.append(stage)
                    return stages
        except Exception as e:
            print(f"Error retrieving stages by host: {e}")
            return []
