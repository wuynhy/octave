# APIs
## Token/Get Token
- Method: GET, POST, DELETE
- Path: /token, /API/PROTECTED
### GET Token
Output
```
{
  "access_token": "string",
  "token_type": "Bearer",
  "user": {
    "id": 0,
    "username": "string",
    "email": "string",
    "avatar_url": "string",
    "bio": "string",
    "friends_count": 0,
    "following_count": 0
  }
}
```
### POST Login
Input:
```
{
  "grant_type": "password",
  "username": "YOUR_USERNAME",
  "password": "YOUR_PASSWORD",
  "scope": "YOUR_SCOPE",
  "client_id": "YOUR_CLIENT_ID",
  "client_secret": "YOUR_CLIENT_SECRET"
}
```
Output:
```
{
  "access_token": "string",
  "token_type": "Bearer"
}
```
### DELETE LogOut
Output:
```
{
  "access_token": "string",
  "token_type": "Bearer"
}
```
### GET A TOKEN
Output:
```
true
```

##  Sign Up
- Method: POST
- Path: /signup
### POST Create User
Input:
```
{
  "username": "string",
  "password": "string",
  "email": "string"
}
```
Output:
```
{
  "access_token": "string",
  "token_type": "Bearer",
  "user": {
    "id": 0,
    "username": "string",
    "email": "string",
    "avatar_url": "string",
    "bio": "string",
    "friends_count": 0,
    "following_count": 0
  }
}
```

## Users
- Method: GET, GET, POST, DELETE, PUT
- Path: /users, /users/{username}, /users/{current_username}
### GET ALL Users
Output:
```
{
  "users": [
    {
      "id": 0,
      "username": "string",
      "email": "string",
      "avatar_url": "string",
      "bio": "string",
      "friends_count": 0,
      "following_count": 0
    }
  ]
}
```
### GET One User
Input:
```
{
  "username": "string"
}
```
Output:
```
{
  "id": 0,
  "username": "string",
  "email": "string",
  "avatar_url": "string",
  "bio": "string",
  "friends_count": 0,
  "following_count": 0
}
```
### PUT Update User
Input:
```
{
  "username": "string",
  "password": "string",
  "email": "string",
  "bio": "string",
  "avatar": "upload"
}
```
Output:
```
"string"
```

### DELETE User
Input:
```
{
  "username": "username",
}
```
Output:
```
true
```

## Genres
- Method: GET, GET
- Path: /genres /genres/{genres_id}
### GET ALL Genres
Output:
```
{
  "users": [
    {
      "id": 0,
      "username": "string",
      "email": "string",
      "avatar_url": "string",
      "bio": "string",
      "friends_count": 0,
      "following_count": 0
    }
  ]
}
```
### GET One Genre
Input:
```
{
  "genre_id": int
}
```
Output:
```
{
  "id": 0,
  "name": "string"
}
```

## Songs
- Method: GET, GET, POST, DELETE, PUT
- Path: /songs, /songs/{song_id},
### GET ALL Songs
Output:
```
[
  {
    "id": 0,
    "uploader": "string",
    "title": "string",
    "artist": "string",
    "music_file_url": "string",
    "cover_url": "string",
    "duration": 0,
    "genres": [
      "string"
    ]
  }
]
```
### GET One Song
Input:
```
{
  "song_id": int
}
```
Output:
```
{
  "id": 0,
  "uploader": "string",
  "title": "string",
  "artist": "string",
  "music_file_url": "string",
  "cover_url": "string",
  "duration": 0,
  "genres": [
    "string"
  ]
}
```
### PUT Update Song
Input:
```
{
  "title": "string",
  "artist": "string",
  "music_file": "string",
  "cover": "string",
  "genres": "string, string, string"
}
```
Output:
```
{
  "id": 0,
  "uploader": "string",
  "title": "string",
  "artist": "string",
  "music_file_url": "string",
  "cover_url": "string",
  "duration": 0,
  "genres": [
    "string"
  ]
}
```

### DELETE Song
Input:
```
{
  "song_id": int,
}
```
Output:
```
"string"
```

