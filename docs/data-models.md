# Data Models
## Octave
### Chats
| name             | type        | unique | optional |
| ---------------- | ----------- | ------ | -------- |
| id               | [PK]integer | yes    | no       |
| stage_id         | integer     | yes    | no       |
| sender_id        | integer     | yes    | no       |
| message          | string      | no     | no       |
### Friendships
| name             | type        | unique | optional |
| ---------------- | ----------- | ------ | -------- |
| id               | [PK]integer | yes    | no       |
| user_id          | integer     | yes    | no       |
| friend_id        | integer     | yes    | no       |
| status           | text        | yes    | no       |
### Genres
| name             | type        | unique | optional |
| ---------------- | ----------- | ------ | -------- |
| id               | [PK]integer | yes    | no       |
| name             | text        | yes    | no       |
### Migrations
| name             | type        | unique | optional |
| ---------------- | ----------- | ------ | -------- |
| id               | [PK]integer | yes    | no       |
| digest           | binary      | yes    | no       |
### Playlist Songs
| name             | type        | unique | optional |
| ---------------- | ----------- | ------ | -------- |
| playlist_id      | [PK]integer | yes    | no       |
### Playlists
| name             | type        | unique | optional |
| ---------------- | ----------- | ------ | -------- |
| id               | [PK]integer | yes    | no       |
| user_id          | integer     | yes    | no       |
| name             | text        | yes    | no       |
| description      | text        | yes    | no       |
| cover            | text        | yes    | no       |
### Song Genres
| name             | type        | unique | optional |
| ---------------- | ----------- | ------ | -------- |
| song_id          | [PK]integer | yes    | no       |
| genre_id         | [PK]integer | yes    | no       |
### Songs
| name             | type        | unique | optional |
| ---------------- | ----------- | ------ | -------- |
| id               | [PK]integer | yes    | no       |
| uploader         | integer     | yes    | no       |
| title            | text        | yes    | no       |
| artist           | text        | yes    | no       |
| music_file       | text        | yes    | no       |
### Stage Genres
| name             | type        | unique | optional |
| ---------------- | ----------- | ------ | -------- |
| stage_id         | [PK]integer | yes    | no       |
| genre_id         | [PK]integer | yes    | no       |
### Stage Participants
| name             | type        | unique | optional |
| ---------------- | ----------- | ------ | -------- |
| stage_id         | [PK]integer | yes    | no       |
| participant_id   | [PK]integer | yes    | no       |
### Stage Playlists
| name             | type        | unique | optional |
| ---------------- | ----------- | ------ | -------- |
| stage_id         | [PK]integer | yes    | no       |
| playlist_id      | [PK]integer | yes    | no       |
### Stages
| name             | type        | unique | optional |
| ---------------- | ----------- | ------ | -------- |
| id               | [PK]integer | yes    | no       |
| name             | text        | yes    | no       |
| host_id          | integer     | yes    | no       |
| cover            | text        | yes    | no       |
### Users
| name             | type        | unique | optional |
| ---------------- | ----------- | ------ | -------- |
| id               | [PK]integer | yes    | no       |
| username         | text        | yes    | no       |
| email            | integer     | yes    | no       |
| password_hash    | text        | yes    | no       |
| avatar           | text        | yes    | yes      |
| bio              | text        | yes    | yes      |
| friends_count    | int         | yes    | no       |
| following_count  | int         | yes    | no       |
