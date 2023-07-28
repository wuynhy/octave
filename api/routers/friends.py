from fastapi import APIRouter, Depends, HTTPException
from authenticator import authenticator
from queries.friends import FriendshipRepository, FriendshipOut
from typing import List


router = APIRouter()
friendship_repo = FriendshipRepository()


@router.post("/friendships/{friend_username}", response_model=bool)
async def create_friendship(
    friend_username: str,
    user_data: dict = Depends(authenticator.get_current_account_data),
) -> bool:
    current_user = user_data["username"]
    if friend_username == current_user:
        raise HTTPException(
            status_code=400, detail="Cannot create friendship with yourself"
        )

    if friendship_repo.check_friendship_exist(current_user, friend_username):
        raise HTTPException(
            status_code=400, detail="Friendship already exists"
        )
    friendship = await friendship_repo.create_friendship(
        current_user, friend_username
    )
    if not friendship:
        raise HTTPException(
            status_code=400, detail="Friendship creation failed"
        )
    return True


@router.put("/friendships/{friend_username}", response_model=bool)
def accept_friendship(
    friend_username: str,
    user_data: dict = Depends(authenticator.get_current_account_data),
    friendship_repo: FriendshipRepository = Depends(),
) -> bool:
    current_user = user_data["username"]
    if friend_username == current_user:
        raise HTTPException(
            status_code=400, detail="Cannot accept friendship with yourself"
        )
    if not friendship_repo.check_friendship_exist(
        friend_username, current_user
    ):
        raise HTTPException(
            status_code=404, detail="Friendship request not found"
        )

    accepted = friendship_repo.accept_friendship(current_user, friend_username)
    return accepted


@router.delete("/friendships/{friend_username}/delete", response_model=bool)
def delete_friendship(
    friend_username: str,
    user_data: dict = Depends(authenticator.get_current_account_data),
    friendship_repo: FriendshipRepository = Depends(),
) -> bool:
    current_user = user_data["username"]
    if not friendship_repo.check_friendship_exist(
        current_user, friend_username
    ):
        raise HTTPException(status_code=404, detail="Friendship not found")

    deleted = friendship_repo.delete_friendship(current_user, friend_username)
    return deleted


@router.delete(
    "/friendships/{friend_username}/unfollow_pending", response_model=bool
)
def unfollow_pending(
    friend_username: str,
    user_data: dict = Depends(authenticator.get_current_account_data),
    friendship_repo: FriendshipRepository = Depends(),
) -> bool:
    current_user = user_data["username"]
    if not friendship_repo.check_friendship_exist(
        current_user, friend_username
    ):
        raise HTTPException(status_code=404, detail="Friendship not found")

    deleted = friendship_repo.unfollow_pending(current_user, friend_username)
    return deleted


@router.get("/friendships", response_model=List[FriendshipOut])
def get_all():
    friendships = friendship_repo.get_all()
    return friendships


@router.get("/friendships/{friendship_id}", response_model=FriendshipOut)
def get(friendship_id: int) -> FriendshipOut:
    friendship = friendship_repo.get(friendship_id)
    if friendship is None:
        raise HTTPException(status_code=404, detail="Friendship not found")
    return friendship


@router.get("/friendships/check/{friend_username}", response_model=bool)
def check_friendship(
    friend_username: str,
    user_data: dict = Depends(authenticator.get_current_account_data),
    friendship_repo: FriendshipRepository = Depends(),
) -> bool:
    current_user = user_data["username"]
    return friendship_repo.check_friendship_exist(
        current_user, friend_username
    )
