import React, { useState, useEffect } from "react";
import useToken from "@galvanize-inc/jwtdown-for-react";
import jwt_decode from "jwt-decode";
import { useParams } from "react-router-dom";

function ChatRoom(props) {
  const [input, setInput] = useState("");
  const [socket, setSocket] = useState();
  const [chats, setChats] = useState([]);
  const { id: stageId } = useParams();

  const auth = useToken();

  let decodedToken;
  let username;
  if (auth.token) {
    decodedToken = jwt_decode(auth.token);
    username =
      decodedToken && decodedToken.account
        ? decodedToken.account.username
        : null;
  }

  const [senderId, setSenderId] = useState(null);

  useEffect(() => {
    if (username) {
      const fetchSenderId = async () => {
        const response = await fetch(`http://localhost:8080/users/${username}`);
        if (response.ok) {
          const data = await response.json();
          setSenderId(data.id);
        } else {
          console.error("Failed to fetch senderId");
        }
      };
      fetchSenderId();
    }
  }, [username]);

  useEffect(() => {
    const getChats = async () => {
      const res = await fetch(
        `${process.env.REACT_APP_API_HOST}/stages/${stageId}/chats`
      );
      if (res.ok) {
        const results = await res.json();
        {
          setChats(results);
        }
      }
    };
    getChats();
  }, [stageId]);

  useEffect(() => {
    if (!senderId) {
      return;
    }

    const socketUrl = `${process.env.REACT_APP_WS_HOST}/stages/${stageId}/chats/${senderId}`;
    const websocket = new WebSocket(socketUrl);

    websocket.onmessage = (event) => {
      const chat = JSON.parse(event.data);
      setChats((prev) => [...prev, chat]);
    };

    setSocket(websocket);

    return () => {
      websocket.close();
    };
  }, [senderId, stageId]);

  const handleInputChange = (e) => {
    setInput(e.target.value);
  };

  const handleSendChat = () => {
    if (!senderId) {
      return;
    }

    if (socket.readyState !== WebSocket.OPEN) {
      console.log("WebSocket is not open");
      return;
    }

    socket.send(
      JSON.stringify({
        sender_id: senderId,
        stage_id: stageId,
        message: input,
        username: username,
      })
    );
    setInput("");
  };

  return (
    <div className="container my-4">
      <p>Welcome to stage {stageId}</p>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "flex-start",
          width: "60%",
          margin: "auto",
        }}
      >
        {chats.map((c, index) => (
          <div
            key={index}
            style={{
              display: "flex",
              flexDirection: "row",
              justifyContent:
                c.sender_id === senderId ? "flex-end" : "flex-start",
            }}
          >
            {c.sender_id !== senderId && (
              <div>{c.username || "Unknown User"}&nbsp;: </div>
            )}
            <div
              style={{
                backgroundColor: c.sender_id === senderId ? "black" : "inherit",
              }}
            >
              {c.message}
            </div>
          </div>
        ))}
        <input
          type="text"
          value={input}
          onChange={handleInputChange}
          placeholder="New chat message"
        />
        <button onClick={handleSendChat}>Send</button>
      </div>
    </div>
  );
}

export default ChatRoom;
