from fastapi import (
    APIRouter,
    Depends,
    HTTPException,
    Form,
    UploadFile,
    File,
)
from typing import List, Optional, Union
from queries.stages import Stagein, StageOut, StageRepository, Error
from authenticator import authenticator


router = APIRouter()
repository = StageRepository()


@router.get("/stages/{stage_id}", response_model=StageOut)
async def get_stage(stage_id: int):
    stage = repository.get_one(stage_id)
    if stage is None:
        raise HTTPException(status_code=404, detail="Stage not Found")
    return stage


@router.get("/stages", response_model=List[StageOut])
async def get_all_stages():
    stage = repository.get_all()
    return stage


@router.post("/stages", response_model=StageOut)
async def create_stage(
    name: str = Form(...),
    genres: Optional[str] = Form(None),
    participants: Optional[str] = Form(None),
    playlists: Optional[str] = Form(None),
    cover: UploadFile = File(...),
    user_data: dict = Depends(authenticator.get_current_account_data),
):
    try:
        host_id = user_data["id"]

        host_stages = repository.get_stages_by_host(host_id)
        if len(host_stages) != 0:
            raise HTTPException(
                status_code=403, detail="Host can only create one stage"
            )

        stage_in = Stagein(
            name=name,
            host_id=host_id,
            cover=cover,
        )

        created_stage = await repository.create_stage(host_id, stage_in)
        if created_stage is None:
            raise HTTPException(status_code=500, detail="Failed to create stage")

        if genres:
            try:
                genre_ids = [int(id) for id in genres.split(",")]
            except ValueError:
                raise HTTPException(
                    status_code=400,
                    detail="Invalid genre ids format. Expected comma-separated integers.",
                )
            for genre_id in genre_ids:
                success = repository.create_stage_genre(
                    stage_id=created_stage.id, genre_id=genre_id
                )
                if not success:
                    raise HTTPException(
                        status_code=500,
                        detail=f"Failed to add genre id {genre_id} to stage",
                    )

        if playlists:
            try:
                playlists_ids = [int(id) for id in playlists.split(",")]
            except ValueError:
                raise HTTPException(
                    status_code=400,
                    detail="Invalid playlist ids format. Expected comma-separated integers.",
                )
            for playlist_id in playlists_ids:
                success = repository.create_stage_playlist(
                    stage_id=created_stage.id, playlist_id=playlist_id
                )
                if not success:
                    raise HTTPException(
                        status_code=500,
                        detail=f"Failed to add playlist id {playlist_id} to stage",
                    )

        if participants:
            try:
                participants_ids = [int(id) for id in participants.split(",")]
            except ValueError:
                raise HTTPException(
                    status_code=400,
                    detail="Invalid participant ids format. Expected comma-separated integers.",
                )
            if host_id in participants_ids:
                raise HTTPException(
                    status_code=400, detail="Host cannot be a participant"
                )
            for participant_id in participants_ids:
                participant_stages = repository.get_stages_by_participant(participant_id)
                if participant_stages:
                    stage_id = participant_stages[0]["id"]
                    raise HTTPException(status_code=403, detail=f"Participant {participant_id} already in stage {stage_id}")
                success = repository.create_stage_participant(
                    stage_id=created_stage.id, participant_id=participant_id
                )
                if not success:
                    raise HTTPException(
                        status_code=500,
                        detail=f"Failed to add participant id {participant_id} to stage",
                    )
        return created_stage
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.put("/stages/{stage_id}", response_model=Union[StageOut, Error])
async def update_stage(
    stage_id: int,
    name: str = Form(...),
    genres: Optional[str] = Form(None),
    participants: Optional[str] = Form(None),
    playlists: Optional[str] = Form(None),
    repository: StageRepository = Depends(StageRepository),
    user_data: dict = Depends(authenticator.get_current_account_data),
    cover: UploadFile = File(...),
):
    try:
        host = user_data["username"]
        host_id = user_data["id"]
        stage = repository.get_one(stage_id)
        if stage is None:
            raise HTTPException(status_code=404, detail="Stage not found")
        if stage.host != host:
            raise HTTPException(status_code=403, detail="Permission denied")
        stage_in = Stagein(
            name=name,
            host_id=host_id,
            cover=cover,
        )
        update = await repository.update(host_id, stage_id, stage_in)
        if isinstance(update, Error):
            raise HTTPException(status_code=500, detail="Failed to update stage")

        if genres is not None:
            genre_ids = [int(id) for id in genres.split(",")]
            for genre_id in genre_ids:
                success = repository.create_stage_genre(
                    stage_id=update.id, genre_id=genre_id
                )
                if not success:
                    raise HTTPException(
                        status_code=500, detail="Failed to add genre to stage"
                    )
        if playlists is not None:
            playlist_ids = [int(id) for id in playlists.split(",")]
            for playlist_id in playlist_ids:
                success = repository.create_stage_playlist(
                    stage_id=update.id, playlist_id=playlist_id
                )
                if not success:
                    raise HTTPException(
                        status_code=500, detail="Failed to add playlist to stage"
                    )
        if participants is not None:
            participants_ids = [int(id) for id in participants.split(",")]
            if host_id in participants_ids:
                raise HTTPException(
                    status_code=400, detail="Host cannot be a participant"
                )
            for participant_id in participants_ids:
                participant_stages = repository.get_stages_by_participant(participant_id)
                if participant_stages:
                    stage_id = participant_stages[0]["id"]
                    raise HTTPException(status_code=403, detail=f"Participant {participant_id} already in stage {stage_id}")
                success = repository.create_stage_participant(
                    stage_id=update.id, participant_id=participant_id
                )
                if not success:
                    raise HTTPException(
                        status_code=500,
                        detail=f"Failed to add participant id {participant_id} to stage",
                    )
        return update
    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.delete("/stages/{stage_id}")
