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
            # connect the database
            with pool.connection() as conn:
                # get a cursor (something to run SQL with)
                with conn.cursor() as db:
                    # Run our SELECT statement
                    result = db.execute(
                        """
                        SELECT id
                             , name
                        FROM genres
                        WHERE id = %s
                        """,
                        [genre_id]
                    )
                    record = result.fetchone()
                    if record is None:
                        return None
                    return self.record_to_genre_out(record)
        except Exception as e:
            print(e)
            return {"message": "Could not get that genre"}
        
    def get_all(self) -> List[GenreOut]:
        try:
            # connect the database
            with pool.connection() as conn:
                # get a cursor (something to run SQL with)
                with conn.cursor() as db:
                    # Run our SELECT statement
                    result = db.execute(
                        """
                        SELECT id, name
                        FROM genres
                        ORDER BY id;
                        """
                    )
                    return [
                        self.record_to_genre_out(record)
                        for record in result
                    ]
        except Exception as e:
            print(e)
            return {"message": "Could not get all genres"}
        
            
