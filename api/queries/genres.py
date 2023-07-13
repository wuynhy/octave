from pydantic import BaseModel
from typing import List, Optional
from .pool import pool


class GenreOut(BaseModel):
    id: int
    name: str


class GenreRepository:
    def record_to_genre_out(self, record):
        return GenreOut(
            id=record[0],
            name=record[1],
        )

    def get_one(self, genre_id: int) -> Optional[GenreOut]:
        try:
            with pool.connection() as conn:
                with conn.cursor() as db:
                    result = db.execute(
                        """
                        SELECT id
                             , name
                        FROM genres
                        WHERE id = %s
                        """,
                        [genre_id],
                    )
                    record = result.fetchone()
                    if record is None:
                        return None
                    return self.record_to_genre_out(record)
        except Exception as e:
            raise Exception("Could not get the specific genre" + str(e))

    def get_all(self) -> List[GenreOut]:
        try:
            with pool.connection() as conn:
                with conn.cursor() as db:
                    result = db.execute(
                        """
                        SELECT id, name
                        FROM genres
                        ORDER BY id;
                        """
                    )
                    return [
                        self.record_to_genre_out(record) for record in result
                    ]
        except Exception as e:
            raise Exception("Could not get all genres" + str(e))
