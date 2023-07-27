import React, { useState, useEffect } from "react";
import useToken from "@galvanize-inc/jwtdown-for-react";
import jwt_decode from "jwt-decode";

function FriendsTabComponent() {
  const [friends, setFriends] = useState([]);
  const [friendRequests, setFriendRequests] = useState([]);
  const [allUsers, setAllUsers] = useState([]);

  const auth = useToken();

  let decodedToken;
  let currentUserID;
  if (auth.token) {
    decodedToken = jwt_decode(auth.token);
    currentUserID = decodedToken?.account?.id || null;
  }

  const fetchAllUsers = () => {
    fetch(`${process.env.REACT_APP_API_HOST}/users`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${auth.token}`,
      },
    })
      .then((response) => response.json())
      .then((data) => {
        setAllUsers(data.users);
      });
  };

  const fetchFriendshipData = () => {
    if (currentUserID) {
      fetch(`${process.env.REACT_APP_API_HOST}/friendships`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${auth.token}`,
        },
      })
        .then((response) => response.json())
        .then((data) => {
          const acceptedFriends = data
            .filter(
              (f) =>
                (f.user_id === currentUserID ||
                  f.friend_id === currentUserID) &&
                f.status === "accepted"
            )
            .map((friend) => {
              const friendUsername =
                friend.user_id === currentUserID
                  ? allUsers.find((u) => u.id === friend.friend_id)?.username
                  : allUsers.find((u) => u.id === friend.user_id)?.username;
              return { ...friend, username: friendUsername };
            });
          setFriends(acceptedFriends);

          const pendingRequests = data
            .filter(
              (f) => f.friend_id === currentUserID && f.status === "pending"
            )
            .map((request) => {
              const requesterUsername = allUsers.find(
                (u) => u.id === request.user_id
              )?.username;
              return { ...request, user_username: requesterUsername };
            });

          setFriendRequests(pendingRequests);
        });
    }
  };

  useEffect(() => {
    fetchAllUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (allUsers.length) {
      fetchFriendshipData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUserID, auth.token, allUsers]);

  const acceptRequest = (friendUsername) => {
    fetch(`${process.env.REACT_APP_API_HOST}/friendships/${friendUsername}/`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${auth.token}`,
      },
    })
      .then((response) => response.json())
      .then((accepted) => {
        if (accepted) {
          const request = friendRequests.find(
            (req) => req.friend_username === friendUsername
          );
          setFriendRequests((prevRequests) =>
            prevRequests.filter((f) => f.friend_username !== friendUsername)
          );
          setFriends((prevFriends) => [...prevFriends, request]);
          fetchFriendshipData();
        }
      });
  };

  const denyRequest = (friendUsername) => {
    fetch(
      `${process.env.REACT_APP_API_HOST}/friendships/${friendUsername}/unfollow_pending`,
      {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${auth.token}`,
        },
      }
    )
      .then((response) => response.json())
      .then((deleted) => {
        if (deleted) {
          setFriendRequests((prevRequests) =>
            prevRequests.filter((f) => f.user_username !== friendUsername)
          );
        }
      });
  };

  return (
    <div className="friends-tab-container">
      <div className="friends-list">
        <h1 className="friends-title">Friends</h1>
        {friends.map((friend, index) => (
          <div key={index}>{friend?.username}</div>
        ))}
      </div>
      <div className="friend-requests-list">
        {friendRequests.map((request, index) => (
          <div key={index}>
            <button onClick={() => acceptRequest(request.user_username)}>
              {request.user_username} has sent you a friend request:{" "}
              <span style={{ color: "lightblue" }}>Accept</span> or
            </button>
            <button onClick={() => denyRequest(request.user_username)}>
              <span style={{ color: "red" }}>&nbsp;Deny</span>?
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default FriendsTabComponent;
