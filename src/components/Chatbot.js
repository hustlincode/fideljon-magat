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
          "intro_message": "Hi there! 👋 Thanks for visiting my portfolio. Feel free to ask me anything about programming, web development, or my experiences in tech.",
          "fallback_message": "I can only talk about my programming knowledge, skills, projects, and professional experiences. 😊 Feel free to ask me about web development, software engineering, or my journey in tech!",
          "personal_info": {
            "name": "Fidel Jon Magat",
            "title": "Junior Software Developer",
            "location": "Angeles City, Pampanga, Philippines",
            "email": "magatfideljon@gmail.com",
            "phone": "+63 994-238-7240",
            "degree": "BS Information Technology",
            "university": "Pampanga State Agricultural University",
            "graduation_year": 2024
          },
          "professional_summary": "I am a motivated and adaptable Junior Software Developer with hands-on experience in full-stack development. I specialize in PHP, JavaScript, and MySQL, and I have built scalable systems with QR integration, Chart.js analytics, and CI/CD workflows. I am passionate about delivering clean, maintainable code and contributing to dynamic teams.",
          "skillset": {
            "languages_frameworks": [
              "PHP",
              "JavaScript",
              "Node.js",
              "React.js",
              "Next.js",
              "TypeScript",
              "C#",
              ".NET",
              "jQuery",
              "AJAX",
              "Bootstrap"
            ],
            "databases": ["MySQL", "DynamoDB"],
            "cloud_platforms": ["AWS (Lambda, DynamoDB)", "Azure DevOps"],
            "tools": ["Git", "GitHub", "VS Code", "Postman", "Chart.js"],
            "operating_systems": ["Windows"]
          },
          "career_journey": [
            {
              "year": "2025",
              "role": "Junior Software Developer",
              "company": "Servo IT Solutions OPC"
            },
            {
              "year": "2024-2025",
              "role": "Associate Software Developer",
              "company": "Servo IT Solutions OPC"
            },
            {
              "year": "2024 (Feb–May)",
              "role": "Software Developer Intern",
              "company": "Servo IT Solutions OPC"
            },
            {
              "year": "2024",
              "role": "Bachelor of Science in Information Technology",
              "company": "Pampanga State Agricultural University"
            },
            {
              "year": "2021",
              "role": "Hello World! 👋",
              "company": "Wrote my first line of code"
            }
          ],
          "projects": [
            {
              "name": "Salesportal | Banquet Sales Management",
              "stack": ["PHP", "MySQL", "Bootstrap", "HTML", "jQuery"],
              "features": [
                "User authentication",
                "Product management",
                "Order processing",
                "Real-time updates"
              ],
              "impact": "I improved performance and reduced downtime by 20%."
            },
            {
              "name": "XOLF | Online Check-in System",
              "stack": ["React", "Node.js", "AWS Lambda", "DynamoDB"],
              "features": [
                "User authentication",
                "Booking management",
                "Real-time updates"
              ]
            },
            {
              "name": "SLFreemed | Medicine Inventory (Capstone Project)",
              "stack": ["PHP", "MySQL", "HTML", "CSS", "JavaScript"],
              "features": [
                "Stock management",
                "QR prescriptions",
                "Report generation"
              ]
            }
          ],
          "contributions": [
            "I built backend APIs in C#, .NET, and PHP to support business operations.",
            "I integrated a CAS (Compliance Accounting System) with PHP, JS, AJAX, and REST APIs.",
            "I designed CI/CD pipelines that reduced deployment time by 50%.",
            "I improved UI performance with React and TypeScript."
          ],
          "personal_traits": [
            "Strong problem-solving and collaboration skills",
            "Fast learner, adaptable, and resilient",
            "Passionate about web technologies and cloud-based solutions"
          ]
        }`,
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
                  <span className="online-dot"></span> Online · Powered by Google Gemini
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
