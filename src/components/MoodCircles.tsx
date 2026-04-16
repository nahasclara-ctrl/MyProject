import React, { useState, useEffect, useRef } from "react";
import {
  type Circle,
  type Message,
  type MoodType,
  joinCircle,
  getCircleMessages,
  sendCircleMessage,
  subscribeToCircleMessages,
  leaveCircle,
} from "@/lib/appwrite/circles";

const P = {
  50: "#f6fbf8",
  100: "#eaf5ef",
  200: "#d6ebe0",
  300: "#b7dcc8",
  400: "#7bbf9a",
  500: "#4f9f75",
  600: "#3f8a63",
  700: "#2f6e4f",
};

const MOODS: Record<MoodType, { emoji: string; color: string; label: string }> = {
  happy: { emoji: "😊", color: P[500], label: "Happy" },
  sad: { emoji: "😔", color: P[600], label: "Sad" },
  stressed: { emoji: "😤", color: "#ef4444", label: "Stressed" },
  bored: { emoji: "😴", color: P[400], label: "Bored" },
  chill: { emoji: "😎", color: P[500], label: "Chill" },
};

interface MoodCirclesProps {
  userId: string;
  userDisplayName: string;
  initialMood?: MoodType;
}

const MoodCircles: React.FC<MoodCirclesProps> = ({
  userId,
  userDisplayName,
  initialMood,
}) => {
  const [currentCircle, setCurrentCircle] = useState<Circle | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [messageInput, setMessageInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const unsubscribeRef = useRef<(() => void) | null>(null);
  const isJoiningRef = useRef(false);

  useEffect(() => {
    if (initialMood && !currentCircle) {
      handleJoinCircle(initialMood);
    }
  }, [initialMood]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    return () => {
      if (unsubscribeRef.current) unsubscribeRef.current();
    };
  }, []);

  const handleJoinCircle = async (mood: MoodType) => {
    if (isJoiningRef.current || loading) return;
    isJoiningRef.current = true;
    setLoading(true);
    setError(null);

    try {
      const circle = await joinCircle(userId, mood);
      setCurrentCircle(circle);

      const existingMessages = await getCircleMessages(circle.$id);
      setMessages(existingMessages);

      const unsubscribe = subscribeToCircleMessages(circle.$id, (newMessage) => {
        setMessages((prev) => {
          const exists = prev.some((m) => m.$id === newMessage.$id);
          return exists ? prev : [...prev, newMessage];
        });
      });

      unsubscribeRef.current = unsubscribe;
    } catch (err) {
      setError(String(err));
    } finally {
      isJoiningRef.current = false;
      setLoading(false);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageInput.trim() || !currentCircle || loading) return;

    const content = messageInput.trim();
    setMessageInput("");

    try {
      await sendCircleMessage(
        currentCircle.$id,
        userId,
        userDisplayName,
        content
      );
    } catch (err) {
      setError(String(err));
      setMessageInput(content);
    }
  };

  const handleLeaveCircle = async () => {
    if (!currentCircle) return;

    try {
      if (unsubscribeRef.current) unsubscribeRef.current();

      await leaveCircle(currentCircle.$id, userId);

      setCurrentCircle(null);
      setMessages([]);
      setMessageInput("");
    } catch (err) {
      setError(String(err));
    }
  };

  // ============================================================
  // MOOD SELECTION
  // ============================================================

  if (!currentCircle) {
    return (
      <div style={{ padding: 24, background: P[50], minHeight: "100vh" }}>
        <h2 style={{ fontSize: 20, fontWeight: 800, marginBottom: 16, color: P[700] }}>
          Pick your mood 🎭
        </h2>

        {error && (
          <div
            style={{
              background: "#fee2e2",
              padding: 10,
              borderRadius: 10,
              marginBottom: 12,
            }}
          >
            {error}
          </div>
        )}

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          {Object.entries(MOODS).map(([key, mood]) => (
            <button
              key={key}
              onClick={() => handleJoinCircle(key as MoodType)}
              disabled={loading}
              style={{
                background: mood.color,
                color: "white",
                border: "none",
                borderRadius: 14,
                padding: 14,
                cursor: "pointer",
                fontWeight: 700,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 4,
                boxShadow: `0 4px 14px ${P[200]}`,
              }}
            >
              <span style={{ fontSize: 22 }}>{mood.emoji}</span>
              {mood.label}
            </button>
          ))}
        </div>
      </div>
    );
  }

  const moodInfo = MOODS[currentCircle.mood as MoodType];

  // ============================================================
  // CHAT UI
  // ============================================================

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        background: P[50],
      }}
    >
      {/* HEADER */}
      <div
        style={{
          padding: 14,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          background: "#ffffff",
          borderBottom: `1px solid ${P[200]}`,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ fontSize: 26 }}>{moodInfo.emoji}</span>

          <div>
            <div style={{ fontWeight: 800, color: P[700] }}>
              {currentCircle.mood}
            </div>
            <div style={{ fontSize: 12, color: P[500] }}>
              {currentCircle.currentMembers} members
            </div>
          </div>
        </div>

        <button
          onClick={handleLeaveCircle}
          style={{
            background: "#ef4444",
            color: "white",
            border: "none",
            borderRadius: 10,
            padding: "6px 10px",
            fontWeight: 700,
            cursor: "pointer",
          }}
        >
          Leave
        </button>
      </div>

      {/* MESSAGES */}
      <div style={{ flex: 1, padding: 14, overflowY: "auto" }}>
        {messages.map((message) => {
          const isMe = message.senderId === userId;

          return (
            <div
              key={message.$id}
              style={{
                display: "flex",
                justifyContent: isMe ? "flex-end" : "flex-start",
                marginBottom: 10,
              }}
            >
              <div
                style={{
                  maxWidth: 260,
                  padding: 10,
                  borderRadius: 14,
                  background: isMe ? P[500] : "#ffffff",
                  color: isMe ? "white" : P[700],
                  border: isMe ? "none" : `1px solid ${P[200]}`,
                  boxShadow: `0 4px 14px ${P[100]}`,
                }}
              >
                {message.content}
              </div>
            </div>
          );
        })}

        <div ref={messagesEndRef} />
      </div>

      {/* INPUT */}
      <form
        onSubmit={handleSendMessage}
        style={{
          display: "flex",
          gap: 8,
          padding: 12,
          background: "#ffffff",
          borderTop: `1px solid ${P[200]}`,
        }}
      >
        <input
          value={messageInput}
          onChange={(e) => setMessageInput(e.target.value)}
          style={{
            flex: 1,
            padding: 10,
            borderRadius: 12,
            border: `1px solid ${P[200]}`,
            outline: "none",
          }}
          placeholder="Say something..."
        />

        <button
          type="submit"
          style={{
            background: P[500],
            color: "white",
            border: "none",
            borderRadius: 12,
            padding: "10px 14px",
            fontWeight: 700,
            cursor: "pointer",
          }}
        >
          Send
        </button>
      </form>
    </div>
  );
};

export default MoodCircles;