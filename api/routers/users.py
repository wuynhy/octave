from fastapi import (
    Depends,
    HTTPException,
    status,
    Response,
    APIRouter,
    Request,
)
from typing import Optional
from jwtdown_fastapi.authentication import Token
from authenticator import authenticator
from pydantic import BaseModel
from queries.users import (
    UserIn,
    UserRepository,
    UserOut,
    UsersOut,
    DuplicateUserError,
)


class UserForm(BaseModel):
    username: str
    password: str


class UserToken(Token):
    user: UserOut


class HttpError(BaseModel):
    detail: str


router = APIRouter()


@router.get("/api/protected", response_model=bool)
async def get_token(
    request: Request,
    user_data: dict = Depends(authenticator.get_current_account_data)
):
    return True

@router.get("/token", response_model=UserToken | None)
async def get_token(
    request: Request,
    user: UserOut = Depends(authenticator.try_get_current_account_data)
):
    if user and authenticator.cookie_name in request.cookies:
        return {
            "access_token": request.cookies[authenticator.cookie_name],
            "type": "Bearer",
            "user": user
        }

@router.post("/signup", response_model=UserToken | HttpError)
async def create_user(
    user_info: UserIn,
    request: Request,
    response: Response,
    repo: UserRepository = Depends(),
):
    hashed_password = authenticator.hash_password(user_info.password)
    try:
        user = repo.create(user_info, hashed_password)
    except DuplicateUserError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot create an account with those credentials/username already exists",
        )
    form = UserForm(
        username=user_info.username,
        password=user_info.password,
    )
    token = await authenticator.login(response, request, form, repo)
    return UserToken(user=user, **token.dict())


@router.get("/users", response_model=UsersOut)
async def get_all(
    repo: UserRepository = Depends(),
    user_data: dict = Depends(authenticator.get_current_account_data),
):
    if user_data:
        return {
            "users": repo.get_all()
        }


@router.put("/users/{username}")
async def update_user(
    username: str,
    user: UserIn,
    response: Response,
    repo: UserRepository = Depends(),
    user_data: dict = Depends(authenticator.get_current_account_data),
):
    hashed_password = authenticator.hash_password(user.password)
    if user_data:
        return repo.update(username, user, hashed_password)


@router.delete("/users/{username}", response_model=bool)
async def delete_user(
    username: str,
    repo: UserRepository = Depends(),
) -> bool:
    return repo.delete(username)


@router.get("/users/{username}", response_model=Optional[UserOut])
async def get_one_user(
    username: str,
    repo: UserRepository = Depends(),
) -> Optional[UserOut]:
    return repo.get(username)
