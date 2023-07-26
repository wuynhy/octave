from fastapi import (
    Depends,
    HTTPException,
    status,
    Response,
    APIRouter,
    Form,
    File,
    UploadFile,
)
from typing import List, Union, Optional
from queries.playlists import (
    PlaylistIn,
    PlaylistOut,
    PlaylistRepository,
    Error,
)

from authenticator import authenticator

router = APIRouter()

repo = PlaylistRepository()


@router.post("/playlists", response_model=PlaylistOut)
async def create_playlist(
    name: str = Form(...),
    description: str = Form(...),
    cover: UploadFile = File(...),
    songs: Optional[str] = Form(None),
    user_data: dict = Depends(authenticator.get_current_account_data),
):
    user_id = user_data["id"]
    try:
        playlist = PlaylistIn(
            name=name,
            user_id=user_id,
            description=description,
            cover=cover,
        )

        created_playlist = await repo.create_playlist(user_id, playlist)
        if created_playlist is None:
            raise HTTPException(
                status_code=500, detail="Failed to create playlist"
            )
        if songs:
            song_ids = [int(id) for id in songs.split(",")]
            for song_id in song_ids:
                success = repo.create_playlist_song(
                    playlist_id=created_playlist.id, song_id=song_id
                )
                if not success:
                    raise HTTPException(
                        status_code=500,
                        detail="Failed to add songs to playlist",
                    )

        return created_playlist

    except Exception as e:
        print(f"Error creating playlist: {e}")
        raise HTTPException(
            status_code=500, detail="Failed to create playlist"
        )


@router.get("/playlists", response_model=Union[List[PlaylistOut], Error])
def get_all_playlists():
    return repo.get_all_playlists()


@router.get("/playlists/{playlist_id}", response_model=Optional[PlaylistOut])
def get_playlist_by_id(
    playlist_id: int,
    response: Response,
):
    playlist = repo.get_playlist_by_id(playlist_id)
    if playlist is None:
        response.status_code = status.HTTP_404_NOT_FOUND
    return playlist


@router.put("/playlists/{playlist_id}", response_model=PlaylistOut)
async def update_playlist(
    playlist_id: int,
    name: str = Form(...),
    description: str = Form(...),
    cover: UploadFile = File(None),
    songs: Optional[str] = Form(None),
    user_data: dict = Depends(authenticator.get_current_account_data),
):
    user_id = user_data["id"]

    try:
        existing_playlist = repo.get_playlist_by_id(playlist_id)
        if existing_playlist is None:
            raise HTTPException(status_code=404, detail="Playlist not found")

        playlist_data = PlaylistIn(
            name=name,
            user_id=user_id,
            description=description,
            cover=cover,
        )

        update_playlist = await repo.update_playlist(
            user_id, playlist_id, playlist_data
        )
        if isinstance(update_playlist, Error):
            raise HTTPException(
                status_code=500, detail="Failed to update playlist"
            )
        if songs:
            song_ids = [int(id) for id in songs.split(",")]
            for song_id in song_ids:
                success = repo.create_playlist_song(
                    playlist_id=playlist_id, song_id=song_id
                )
                if not success:
                    raise HTTPException(
                        status_code=500,
                        detail="Failed to add songs to playlist",
                    )
        return update_playlist
    except Exception as e:
        print(f"Error updating playlist: {e}")
        raise HTTPException(
            status_code=500, detail=f"Failed to update playlist + {e}"
        )


@router.delete("/playlists/{playlist_id}")
def delete_playlist(
    playlist_id: int,
    user_data: dict = Depends(authenticator.get_current_account_data),
):
    owner = user_data["username"]
    playlist = repo.get_playlist_by_id(playlist_id)
    if playlist is None:
        raise HTTPException(status_code=404, detail="Playlist not found")
    if playlist.owner != owner:
        raise HTTPException(
            status_code=403, detail="Only owner can delete this playlist"
        )
    delete = repo.delete_playlist(playlist_id)
    if not delete:
        raise HTTPException(
            status_code=500, detail="Failed to delete playlist"
        )
    return {"deleted": "success"}


@router.get("/songs/search/{title}")
async def search_songs(title: str):
    try:
        results = await repo.search_for_songs(title)
        if not results:
            raise HTTPException(status_code=404, detail="Song not found")
        return {"songs": results}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/playlists/{playlist_id}/add_song/{song_id}")
async def add_song_to_playlist(playlist_id: int, song_id: int):

    existing_song = await repo.check_song_in_playlist(playlist_id, song_id)
    if existing_song:

        raise HTTPException(status_code=400, detail="Song already exists in the playlist.")

    success = await repo.add_song_to_playlist(playlist_id, song_id)
    if not success:
        raise HTTPException(status_code=500, detail="Internal server error.")
    return success
