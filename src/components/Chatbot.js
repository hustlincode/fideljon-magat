import React, { useState } from "react";
import { ThreeDots } from "react-loader-spinner";
import { FaArrowRight, FaTimes } from "react-icons/fa";
import myImg from "../Assets/avatar.svg";
import chatbotIcon from "../Assets/chat-bot.svg";
import "../Chatbot.css";

// Gemini SDK
import {
  GoogleGenAI,
  HarmBlockThreshold,
  HarmCategory,
} from "@google/genai";

const ChatBot = () => {
  const BOT_NAME = "Fideljon";
  const USER_NAME = "";

  const [isOpen, setIsOpen] = useState(false);
  const [closing, setClosing] = useState(false);
  const [messages, setMessages] = useState([
    {
      sender: "bot",
      text: "Hi there! 👋 Thanks for visiting my portfolio. Feel free to ask me anything about programming, web development, or my experiences in tech."
    }
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  // Gemini AI config
  const ai = new GoogleGenAI({
    apiKey: process.env.REACT_APP_GEMINI_API_KEY, // store key in .env
  });

  const config = {
    topP: 1,
    safetySettings: [
      { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH },
      { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH },
      { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH },
      { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH }
    ],
    systemInstruction: [
      {
        text: `{
          "system_instruction": "You are Fidel Jon Magat. Answer all questions in the first person as if you are Fidel Jon himself. Your scope is limited to your programming knowledge, skills, professional experience, and projects. Do not answer questions outside programming, technology, or your career journey. If asked about unrelated topics (e.g., personal life beyond your career, hobbies, private details), politely decline and redirect to programming-related discussions. Always provide examples from your skills and projects when relevant.",
          "website": "https://fideljon.vercel.app",
          "fallback_message": "I can only talk about my programming knowledge, skills, projects, and professional experiences. 😊 Feel free to ask me about web development, software engineering, or my journey in tech!"
        }`
      }
    ]
  };

  // ✅ Toggle open/close
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

  // ✅ Add message
  const addMessage = (sender, text) => {
    setMessages((prev) => [...prev, { sender, text }]);
  };

  // ✅ Send to Gemini
  const sendToGemini = async (userInput) => {
    addMessage("user", userInput);
    setIsTyping(true);

    try {
      const model = "gemini-2.0-flash";
      const contents = [
        { role: "user", parts: [{ text: userInput }] }
      ];

      const response = await ai.models.generateContentStream({
        model,
        config,
        contents
      });

      let botReply = "";
      for await (const chunk of response) {
        if (chunk.text) {
          botReply += chunk.text;
        }
      }

      setIsTyping(false);
      addMessage("bot", botReply || "I can only talk about my programming knowledge, skills, and projects. 😊");
    } catch (error) {
      console.error("Error talking to Gemini:", error);
      setIsTyping(false);
      addMessage("bot", "Oops! Something went wrong.");
    }
  };

  // ✅ Send message
  const sendMessage = () => {
    if (!input.trim()) return;
    sendToGemini(input.trim());
    setInput("");
  };

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
                <h5>Chat with {BOT_NAME}</h5>
                <span className="status">
                  <span className="online-dot"></span> Online · Portfolio Bot
                </span>
              </div>
            </div>
            <button className="close-btn" onClick={toggleChat}>
              <FaTimes />
            </button>
          </div>

          <div className="chat-body">
            {messages.map((msg, idx) => {
              const isBot = msg.sender === "bot";
              return (
                <div key={idx} className={`message ${msg.sender}`}>
                  <div className="message-name">
                    {isBot && <img src={myImg} alt="Bot" className="message-avatar" />}
                    <span>{isBot ? BOT_NAME : USER_NAME}</span>
                  </div>
                  <div className={`message-text ${isBot ? "left" : "right"}`}>{msg.text}</div>
                </div>
              );
            })}

            {isTyping && (
              <div className="message bot">
                <img src={myImg} alt="Bot" className="message-avatar" />
                <div className="message-text typing">
                  <ThreeDots height="15" width="30" radius="9" color="#fff" />
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
            <button onClick={sendMessage}>
              <FaArrowRight />
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default ChatBot;
