from urllib import response
from fastapi import (
    Depends,
    HTTPException,
    status,
    Response,
    APIRouter,
    Form,
    File,
    UploadFile
)
from typing import List, Union, Optional
from pydantic import BaseModel
from queries.playlists import (
    PlaylistIn,
    PlaylistOut,
    PlaylistRepository,
    Error,

)

router = APIRouter()


@router.post("/playlists", response_model=PlaylistOut)
async def create_playlist(
    user_id: int = Form(...),
    name: str = Form(...),
    description: str = Form(...),
    cover: UploadFile = File(None),
    songs: Optional[str] = Form(None),
    repo: PlaylistRepository = Depends(PlaylistRepository),
):
    print(type(cover))  # should print <class 'fastapi.datastructures.UploadFile'>
    print(cover)  # should print an UploadFile object


    try:
        playlist = PlaylistIn(
            name=name,
            user_id=user_id,
            description=description,
            owner=None,
            cover=cover,
            songs=songs.split(",") if songs else [],
        )

        created_playlist = await repo.create_playlist(user_id, playlist)
        if created_playlist is not None:
            response.status_code = status.HTTP_201_CREATED
            return created_playlist
        else:
            raise HTTPException(status_code=500, detail="Failed to create playlist")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/playlists", response_model=Union[List[PlaylistOut], Error])
def get_all_playlists(
    repo: PlaylistRepository = Depends(),
):
    return repo.get_all_playlists()


@router.get("/playlists/{playlist_id}", response_model=Optional[PlaylistOut])
def get_playlist_by_id(
    playlist_id: int,
    response: Response,
    repo: PlaylistRepository = Depends(),
):
    playlist = repo.get_playlist_by_id(playlist_id)
    if playlist is None:
        response.status_code = status.HTTP_404_NOT_FOUND
    return playlist


@router.put("/playlists/{playlist_id}", response_model=PlaylistOut)
async def update_playlist(
    user_id: int,
    playlist_id: int,
    name: str = Form(...),
    description: str = Form(...),
    cover: UploadFile = File(None),
    songs: Optional[str] = Form(None),
    repo: PlaylistRepository = Depends(PlaylistRepository),
):
    try:
        existing_playlist = repo.get_playlist_by_id(playlist_id)
        if existing_playlist is None:
            raise HTTPException(status_code=404, detail="Playlist not found")

        playlist_data = {
            "user_id": user_id,
            "name": name,
            "description": description,
            "cover": cover,
            "songs": songs.split(",") if songs else [],
        }


        playlist = PlaylistIn(**playlist_data)

        updated_playlist = await repo.update_playlist(user_id, playlist_id, playlist)
        if updated_playlist is None:
            raise HTTPException(status_code=500, detail="Failed to update playlist")

        return updated_playlist

    except Exception as e:
        print(f"Error updating playlist: {e}")
        raise HTTPException(status_code=500, detail="Failed to update playlist")


@router.delete("/playlists/{playlist_id}", response_model=bool)
def delete_playlist(
    playlist_id: int,
    repo: PlaylistRepository = Depends(),
) -> bool:
    return repo.delete_playlist(playlist_id)
