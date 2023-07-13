from fastapi import (
    FastAPI,
    APIRouter,
    HTTPException,
    File,
    UploadFile,
    Form,
    Depends,
)
from typing import List, Union, Optional
from queries.songs import SongIn, SongOut, SongRepository, Error
from typing import List

router = APIRouter()
app = FastAPI()
repository = SongRepository()


@router.get("/songs/{song_id}", response_model=SongOut)
async def get_song(song_id: int):
    song = repository.get(song_id)
    if song is None:
        raise HTTPException(status_code=404, detail="Song not found")
    return song


@router.get("/songs", response_model=List[SongOut])
async def get_all_songs():
    songs = repository.get_all()
    return songs


@router.post("/songs", response_model=SongOut)
async def create_song(
    title: str = Form(...),
    artist: str = Form(...),
    music_file: UploadFile = File(...),
    cover: UploadFile = File(...),
    genres: Optional[str] = Form(None),
):
    song_in = SongIn(
        title=title, artist=artist, music_file=music_file, cover=cover
    )
    created_song = await repository.create(song_in)
    if created_song is None:
        raise HTTPException(status_code=500, detail="Failed to create song")

    if genres is not None:
        genre_ids = [int(id) for id in genres.split(",")]
        for genre_id in genre_ids:
            success = repository.create_song_genre(
                song_id=created_song.id, genre_id=genre_id
            )
            if not success:
                raise HTTPException(
                    status_code=500, detail="Failed to add genres to song"
                )

    return created_song


@router.put("/songs/{song_id}", response_model=Union[SongOut, Error])
async def update_song(
    song_id: int,
    title: str = Form(...),
    artist: str = Form(...),
    music_file: UploadFile = File(...),
    cover: UploadFile = File(...),
    genres: Optional[str] = Form(None),
    repository: SongRepository = Depends(SongRepository),
):
    song = repository.get(song_id)
    if song is None:
        raise HTTPException(status_code=404, detail="Song not found")

    song_in = SongIn(
        title=title, artist=artist, music_file=music_file, cover=cover
    )
    updated_song = await repository.update(song_id, song_in)
    if isinstance(updated_song, Error):
        raise HTTPException(status_code=500, detail="Failed to update song")

    if genres is not None:
        genre_ids = [int(id) for id in genres.split(",")]
        repository.delete_song_genre(song_id)
        for genre_id in genre_ids:
            success = repository.create_song_genre(
                song_id=updated_song.id, genre_id=genre_id
            )
            if not success:
                raise HTTPException(
                    status_code=500, detail="Failed to add genres to song"
                )

    return updated_song


@router.delete("/songs/{song_id}")
async def delete_song(song_id: int):
    success = repository.delete(song_id)
    if not success:
        raise HTTPException(status_code=404, detail="Song not found")
    repository.delete_song_genre(song_id)
    return {"message": "Song deleted successfully"}
