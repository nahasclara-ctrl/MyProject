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

// Distinct, accessible colors for anonymous users
const USER_COLORS = [
  { bg: "#4f9f75", text: "#ffffff", bubble: "#eaf5ef", bubbleText: "#2f6e4f" }, // green
  { bg: "#6B9BD1", text: "#ffffff", bubble: "#EBF2FA", bubbleText: "#2D5A8E" }, // blue
  { bg: "#E07B5A", text: "#ffffff", bubble: "#FAEEE9", bubbleText: "#8A3A1E" }, // orange
  { bg: "#9B6BB5", text: "#ffffff", bubble: "#F2EBF8", bubbleText: "#5A2E7A" }, // purple
  { bg: "#D4A84B", text: "#ffffff", bubble: "#FBF5E6", bubbleText: "#7A5510" }, // amber
  { bg: "#5AACB5", text: "#ffffff", bubble: "#E8F7F8", bubbleText: "#1E6870" }, // teal
  { bg: "#D46B8A", text: "#ffffff", bubble: "#FAEDF2", bubbleText: "#8A2A4A" }, // pink
  { bg: "#7BA67B", text: "#ffffff", bubble: "#EDF4ED", bubbleText: "#2E5A2E" }, // sage
];

// Deterministic color index from userId string
function getUserColorIndex(userId: string): number {
  let hash = 0;
  for (let i = 0; i < userId.length; i++) {
    hash = (hash * 31 + userId.charCodeAt(i)) >>> 0;
  }
  return hash % USER_COLORS.length;
}

function getUserColor(userId: string) {
  return USER_COLORS[getUserColorIndex(userId)];
}

// Build a stable map of senderId -> short anonymous label within a circle
function buildMemberLabels(messages: Message[], myUserId: string): Record<string, string> {
  const seen: string[] = [];
  for (const m of messages) {
    if (!seen.includes(m.senderId) && m.senderId !== myUserId) {
      seen.push(m.senderId);
    }
  }
  const labels: Record<string, string> = {};
  seen.forEach((id, i) => {
    labels[id] = `Member ${i + 1}`;
  });
  return labels;
}

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

  // Build anon labels from current messages
  const memberLabels = buildMemberLabels(messages, userId);

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

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        background: P[50],
      }}
    >
      {/* Header */}
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

      {/* Messages */}
      <div style={{ flex: 1, padding: 14, overflowY: "auto" }}>
        {messages.map((message) => {
          const isMe = message.senderId === userId;
          const color = getUserColor(message.senderId);
          // Label: "You" for self, "Anon N" for others
          const label = isMe ? "You" : (memberLabels[message.senderId] ?? "Member");

          return (
            <div
              key={message.$id}
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: isMe ? "flex-end" : "flex-start",
                marginBottom: 12,
              }}
            >
              {/* Avatar dot + label */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 5,
                  marginBottom: 3,
                  flexDirection: isMe ? "row-reverse" : "row",
                }}
              >
                {/* Colored dot */}
                <div
                  style={{
                    width: 10,
                    height: 10,
                    borderRadius: "50%",
                    background: color.bg,
                    flexShrink: 0,
                  }}
                />
                <span
                  style={{
                    fontSize: 11,
                    fontWeight: 700,
                    color: color.bg,
                    letterSpacing: "0.02em",
                  }}
                >
                  {label}
                </span>
              </div>

              {/* Bubble */}
              <div
                style={{
                  maxWidth: 260,
                  padding: "9px 13px",
                  borderRadius: isMe ? "16px 4px 16px 16px" : "4px 16px 16px 16px",
                  background: isMe ? color.bg : color.bubble,
                  color: isMe ? color.text : color.bubbleText,
                  border: isMe ? "none" : `1.5px solid ${color.bg}33`,
                  boxShadow: `0 2px 10px ${color.bg}22`,
                  fontSize: 14,
                  lineHeight: 1.5,
                }}
              >
                {message.content}
              </div>
            </div>
          );
        })}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
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