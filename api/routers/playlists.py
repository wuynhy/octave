<<<<<<< HEAD
from urllib import response
=======
>>>>>>> 16f57d8a00c8922b5068c9d5f612641e0144a98b
from fastapi import (
    Depends,
    HTTPException,
    status,
    Response,
    APIRouter,
    Form,
    File,
<<<<<<< HEAD
    UploadFile
)
from typing import List, Union, Optional
from pydantic import BaseModel
=======
    UploadFile,
)
from typing import List, Union, Optional
>>>>>>> 16f57d8a00c8922b5068c9d5f612641e0144a98b
from queries.playlists import (
    PlaylistIn,
    PlaylistOut,
    PlaylistRepository,
    Error,
<<<<<<< HEAD

)

router = APIRouter()
=======
)
from authenticator import authenticator

router = APIRouter()
repo = PlaylistRepository()
>>>>>>> 16f57d8a00c8922b5068c9d5f612641e0144a98b


@router.post("/playlists", response_model=PlaylistOut)
async def create_playlist(
<<<<<<< HEAD
    user_id: int = Form(...),
    name: str = Form(...),
    description: str = Form(...),
    cover: UploadFile = File(None),
    songs: Optional[str] = Form(None),
    repo: PlaylistRepository = Depends(PlaylistRepository),
):



=======
    name: str = Form(...),
    description: str = Form(...),
    cover: UploadFile = File(...),
    songs: Optional[str] = Form(None),
    user_data: dict = Depends(authenticator.get_current_account_data),
):
    user_id = user_data["id"]
>>>>>>> 16f57d8a00c8922b5068c9d5f612641e0144a98b
    try:
        playlist = PlaylistIn(
            name=name,
            user_id=user_id,
            description=description,
<<<<<<< HEAD
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
=======
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
>>>>>>> 16f57d8a00c8922b5068c9d5f612641e0144a98b
    return repo.get_all_playlists()


@router.get("/playlists/{playlist_id}", response_model=Optional[PlaylistOut])
def get_playlist_by_id(
    playlist_id: int,
    response: Response,
<<<<<<< HEAD
    repo: PlaylistRepository = Depends(),
=======
>>>>>>> 16f57d8a00c8922b5068c9d5f612641e0144a98b
):
    playlist = repo.get_playlist_by_id(playlist_id)
    if playlist is None:
        response.status_code = status.HTTP_404_NOT_FOUND
    return playlist


@router.put("/playlists/{playlist_id}", response_model=PlaylistOut)
async def update_playlist(
<<<<<<< HEAD
    user_id: int,
=======
>>>>>>> 16f57d8a00c8922b5068c9d5f612641e0144a98b
    playlist_id: int,
    name: str = Form(...),
    description: str = Form(...),
    cover: UploadFile = File(None),
    songs: Optional[str] = Form(None),
<<<<<<< HEAD
    repo: PlaylistRepository = Depends(PlaylistRepository),
):
=======
    user_data: dict = Depends(authenticator.get_current_account_data),
):
    user_id = user_data["id"]

>>>>>>> 16f57d8a00c8922b5068c9d5f612641e0144a98b
    try:
        existing_playlist = repo.get_playlist_by_id(playlist_id)
        if existing_playlist is None:
            raise HTTPException(status_code=404, detail="Playlist not found")

<<<<<<< HEAD
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
=======
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
>>>>>>> 16f57d8a00c8922b5068c9d5f612641e0144a98b
