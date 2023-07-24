import React, { useState, useEffect } from "react";
import useToken from "@galvanize-inc/jwtdown-for-react";
import jwt_decode from "jwt-decode";

function FriendsTabComponent() {
  const [friends, setFriends] = useState([]);
  const [friendRequests, setFriendRequests] = useState([]);

  const auth = useToken();

  let decodedToken;
  let currentUserID;
  if (auth.token) {
    decodedToken = jwt_decode(auth.token);
    currentUserID = decodedToken?.account?.id || null;
  }

  let userIdToUsernameMap = {};

  const fetchUsernameByUserId = async (id, data) => {
    const matchingFriendship = data.find(
      (f) => f.user_id === id || f.friend_id === id
    );
    if (matchingFriendship) {
      return matchingFriendship.user_id === id
        ? matchingFriendship.user_username
        : matchingFriendship.friend_username;
    } else {
      console.error(`Could not find username for user ID: ${id}`);
      return null;
    }
  };

  useEffect(() => {
    if (currentUserID) {
      fetch(`${process.env.REACT_APP_API_HOST}/friendships`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${auth.token}`,
        },
      })
        .then((response) => response.json())
        .then(async (data) => {
          const acceptedFriends = data.filter(
            (f) =>
              (f.user_id === currentUserID || f.friend_id === currentUserID) &&
              f.status === "accepted"
          );

          for (let friend of acceptedFriends) {
            const friendId =
              friend.user_id === currentUserID
                ? friend.friend_id
                : friend.user_id;
            if (!userIdToUsernameMap[friendId]) {
              const username = await fetchUsernameByUserId(friendId, data);
              userIdToUsernameMap[friendId] = username;
            }
            friend.username = userIdToUsernameMap[friendId];
          }

          setFriends(acceptedFriends);

          const pendingRequests = data.filter(
            (f) => f.friend_id === currentUserID && f.status === "pending"
          );

          for (let request of pendingRequests) {
            request.username = await fetchUsernameByUserId(
              request.user_id,
              data
            );
          }

          setFriendRequests(pendingRequests);
        });
    }
  }, [currentUserID, auth.token]);

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
            (req) => req.friend_id === friendUsername
          );
          setFriendRequests((prevRequests) =>
            prevRequests.filter((f) => f.friend_id !== friendUsername)
          );
          setFriends((prevFriends) => [...prevFriends, request]);
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
            prevRequests.filter((f) => f.friend_id !== friendUsername)
          );
        }
      });
  };

  return (
    <div className="friends-tab-container">
      {/* Render each friend's details */}
      <div className="friends-list">
        {friends.map((friend, index) => (
          <div key={index}>{friend.username}</div>
        ))}
      </div>

      {/* Render each friend request's details */}
      <div className="friend-requests-list">
        {friendRequests.map((request, index) => (
          <div key={index}>
            {/* friend request details */}
            <button onClick={() => acceptRequest(request.friend_id)}>
              Accept
            </button>
            <button onClick={() => denyRequest(request.friend_id)}>Deny</button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default FriendsTabComponent;
