from fastapi import (
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
from authenticator import authenticator

router = APIRouter()
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
    user_data: dict = Depends(authenticator.get_current_account_data),
):
    try:
        uploader = user_data["id"]
        song_in = SongIn(
            uploader=uploader, title=title, artist=artist, music_file=music_file, cover=cover
        )
        created_song = await repository.create(uploader, song_in)
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
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.put("/songs/{song_id}", response_model=Union[SongOut, Error])
async def update_song(
    song_id: int,
    title: str = Form(...),
    artist: str = Form(...),
    music_file: UploadFile = File(...),
    cover: UploadFile = File(...),
    genres: Optional[str] = Form(None),
    repository: SongRepository = Depends(SongRepository),
    user_data: dict = Depends(authenticator.get_current_account_data),
):
    try:
        uploader = user_data["username"]
        song = repository.get(song_id)
        if song is None:
            raise HTTPException(status_code=404, detail="Song not found")
        if song.uploader != uploader:
            raise HTTPException(status_code=403, detail="You can't edit this song")
        song_in = SongIn(
        uploader=uploader, title=title, artist=artist, music_file=music_file, cover=cover
        )
        updated_song = await repository.update(uploader, song_id, song_in)
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
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.delete("/songs/{song_id}")
async def delete_song(
    song_id: int,
    user_data: dict = Depends(authenticator.get_current_account_data),
):
    try:
        uploader = user_data["username"]
        song = repository.get(song_id)
        if song is None:
            raise HTTPException(status_code=404, detail="Song not found")
        if song.uploader != uploader:
            raise HTTPException(status_code=403, detail="You can't delete this song")
        success = repository.delete(song_id)
        if not success:
            raise HTTPException(status_code=500, detail="Failed to delete song")
        return {"message": "Song deleted successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

