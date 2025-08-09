import React, { useState } from "react";
import { ThreeDots } from "react-loader-spinner";
import { FaArrowRight, FaTimes } from "react-icons/fa";
import myImg from "../Assets/avatar.svg";
import chatbotIcon from "../Assets/chat-bot.svg";
import "../Chatbot.css";

const ChatBot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [closing, setClosing] = useState(false);
   const toggleChat = () => {
    if (isOpen) {
      setClosing(true); 
      setTimeout(() => {
        setIsOpen(false);
        setClosing(false);
      }, 300); 
    } else {
      setIsOpen(true); 
    }
  };
  const [messages, setMessages] = useState([
    {
      sender: "bot",
      text: "Hi there! 👋 Thanks for visiting my portfolio. Feel free to ask me anything about programming, web development, or my experiences in tech."
    }
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  const sendMessage = () => {
    if (!input.trim()) return;
    const userMsg = { sender: "user", text: input };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");

    // Simulate bot typing
    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);
      setMessages((prev) => [
        ...prev,
        { sender: "bot", text: "Thanks for your message! I'll get back to you soon." }
      ]);
    }, 1500);
  };
const BOT_NAME = "Fideljon";
const USER_NAME = "You";
  return (
    <>
      {/* Toggle Button */}
        <button className="chat-toggle" onClick={toggleChat}>
          <img src={chatbotIcon} alt="Chat" className="chat-icon" /> Chat with Me!
        </button>
      {/* Chat Window */}
      {isOpen && (
        <div className={`chat-window ${closing ? "fade-out" : "fade-in"}`}>
          <div className="chat-header">
            <div className="chat-header-profile">
              <img src={myImg} alt="Bot" className="bot-avatar" />
              <div className="chat-header-info">
                <h5>Chat with Fideljon</h5>
                <span className="status">
                  <span className="online-dot"></span> Online · Portfolio Bot
                </span>
              </div>
            </div>
            <button className="close-btn" onClick={toggleChat}> <FaTimes /> </button>
          </div>
 
          <div className="chat-body">
            {messages.map((msg, idx) => {
              const isBot = msg.sender === "bot";
              return (
                <div key={idx} className={`message ${msg.sender}`}>
                  <div className="message-name">
                    {isBot && <img src={myImg} alt="Bot" className="message-avatar" />}
                    <span>{isBot ? BOT_NAME : ''}</span>
                  </div>
                  <div className="message-text">{msg.text}</div>
                </div>
              );
            })}
            {isTyping && (
              <div className="message bot">
                <img src={myImg} alt="Bot" className="message-avatar" />
                <div className="message-text typing">
                  <ThreeDots height="15" width="30" radius="9" color="#fff" ariaLabel="typing" />
                </div>
              </div>
            )}
          </div>

          <div className="chat-footer">
            <input
              type="text"
              placeholder="Type a message..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendMessage()}
            />
            <button onClick={sendMessage}><FaArrowRight /></button>
          </div>
        </div>
      )}
    </>
  );
};

export default ChatBot;
