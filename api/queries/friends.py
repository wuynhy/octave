from pydantic import BaseModel
from typing import List, Dict, Any, Optional
from .pool import pool


class Error(BaseModel):
    message: str


class FriendshipIn(BaseModel):
    user_id: int
    friend_id: int
    status: str


class FriendshipOut(BaseModel):
    id: int
    user_id: int
    friend_id: int
    status: str


class FriendshipsOut(BaseModel):
    friendships: List[FriendshipOut]


class FriendshipRepository:
    def check_friendship_exist(self, user1: str, user2: str) -> bool:
        try:
            with pool.connection() as conn:
                with conn.cursor() as db:
                    db.execute(
                        """
                        SELECT EXISTS(
                            SELECT 1
                            FROM friendships
                            WHERE (user_id = (SELECT id FROM users WHERE username = %s)
                            AND friend_id = (SELECT id FROM users WHERE username = %s))
                               OR (user_id = (SELECT id FROM users WHERE username = %s)
                               AND friend_id = (SELECT id FROM users WHERE username = %s))
                        ) AS exists;
                        """,
                        [user1, user2, user2, user1],
                    )
                    result = db.fetchone()
                    if result is None:
                        return False
                    else:
                        result = result[0]
                    return result

        except Exception:
            return False

    async def create_friendship(
        self, user1: str, user2: str
    ) -> Optional[FriendshipOut]:
        try:
            with pool.connection() as conn:
                with conn.cursor() as db:
                    db.execute(
                        """
                        SELECT id FROM users WHERE username = %s;
                        """,
                        [user1],
                    )
                    user1_id = db.fetchone()
                    if user1_id is None:
                        raise Exception("User 1 does not exist")
                    user1_id = user1_id[0]

                    db.execute(
                        """
                        SELECT id FROM users WHERE username = %s;
                        """,
                        [user2],
                    )

                    user2_id = db.fetchone()
                    if user2_id is None:
                        raise Exception("User 2 does not exist")
                    user2_id = user2_id[0]

                    try:
                        db.execute(
                            """
                            INSERT INTO friendships (user_id, friend_id, status)
                            VALUES (%s, %s, 'pending') RETURNING id;
                            """,
                            [user1_id, user2_id],
                        )
                        db.fetchone()[0]
                    except Exception:
                        raise Exception("Failed to create friendship")

                    return True

        except Exception as e:
            raise Exception("Failed to create friendship: " + str(e))

    def accept_friendship(self, user1: str, user2: str) -> bool:
        try:
            with pool.connection() as conn:
                with conn.cursor() as db:
                    db.execute(
                        """
                        UPDATE friendships
                        SET status = 'accepted'
                        WHERE user_id = (SELECT id FROM users WHERE username = %s)
                        AND friend_id = (SELECT id FROM users WHERE username = %s)
                        AND status = 'pending';
                        """,
                        [user2, user1],
                    )

                    if db.rowcount == 0:
                        return False

                    return True
        except Exception:
            return False

    def unfollow_pending(self, user1: str, user2: str) -> bool:
        try:
            with pool.connection() as conn:
                with conn.cursor() as db:
                    db.execute(
                        """
                        DELETE FROM friendships
                        WHERE user_id = (SELECT id FROM users WHERE username = %s)
                        AND friend_id = (SELECT id FROM users WHERE username = %s)
                        AND status = 'pending';
                        """,
                        [user1, user2],
                    )

                    if db.rowcount == 0:
                        return False

                    return True
        except Exception:
            return False

    def delete_friendship(self, user1: str, user2: str) -> bool:
        try:
            with pool.connection() as conn:
                with conn.cursor() as db:
                    db.execute(
                        """
                        DELETE FROM friendships
                        WHERE (user_id = (SELECT id FROM users WHERE username = %s)
                        AND friend_id = (SELECT id FROM users WHERE username = %s))
                        OR (user_id = (SELECT id FROM users WHERE username = %s)
                        AND friend_id = (SELECT id FROM users WHERE username = %s));
                        """,
                        [user1, user2, user2, user1],
                    )

                    if db.rowcount == 0:
                        return False

                    return True
        except Exception:
            return False

    def get_user_friendships(self, username: str) -> List[Dict[str, Any]]:
        try:
            with pool.connection() as conn:
                with conn.cursor() as db:
                    db.execute(
                        """
                        SELECT f.user_id, f.friend_id
                        FROM friendships AS f
                        JOIN users AS u ON f.user_id = u.id
                        WHERE f.user_id = (SELECT id FROM users WHERE username = %s)
                        AND f.status = 'accepted';
                        """,
                        [username],
                    )
                    friendships = []
                    for row in db.fetchall():
                        friendship = {"user_id": row[0], "friend_id": row[1]}
                        friendships.append(friendship)
                    return friendships
        except Exception:
            raise Exception("Failed to retrieve user friendships")

    def get_user_followers(self, username: str) -> List[Dict[str, Any]]:
        try:
            with pool.connection() as conn:
                with conn.cursor() as db:
                    db.execute(
                        """
                        SELECT f.user_id, f.friend_id
                        FROM friendships AS f
                        JOIN users AS u ON f.user_id = u.id
                        WHERE f.user_id = (SELECT id FROM users WHERE username = %s)
                        AND f.status = 'pending';
                        """,
                        [username],
                    )
                    followers = []
                    for row in db.fetchall():
                        follower = {"user_id": row[0], "friend_id": row[1]}
                        followers.append(follower)
                    return followers
        except Exception:
            raise Exception("Failed to retrieve user followers")

    def get_all(self) -> List[Dict[str, Any]]:
        try:
            with pool.connection() as conn:
                with conn.cursor() as db:
                    db.execute(
                        """
                        SELECT f.id, f.user_id, u1.username AS user_username,
                        f.friend_id, u2.username AS friend_username, f.status
                        FROM friendships AS f
                        JOIN users AS u1 ON f.user_id = u1.id
                        JOIN users AS u2 ON f.friend_id = u2.id
                        """
                    )
                    friendships = []
                    for row in db.fetchall():
                        friendship = {
                            "id": row[0],
                            "user_id": row[1],
                            "user_username": row[2],
                            "friend_id": row[3],
                            "friend_username": row[4],
                            "status": row[5],
                        }
                        friendships.append(friendship)
                    return friendships
        except Exception:
            raise Exception("Failed to retrieve all friendships")

    def get(self, id: int) -> Optional[Dict[str, Any]]:
        try:
            with pool.connection() as conn:
                with conn.cursor() as db:
                    db.execute(
                        """
                        SELECT f.id, f.user_id, u1.username AS user_username,
                        f.friend_id, u2.username AS friend_username, f.status
                        FROM friendships AS f
                        JOIN users AS u1 ON f.user_id = u1.id
                        JOIN users AS u2 ON f.friend_id = u2.id
                        WHERE f.id = %s
                        """,
                        [id],
                    )
                    record = db.fetchone()
                    if record is None:
                        return None
                    return {
                        "id": record[0],
                        "user_id": record[1],
                        "user_username": record[2],
                        "friend_id": record[3],
                        "friend_username": record[4],
                        "status": record[5],
                    }
        except Exception as e:
            raise Exception("Failed to retrieve friendship: " + str(e))
