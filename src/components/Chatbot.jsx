import React, { useState, useRef, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { ThreeDots } from "react-loader-spinner";
import { FaArrowRight, FaTimes, FaMicrophone, FaStop } from "react-icons/fa";
import aetherAvatar from "../Assets/aether-avatar.svg";
import chatbotData from "../config/chatbotConfig.json";
import "../Chatbot.css";
import useSpeechRecognition from "../hooks/useSpeechRecognition";

const BOT_NAME = "Aether";
const OWNER_NAME = "Fideljon";

const LIMITS = {
  PER_MINUTE: 2,
  PER_DAY: 10,
  COOLDOWN_MS: 5 * 60 * 1000,
  MAX_CHARS: 500,
  MAX_EXCHANGES: 8,
};

const RL_STORAGE_KEY = "aether_rate_limits";

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const loadLimitState = () => {
  const today = new Date().toDateString();
  try {
    const raw = JSON.parse(window.localStorage.getItem(RL_STORAGE_KEY)) || {};
    const sameDay = raw.day === today;
    return {
      day: today,
      dayCount: sameDay ? raw.dayCount || 0 : 0,
      timestamps: Array.isArray(raw.timestamps) ? raw.timestamps : [],
      blockedUntil: typeof raw.blockedUntil === "number" ? raw.blockedUntil : 0,
    };
  } catch {
    return { day: today, dayCount: 0, timestamps: [], blockedUntil: 0 };
  }
};

const saveLimitState = (state) => {
  try {
    window.localStorage.setItem(RL_STORAGE_KEY, JSON.stringify(state));
  } catch {}
};

const getTimeGreeting = () => {
  const h = new Date().getHours();
  if (h < 12) return "Good morning!";
  if (h < 18) return "Good afternoon!";
  return "Good evening!";
};

const detectVisitorType = (text) => {
  const t = text.toLowerCase();
  if (/\b(hire|hiring|recruit|recruiting|vacanc|job|position|role|opportunit|resume|\bcv\b)\w*\b/.test(t)) return "recruiter";
  if (/(\bmy|\bour|\ba new|\ban existing)\b.{0,24}\b(project|website|web ?app|app|application|system|platform|saas|tool)\b/.test(t)) return "client";
  if (/\b(budget|quote|quotation|proposal|pricing|rates?|freelance|consult)\w*\b/.test(t)) return "client";
  if (/\b(collaborat|open.?source|contribute|team.?up|partner)\w*\b/.test(t)) return "developer";
  if (/just (browsing|looking around|exploring)|nothing specific/.test(t)) return "browsing";
  return null;
};

const detectTopics = (text) => {
  const t = text.toLowerCase();
  const topics = [];
  if (/\b(about|background|experience|career|who is|introduce|yourself)\b/.test(t)) topics.push("about");
  if (/\b(design|architect|approach|standards?)\b/.test(t)) topics.push("design");
  if (/\bai\b|artificial intelligence|day.to.day|automation/.test(t)) topics.push("ai");
  return topics;
};

const isRateLimitError = (error) =>
  error?.status === 429 ||
  String(error?.message || "").includes("429") ||
  String(error?.message || "").includes("RESOURCE_EXHAUSTED") ||
  String(error?.message || "").toLowerCase().includes("quota");

// 502/503 mean the model is momentarily overloaded or unreachable, which is
// worth a retry rather than showing the visitor an error.
const isTransientError = (error) =>
  error?.status === 502 || error?.status === 503 || isRateLimitError(error);

const ChatBot = () => {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [closing, setClosing] = useState(false);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [visitorType, setVisitorType] = useState(null);
  const [coveredTopics, setCoveredTopics] = useState([]);
  const [projectScopeAsked, setProjectScopeAsked] = useState(false);
  const [, setCooldownTick] = useState(0);

  const messagesEndRef = useRef(null);
  const historyRef = useRef([]);
  const limitRef = useRef(loadLimitState());
  const nudgedRef = useRef(false);
  const visitorTypeRef = useRef(null);
  const coveredRef = useRef([]);
  const autoSendTimeoutRef = useRef(null);
  const inputRef = useRef(null);
  const sendMessageRef = useRef(null);

  const {
    isSupported: isSTTSupported,
    isListening,
    transcript,
    interimTranscript,
    error: sttError,
    startListening,
    stopListening,
    resetTranscript,
  } = useSpeechRecognition({ lang: "en-US" });

  const greetingText = useMemo(
    () =>
      `${getTimeGreeting()} I'm ${BOT_NAME} — ${OWNER_NAME}'s AI Assistant. I can tell you about his background, how he approaches system design and architecture, or how he uses AI in his day-to-day engineering work. What would you like to know?`,
    []
  );

  const [messages, setMessages] = useState([{ sender: "bot", text: greetingText }]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages, isTyping]);

  useEffect(() => {
    if (!isOpen) return undefined;
    const interval = setInterval(() => {
      const remaining = limitRef.current.blockedUntil - Date.now();
      if (remaining <= 0 && limitRef.current.blockedUntil !== 0) {
        limitRef.current.blockedUntil = 0;
        saveLimitState(limitRef.current);
      }
      setCooldownTick((t) => t + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [isOpen]);

  // Surface STT errors as bot message (ignore transient no-speech while still listening - auto-restart will handle)
  useEffect(() => {
    if (!sttError) return;
    if (sttError === "not-allowed" || sttError === "service-not-allowed") {
      addMessage("bot", "Mic blocked — please allow microphone access in your browser settings and reload, then tap mic again.");
    } else if (sttError === "no-speech") {
      // only surface if not still listening (hook auto-restarts once if shouldListen)
      if (!isListening) {
        addMessage("bot", "Didn't catch that — try tapping the mic again and speaking clearly.");
      }
    } else if (sttError === "audio-capture") {
      addMessage("bot", "No microphone found — check your device audio input and that no other app is using the mic.");
    } else if (sttError === "not-supported") {
      addMessage("bot", "Voice input isn't supported in this browser — try Chrome or Edge on desktop.");
    } else if (sttError === "network") {
      const online = typeof navigator !== "undefined" ? navigator.onLine : true;
      if (!online) {
        addMessage("bot", "You're offline — voice needs internet (Chrome sends audio to Google). Reconnect and tap mic again.");
      } else {
        addMessage(
          "bot",
          "Voice service unreachable — Chrome couldn't reach Google's speech servers. Check: 1) internet is stable, 2) no VPN/firewall/ad-blocker blocking google.com or speech.googleapis.com, 3) you're on HTTPS (or http://localhost), 4) try reloading. Retrying in 1s or tap mic again. You can also type instead."
        );
      }
    }
    console.warn("[Chatbot STT error]", sttError, "online:", typeof navigator !== "undefined" ? navigator.onLine : "unknown", "isSecureContext:", typeof window !== "undefined" ? window.isSecureContext : "unknown");
  }, [sttError, isListening]);

  // Cleanup auto-send on unmount
  useEffect(() => () => {
    if (autoSendTimeoutRef.current) clearTimeout(autoSendTimeoutRef.current);
  }, []);

  const toggleClose = () => {
    if (isListening) {
      try { stopListening(); } catch {}
    }
    if (autoSendTimeoutRef.current) {
      clearTimeout(autoSendTimeoutRef.current);
      autoSendTimeoutRef.current = null;
    }
    setClosing(true);
    setTimeout(() => {
      setIsOpen(false);
      setClosing(false);
    }, 300);
  };

  const goToContact = (e) => {
    e.preventDefault();
    toggleClose();
    if (window.location.pathname !== "/") {
      navigate("/");
    }
    setTimeout(() => {
      const el = document.getElementById("contact");
      if (el) {
        el.scrollIntoView({ behavior: "smooth" });
      } else {
        window.location.hash = "#contact";
      }
    }, 400);
  };

  const exchangeCount = messages.filter((m) => m.sender === "user").length;

  const addMessage = (sender, text, link) => {
    setMessages((prev) => [...prev, link ? { sender, text, link } : { sender, text }]);
  };

  const checkRateLimit = () => {
    const now = Date.now();
    const state = limitRef.current;
    if (state.blockedUntil && state.blockedUntil > now) {
      return { ok: false, reason: "cooldown", until: state.blockedUntil };
    }
    if (state.day !== new Date().toDateString()) {
      limitRef.current = { ...loadLimitState(), day: new Date().toDateString(), dayCount: 0 };
    }
    const current = limitRef.current;
    current.timestamps = current.timestamps.filter((t) => now - t < 60000);
    if (current.timestamps.length >= LIMITS.PER_MINUTE) {
      current.blockedUntil = now + LIMITS.COOLDOWN_MS;
      saveLimitState(current);
      return { ok: false, reason: "minute" };
    }
    if (current.dayCount >= LIMITS.PER_DAY) {
      return { ok: false, reason: "day" };
    }
    return { ok: true };
  };

  const recordMessageSent = () => {
    const state = limitRef.current;
    const today = new Date().toDateString();
    if (state.day !== today) {
      state.day = today;
      state.dayCount = 0;
      state.timestamps = [];
    }
    state.timestamps.push(Date.now());
    state.dayCount += 1;
    saveLimitState(state);
  };

  const updateProfileFromMessage = (text) => {
    const detectedType = detectVisitorType(text);
    if (detectedType && !visitorTypeRef.current) {
      visitorTypeRef.current = detectedType;
      setVisitorType(detectedType);
    }
    const topics = detectTopics(text).filter((t) => !coveredRef.current.includes(t));
    if (topics.length > 0) {
      coveredRef.current = [...coveredRef.current, ...topics];
      setCoveredTopics(coveredRef.current);
    }
  };

  const maybeNudgeContact = () => {
    if (nudgedRef.current || exchangeCount < LIMITS.MAX_EXCHANGES) return;
    nudgedRef.current = true;
    addMessage(
      "bot",
      `We've covered a lot! If you'd like a direct answer from ${OWNER_NAME} himself, leave your details in the contact form below or email him directly.`,
      { href: "#contact", label: "Go to contact form" }
    );
  };

  // Streams a reply from our own /api/chat endpoint. The Gemini key lives only
  // on the server, so nothing sensitive is reachable from the browser.
  const streamReply = async (contents, visitor, onText) => {
    const response = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ contents, visitor }),
    });

    if (!response.ok) {
      let detail = "";
      try {
        detail = (await response.json())?.error || "";
      } catch {
        // Non-JSON body; the status alone is enough to classify the failure.
      }
      const error = new Error(detail || `Request failed (${response.status})`);
      error.status = response.status;
      if (response.status === 429) error.rateLimited = true;
      throw error;
    }

    if (!response.body) throw new Error("Streaming is not supported in this browser.");

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";

    const consume = (frames) => {
      for (const frame of frames) {
        // Reassemble multi-line "data:" payloads before parsing.
        const payload = frame
          .split("\n")
          .filter((line) => line.startsWith("data:"))
          .map((line) => line.slice(5).replace(/^ /, ""))
          .join("");

        if (!payload || payload === "[DONE]") continue;

        let parsed;
        try {
          parsed = JSON.parse(payload);
        } catch {
          continue;
        }

        if (typeof parsed?.t === "string") onText(parsed.t);
        if (typeof parsed?.error === "string") throw new Error(parsed.error);
      }
    };

    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });

      // SSE frames may be separated by CRLF, so normalise before splitting on
      // the blank line. Without this, no boundary is found and every event is
      // dropped, producing an empty reply.
      buffer = buffer.replace(/\r\n/g, "\n").replace(/\r/g, "\n");

      const frames = buffer.split("\n\n");
      buffer = frames.pop() ?? "";
      consume(frames);
    }

    if (buffer) consume([buffer]);
  };

  const sendToGemini = async (userInput) => {
    setIsTyping(true);
    historyRef.current.push({ role: "user", parts: [{ text: userInput }] });

    let reply = "";
    let started = false;
    let attempt = 0;

    const appendChunk = (chunkText) => {
      reply += chunkText;
      const snapshot = reply;
      setMessages((prev) => {
        const next = [...prev];
        next[next.length - 1] = { sender: "bot", text: snapshot };
        return next;
      });
    };

    while (true) {
      try {
        const contents = historyRef.current.slice(-16);
        const visitor = {
          type: visitorTypeRef.current,
          covered: coveredRef.current,
        };

        await streamReply(contents, visitor, (chunkText) => {
          if (!started) {
            started = true;
            setIsTyping(false);
            addMessage("bot", "");
          }
          appendChunk(chunkText);
        });

        if (!started) {
          setIsTyping(false);
          addMessage(
            "bot",
            `I'm best at answering questions about ${OWNER_NAME}'s background, engineering approach, and AI experience — want to ask about one of those?`
          );
        } else {
          historyRef.current.push({ role: "model", parts: [{ text: reply }] });
          maybeNudgeContact();
        }
        setIsTyping(false);
        return;
      } catch (error) {
        if (isTransientError(error) && attempt < 3) {
          attempt += 1;
          await sleep(1000 * 2 ** (attempt - 1));
          continue;
        }
        console.error("Error talking to the assistant:", error);
        setIsTyping(false);
        if (isRateLimitError(error)) {
          addMessage(
            "bot",
            "Aether's hit today's message limit — thanks for understanding! Feel free to come back later, or leave your details and Fideljon will follow up directly.",
            { href: "#contact", label: "Leave your details" }
          );
        } else {
          addMessage("bot", "Oops! Something went wrong on my end. Mind trying that again?");
        }
        return;
      }
    }
  };

  const handleInputChange = (e) => {
    if (autoSendTimeoutRef.current) {
      clearTimeout(autoSendTimeoutRef.current);
      autoSendTimeoutRef.current = null;
    }
    setInput(e.target.value);
  };

  const handleMicClick = () => {
    if (autoSendTimeoutRef.current) {
      clearTimeout(autoSendTimeoutRef.current);
      autoSendTimeoutRef.current = null;
    }
    // stop listening before starting a fresh capture
    if (isListening) {
      stopListening();
    } else {
      resetTranscript();
      startListening();
    }
  };

  const sendMessage = (rawText) => {
    const text = (typeof rawText === "string" ? rawText : input).trim();
    if (!text || isTyping) return;
    if (text.length > LIMITS.MAX_CHARS) return;
    if (!isOpen) return;
    if (isListening) {
      try { stopListening(); } catch {}
    }
    if (autoSendTimeoutRef.current) {
      clearTimeout(autoSendTimeoutRef.current);
      autoSendTimeoutRef.current = null;
    }
    try { resetTranscript(); } catch {}

    const gate = checkRateLimit();
    if (!gate.ok) {
      if (gate.reason === "cooldown") {
        const mins = Math.ceil((gate.until - Date.now()) / 60000);
        addMessage("bot", `You've reached the message limit for now — try again in ~${mins} more minute${mins === 1 ? "" : "s"}, or reach Fideljon via the contact form and he'll follow up directly.`);
      } else if (gate.reason === "minute") {
        addMessage("bot", "You're sending those fast! Give me about 5 minutes to catch up — or use the contact form below and Fideljon will get back to you directly.");
      } else {
        addMessage(
          "bot",
          "You've reached today's message limit — I really appreciate the great conversation though! Leave your contact info below and Fideljon will be happy to continue this personally.",
          { href: "#contact", label: "Leave your details" }
        );
      }
      setInput("");
      return;
    }

    recordMessageSent();

    if (/^(web app \/ website project|ai integration project|something else)$/i.test(text)) {
      setProjectScopeAsked(true);
    }

    updateProfileFromMessage(text);
    addMessage("user", text);
    setInput("");
    sendToGemini(text);
  };

  // keep ref in sync for hybrid effect (A3)
  useEffect(() => {
    sendMessageRef.current = sendMessage;
  });

  // A3 Hybrid + B1 Live: when final transcript arrives, fill input and auto-send after 800ms (cancel if user edits)
  // Also handles interim promotion fallback if onend promoted interim->transcript
  useEffect(() => {
    if (isListening) return;
    const finalText = (transcript || interimTranscript).trim();
    if (!finalText) return;
    const clipped = finalText.slice(0, LIMITS.MAX_CHARS);
    setInput(clipped);
    setTimeout(() => inputRef.current?.focus(), 50);
    if (autoSendTimeoutRef.current) clearTimeout(autoSendTimeoutRef.current);
    autoSendTimeoutRef.current = setTimeout(() => {
      autoSendTimeoutRef.current = null;
      if (sendMessageRef.current) sendMessageRef.current(clipped);
      try { resetTranscript(); } catch {}
    }, 800);
  }, [transcript, interimTranscript, isListening, resetTranscript]);

  const getSuggestions = () => {
    if (!isOpen || isTyping) return [];
    const ex = exchangeCount;
    if (ex >= LIMITS.MAX_EXCHANGES + 1) return [];

    if (ex === 0 && !visitorType) {
      return chatbotData.conversation_starters.map((s) => s.label);
    }
    if (visitorType === "client" && !projectScopeAsked) {
      return chatbotData.follow_up_prompts.client;
    }
    for (const topic of ["design", "ai", "about"]) {
      if (coveredTopics.includes(topic)) {
        return chatbotData.follow_up_prompts[topic];
      }
    }
    if (!visitorType && ex > 0) {
      return ["I'm hiring", "I need a project built", "Just exploring"];
    }
    if (visitorType && chatbotData.qualifying_questions[visitorType]) {
      return chatbotData.qualifying_questions[visitorType].slice(0, 3);
    }
    return [];
  };

  const suggestions = getSuggestions();
  const cooldownActive = limitRef.current.blockedUntil > Date.now();
  const inputDisabled = cooldownActive;

  return (
    <>
      <button
        className={`chat-toggle ${isOpen ? "is-open" : ""}`}
        onClick={() => {
          if (isOpen) toggleClose();
          else setIsOpen(true);
        }}
        aria-label={isOpen ? "Close chat with Aether" : "Open chat with Aether"}
      >
        <img src={aetherAvatar} alt="" className="chat-toggle-avatar" />
        {isOpen ? "Hide Aether" : "Chat with Aether"}
      </button>

      {isOpen && (
        <div className={`chat-window ${closing ? "fade-out" : "fade-in"}`} role="dialog" aria-label={`Chat with ${BOT_NAME}`}>
          <div className="chat-header">
            <div className="chat-header-profile">
              <img src={aetherAvatar} alt={`${BOT_NAME} avatar`} className="bot-avatar" />
              <div className="chat-header-info">
                <h5>Chat with {BOT_NAME}</h5>
                <span className="status">
                  <span className="online-dot"></span> Online · AI Assistant · Powered by Gemini
                  {isSTTSupported && isListening && <span className="voice-status"> · Listening...</span>}
                </span>
              </div>
            </div>
            <div className="chat-header-actions">
              <button className="close-btn" onClick={toggleClose} aria-label="Close chat">
                <FaTimes />
              </button>
            </div>
          </div>

          <div className="chat-body" aria-live="polite">
            {messages.map((msg, idx) => {
              const isBot = msg.sender === "bot";
              return (
                <div key={idx} className={`message ${msg.sender}`}>
                  <div className="message-name">
                    {isBot && <img src={aetherAvatar} alt="" className="message-avatar" />}
                    <span>{isBot ? BOT_NAME : "You"}</span>
                  </div>
                  <div className={`message-text ${isBot ? "left" : "right"}`}>
                    {msg.text}
                    {msg.link && (
                      <a href={msg.link.href} className="message-link" onClick={goToContact}>
                        {msg.link.label}
                      </a>
                    )}
                  </div>
                </div>
              );
            })}

            {isTyping && (
              <div className="message bot">
                <img src={aetherAvatar} alt="" className="message-avatar" />
                <div className="message-text typing">
                  <ThreeDots height="15" width="30" radius="9" color="#f5f5f3" />
                </div>
              </div>
            )}

            {suggestions.length > 0 && (
              <div className="suggestion-row">
                {suggestions.map((label) => (
                  <button
                    key={label}
                    className="suggestion-chip"
                    onClick={() => sendMessage(label)}
                    disabled={inputDisabled}
                  >
                    {label}
                  </button>
                ))}
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="chat-footer">
            <input
              ref={inputRef}
              type="text"
              placeholder={
                isListening
                  ? "Listening — speak now..."
                  : inputDisabled
                  ? "Cooling down — try again shortly..."
                  : isSTTSupported
                  ? `Ask ${BOT_NAME} anything or tap mic...`
                  : `Ask ${BOT_NAME} anything...`
              }
              value={isListening ? interimTranscript || transcript || input : input || transcript || interimTranscript}
              maxLength={LIMITS.MAX_CHARS}
              disabled={inputDisabled}
              onChange={handleInputChange}
              onKeyDown={(e) => e.key === "Enter" && sendMessage()}
              aria-label="Message"
              className={isListening ? "listening" : transcript || interimTranscript ? "has-voice-preview" : ""}
            />
            {isSTTSupported ? (
              <button
                className={`mic-btn ${isListening ? "listening" : ""}`}
                onClick={handleMicClick}
                disabled={isTyping}
                aria-label={isListening ? "Stop listening" : "Start voice input"}
                title={
                  isListening
                    ? "Stop listening"
                    : inputDisabled
                    ? "Cooling down — but you can still speak to queue"
                    : "Tap to speak"
                }
                type="button"
              >
                {isListening ? <FaStop /> : <FaMicrophone />}
              </button>
            ) : (
              <span className="mic-unsupported" title="Voice not supported in this browser">🎙️</span>
            )}
            <button onClick={() => sendMessage()} disabled={inputDisabled || (!input.trim() && !transcript.trim() && !interimTranscript.trim())} aria-label="Send message" className="send-btn">
              <FaArrowRight />
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default ChatBot;
