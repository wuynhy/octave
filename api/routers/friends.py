from fastapi import APIRouter, Depends, HTTPException
from authenticator import authenticator
from queries.friends import FriendshipRepository, FriendshipOut
from typing import List


router = APIRouter()


@router.post("/friendships/{friend_username}", response_model=bool)
def create_friendship(
    friend_username: str,
    user_data: dict = Depends(authenticator.get_current_account_data),
    friendship_repo: FriendshipRepository = Depends(),
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

    friendship = friendship_repo.create_friendship(
        current_user, friend_username
    )
    if not friendship:
        raise HTTPException(
            status_code=400, detail="Friendship creation failed"
        )
    return True


@router.put("/friendships/{friend_username}/", response_model=bool)
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


@router.delete("/friendships/{friend_username}", response_model=bool)
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
def get_all_friendships(
    user_data: dict = Depends(authenticator.get_current_account_data),
    friendship_repo: FriendshipRepository = Depends(),
) -> List[FriendshipOut]:
    if user_data:
        friendships = friendship_repo.get_all_friendships()
        return [FriendshipOut(**friendship) for friendship in friendships]
    else:
        return []
