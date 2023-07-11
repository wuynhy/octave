from fastapi import APIRouter, Depends, Response
from typing import List, Optional
from queries.genres import (
    GenreRepository,
    GenreOut,
)


router = APIRouter()


@router.get("/genres/{genre_id}", response_model=Optional[GenreOut])
def get_one_genre(
    genre_id: int,
    response: Response,
    repo: GenreRepository = Depends(),
) -> GenreOut:
    genre = repo.get_one(genre_id)
    if genre is None:
        response.status_code = 404
    return genre


@router.get("/genres", response_model=List[GenreOut])
def get_all(
    repo: GenreRepository = Depends(),
):
    return repo.get_all()