async def delete_stage(
    stage_id: int,
    repository: StageRepository = Depends(StageRepository),
    user_data: dict = Depends(authenticator.get_current_account_data),
):
    host = user_data["username"]
    stage = repository.get_one(stage_id)
    if stage is None:
        raise HTTPException(status_code=404, detail="Stage not found")
    if stage.host != host:
        raise HTTPException(
            status_code=403,
            detail="Permission denied, only host can delete stage",
        )
    success = repository.delete(stage_id)
    if not success:
        raise HTTPException(status_code=404, detail="Stage not found")
    return {"message": "Stage deleted successfully"}


@router.post("/stages/{stage_id}/join", response_model=Union[StageOut, Error])
async def join_stage(
    stage_id: int,
    user_data: dict = Depends(authenticator.get_current_account_data),
    repository: StageRepository = Depends(StageRepository),
):
    participant_id = user_data["id"]
    current_user = user_data["username"]
    stage = repository.get_one(stage_id)
    if stage is None:
        raise HTTPException(status_code=404, detail="Stage not found")

    if stage.host == current_user:
        raise HTTPException(
            status_code=403, detail="Already a host, cannot join stage"
        )

    participants = stage.participants or []
    participant_usernames = ",".join(participants).split(",")
    if current_user in participant_usernames:
        raise HTTPException(
            status_code=403, detail="Already a participant, cannot join stage"
        )
    participant_stages = repository.get_stages_by_participant(participant_id)

    if participant_stages:
        stage_id = participant_stages[0]["id"]
        raise HTTPException(
            status_code=403,
            detail=f"Already in stage {stage_id}, leave before joining a new one",
        )
    try:
        repository.create_stage_participant(stage_id, participant_id)
    except Exception as e:
        raise HTTPException(
            status_code=500, detail="Failed to join stage + " + str(e)
        )
    return repository.get_one(stage_id)


@router.delete(
    "/stages/{stage_id}/leave", response_model=Union[StageOut, Error]
)
async def leave_stage(
    stage_id: int,
    repository: StageRepository = Depends(StageRepository),
    user_data: dict = Depends(authenticator.get_current_account_data),
):
    stage = repository.get_one(stage_id)
    if stage is None:
        raise HTTPException(status_code=404, detail="Stage not found")
    if stage.host == user_data["username"]:
        raise HTTPException(
            status_code=403,
            detail="Host cannot leave stage, delete stage instead",
        )

    participants = stage.participants or []
    participant_usernames = ",".join(participants).split(",")
    if user_data["username"] not in participant_usernames:
        raise HTTPException(
            status_code=403, detail="Not a participant, cannot leave stage"
        )
    try:
        user_id = user_data["id"]
        repository.remove_participant(stage_id, user_id)
    except Exception as e:
        raise HTTPException(
            status_code=500, detail="Failed to leave stage + " + str(e)
        )
    return repository.get_one(stage_id)