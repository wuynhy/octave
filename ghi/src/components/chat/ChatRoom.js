import React, { useState, useEffect, useRef } from "react";
import useToken from "@galvanize-inc/jwtdown-for-react";
import jwt_decode from "jwt-decode";
import { useParams } from "react-router-dom";

function ChatRoom(props) {
  const [input, setInput] = useState("");
  const [socket, setSocket] = useState();
  const [chats, setChats] = useState([]);
  const { id: stageId } = useParams();
  const messagesEndRef = useRef(null);

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
        setChats(results);
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

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [chats]);

  return (
    <div className="flex justify-end h-screen m-0 p-0">
      <div className="chat-room w-full h-full flex flex-col p-4">
        <div className="chat-container flex flex-col flex-grow overflow-y-auto mb-4">
          {chats.map((c, index) => (
            <div
              key={index}
              className={
                c.sender_id === senderId ? "chat chat-end" : "chat chat-start"
              }
            >
              {c.sender_id !== senderId && (
                <div className="chat-header">
                  {c.username || "Unknown User"}&nbsp;:{" "}
                </div>
              )}
              <div className="chat-bubble chat-bubble-primary">{c.message}</div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
        <div className="input-container flex justify-center">
          <input
            type="text"
            value={input}
            onChange={handleInputChange}
            placeholder="New chat message"
            className="input input-bordered input-primary w-full max-w-xs mr-2"
          />
          <button className="btn btn-secondary ml-2" onClick={handleSendChat}>
            Send
          </button>
        </div>
      </div>
    </div>
  );
}

export default ChatRoom;