## Friendships
- Method: GET, POST, DELETE, DELETE, PUT
- Path: /friendships, /friendships/{friend_username}, /friendships/{friend_username}/, /friendships/{friend_username}/unfollow_pending, /friendships/check/{friend_username}
### POST Create Friendship
Input:
```
  {
    "friend_username": "string,
  }
```
Output:
```
true
```
### DELETE Friendship
Input:
```
  {
    "friend_username": "string,
  }
```
Output:
```
true
```
### DELETE Unfollow
Input:
```
  {
    "friend_username": "string,
  }
```
Output:
```
true
```

### PUT Accept Friendship
Input:
```
  {
    "friend_username": "string,
  }
```
Output:
```
true
```
### GET All
Output:
```
true
```
### GET Check Friendship
Output:
```
[
  {
    "id": 0,
    "user_id": 0,
    "friend_id": 0,
    "status": "string"
  }
]
```

## Stages
- Method: GET, GET, GET, POST, POST, DELETE, DELETE, PUT
- Path: /stages, /stages/{stage_id}, /stages/{stage_id}/join, /stages/{stage_id}/leave, /stages/{stage_id}/chats
### GET ALL Stages
Output:
```
[
  {
    "id": 7,
    "name": "test",
    "host": "stage4",
    "cover_url": "string",
    "genres": [],
    "participants": [],
    "playlists": [
      "Stage2"
    ]
  }
]
```
### GET One Stage
Input:
```
{
  "stage_id": int
}
```
Output:
```
{
  "id": 0,
  "name": "string",
  "host": "string",
  "cover_url": "string",
  "genres": [
    "string"
  ],
  "participants": [
    "string"
  ],
  "playlists": [
    "string"
  ]
}
```
### Get Read Chats
Input:
```
{
"stage_id": int
}
```
Output:
```
"string"
```
### POST Create Stage
Input:
```
{
  "name": "string",
  "genres": "string",
  "participants": "string",
  "playlists": "string",
  "cover": "string($binary)"
}
```
Output:
```
{
  "id": 7,
  "name": "test",
  "host": "stage4",
  "cover_url": "string",
  "genres": [],
  "participants": [],
  "playlists": []
}
```
### POST Join Stage
Input:
```
{
 "stage_id": int
}
```
Output:
```
{
  "id": 0,
  "name": "string",
  "host": "string",
  "cover_url": "string",
  "genres": [
    "string"
  ],
  "participants": [
    "string"
  ],
  "playlists": [
    "string"
  ]
}
```
### DELETE stage
Input:
```
  {
    "stage_id": int
  }
```
Output:
```
"string"
```
### DELETE Leave Stage
Input:
```
  {
    "stage_id": int
  }
```
Output:
```
{
  "id": 0,
  "name": "string",
  "host": "string",
  "cover_url": "string",
  "genres": [
    "string"
  ],
  "participants": [
    "string"
  ],
  "playlists": [
    "string"
  ]
}
```
### PUT Update Stage
Input:
```
{
  "name": "string",
  "genres": "string",
  "participants": "string",
  "playlists": "string",
  "cover": "string($binary)"
}
```
Output:
```
{
  "id": 0,
  "name": "string",
  "host": "string",
  "cover_url": "string",
  "genres": [
    "string"
  ],
  "participants": [
    "string"
  ],
  "playlists": [
    "string"
  ]
}
```
## Playlists
- Method: GET, GET, POST, DELETE, PUT
- Path: /playlists, /playlists/{playlist_id}
### GET ALL Playlists
Output:
```
[
  {
    "id": 0,
    "name": "string",
    "owner": "string",
    "description": "string",
    "songs": [],
    "cover_url": "string"
  }
]
```
### GET One Playlists
Input:
```
{
  "playlist_id": int
}
```
Output:
```
{
  "id": 0,
  "name": "string",
  "owner": "string",
  "description": "string",
  "songs": [],
  "cover_url": "string"
}
```
### PUT Update Playlist
Input:
```
{
  "name": "string",
  "description": "string",
  "songs": [],
  "cover_url": "string"
}
```
Output:
```
{
  "id": 0,
  "name": "string",
  "owner": "string",
  "description": "string",
  "songs": [],
  "cover_url": "string"
}
```

### DELETE Playlist
Input:
```
{
  "playlist_id": int,
}
```
Output:
```
"string"
```
