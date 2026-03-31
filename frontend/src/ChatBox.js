import React, { useState } from "react";

function ChatBox() {
  const [messages, setMessages] = useState([
    {
      sender: "bot",
      text: "👋 Hi! Hello!\nWelcome to Smart Travel Planner 🌍\nHow can I help you?"
    }
  ]);

  const [input, setInput] = useState("");

  const handleSend = async () => {
    if (!input) return;

    const userMessage = { sender: "user", text: input };
    setMessages(prev => [...prev, userMessage]);

    try {
      const res = await fetch("http://localhost:5001/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ message: input })
      });

      const data = await res.json();

      const botMessage = {
        sender: "bot",
        text: data.content || "No response"
      };

      setMessages(prev => [...prev, botMessage]);

    } catch (error) {
      setMessages(prev => [
        ...prev,
        { sender: "bot", text: "Error connecting to server" }
      ]);
    }

    setInput("");
  };

  return (
    <div style={{
      width: "400px",
      background: "white",
      borderRadius: "10px",
      padding: "15px",
      boxShadow: "0px 0px 10px gray",
      margin: "auto",
      marginTop: "50px"
    }}>

      <h2 style={{ textAlign: "center" }}>🌍 Smart Travel Planner</h2>

      <div style={{
        border: "1px solid #ccc",
        height: "300px",
        overflowY: "scroll",
        padding: "10px",
        marginBottom: "10px"
      }}>
        {messages.map((msg, index) => (
          <p key={index}>
            <b>{msg.sender}:</b> {msg.text}
          </p>
        ))}
      </div>

      <input
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="Ask your trip..."
      />

      <button onClick={handleSend}>Send</button>

    </div>
  );
}

export default ChatBox;