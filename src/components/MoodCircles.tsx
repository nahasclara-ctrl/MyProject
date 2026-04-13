import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  type Circle,
  type Message,
  type MoodType,
  joinCircle,
  getCircleMessages,
  sendCircleMessage,
  subscribeToCircleMessages,
  leaveCircle,
  AppwriteError,
} from "@/lib/appwrite/circles";

// ============================================================
// CONSTANTS
// ============================================================

const MOODS: Record<MoodType, { emoji: string; color: string; label: string }> = {
  happy: { emoji: "😊", color: "#FFD93D", label: "Happy" },
  sad: { emoji: "😔", color: "#6B9BD1", label: "Sad" },
  stressed: { emoji: "😤", color: "#EF6B6B", label: "Stressed" },
  bored: { emoji: "😴", color: "#A9A9A9", label: "Bored" },
  chill: { emoji: "😎", color: "#95E1D3", label: "Chill" },
};

// ============================================================
// COMPONENT
// ============================================================

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
  // ========== STATE ==========
  const [currentCircle, setCurrentCircle] = useState<Circle | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [messageInput, setMessageInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ========== REFS ==========
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const unsubscribeRef = useRef<(() => void) | null>(null);
  const isJoiningRef = useRef(false); // Prevent duplicate join attempts

  // ========== EFFECTS ==========

  // Auto-join if initialMood provided
  useEffect(() => {
    if (initialMood && !currentCircle) {
      handleJoinCircle(initialMood);
    }
  }, [initialMood]);

  // Auto-scroll to latest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Cleanup subscription on unmount
  useEffect(() => {
    return () => {
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
        console.log("🔌 Unsubscribed from real-time messages");
      }
    };
  }, []);

  // ========== HANDLERS ==========

  /**
   * Join or create a circle for a specific mood
   */
  const handleJoinCircle = async (mood: MoodType) => {
    // Prevent double-clicking
    if (isJoiningRef.current || loading) return;
    isJoiningRef.current = true;
    setLoading(true);
    setError(null);

    try {
      console.log(`🎯 Attempting to join ${mood} circle...`);

      // Join circle
      const circle = await joinCircle(userId, mood);
      setCurrentCircle(circle);

      // Load existing messages
      const existingMessages = await getCircleMessages(circle.$id);
      setMessages(existingMessages);

      // Subscribe to new messages
      const unsubscribe = subscribeToCircleMessages(circle.$id, (newMessage) => {
        // Only add if not already in list (avoid duplicates)
        setMessages((prev) => {
          const exists = prev.some((m) => m.$id === newMessage.$id);
          return exists ? prev : [...prev, newMessage];
        });
      });

      unsubscribeRef.current = unsubscribe;
    } catch (err: unknown) {
      const errorMsg = err instanceof AppwriteError ? err.message : String(err);
      setError(errorMsg);
      console.error("❌ Failed to join circle:", err);
    } finally {
      isJoiningRef.current = false;
      setLoading(false);
    }
  };

  /**
   * Send a message to the circle
   */
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
      // Message will appear via real-time subscription
    } catch (err: unknown) {
      const errorMsg = err instanceof AppwriteError ? err.message : String(err);
      setError(errorMsg);
      console.error("❌ Failed to send message:", err);
      // Restore input on error
      setMessageInput(content);
    }
  };

  /**
   * Leave the current circle
   */
  const handleLeaveCircle = async () => {
    if (!currentCircle) return;

    try {
      // Unsubscribe first
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
        unsubscribeRef.current = null;
      }

      // Leave circle
      await leaveCircle(currentCircle.$id, userId);

      // Reset state
      setCurrentCircle(null);
      setMessages([]);
      setMessageInput("");
    } catch (err: unknown) {
      const errorMsg = err instanceof AppwriteError ? err.message : String(err);
      setError(errorMsg);
      console.error("❌ Failed to leave circle:", err);
    }
  };

  // ========== RENDER: MOOD SELECTION ==========

  if (!currentCircle) {
    return (
      <div className="p-6">
        <h2 className="text-xl font-bold mb-4">Pick your mood 🎭</h2>

        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            <strong>Error:</strong> {error}
            <button
              onClick={() => setError(null)}
              className="ml-2 text-sm underline"
            >
              Dismiss
            </button>
          </div>
        )}

        <div className="grid grid-cols-2 gap-3">
          {Object.entries(MOODS).map(([key, mood]) => (
            <button
              key={key}
              onClick={() => handleJoinCircle(key as MoodType)}
              disabled={loading}
              className={`p-4 rounded-lg text-white font-semibold flex flex-col items-center gap-1 transition-transform ${
                loading ? "opacity-50 cursor-not-allowed" : "hover:scale-105"
              }`}
              style={{ backgroundColor: mood.color }}
            >
              <div className="text-2xl">{mood.emoji}</div>
              {mood.label}
              {loading && <div className="text-xs">Loading...</div>}
            </button>
          ))}
        </div>
      </div>
    );
  }

  // ========== RENDER: CIRCLE CHAT ==========

  const moodInfo = MOODS[currentCircle.mood as MoodType];

  return (
    <div className="flex flex-col h-full bg-white rounded-lg shadow-lg overflow-hidden">
      {/* HEADER */}
      <div className="p-4 border-b bg-gray-50 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-3xl">{moodInfo.emoji}</span>
          <div>
            <h3 className="font-bold text-lg capitalize">{currentCircle.mood}</h3>
            <p className="text-sm text-gray-600">
              {currentCircle.currentMembers}/{currentCircle.maxMembers} people
            </p>
          </div>
        </div>
        <button
          onClick={handleLeaveCircle}
          className="px-3 py-1 text-sm bg-red-500 text-white rounded hover:bg-red-600 transition"
        >
          Leave
        </button>
      </div>

      {/* ERROR BANNER */}
      {error && (
        <div className="p-3 bg-red-100 border-b border-red-400 text-red-700 text-sm flex items-center justify-between">
          <span>{error}</span>
          <button
            onClick={() => setError(null)}
            className="text-red-700 font-bold"
          >
            ✕
          </button>
        </div>
      )}

      {/* MESSAGES */}
      <div className="flex-1 overflow-y-auto p-4 space-y-2 bg-gray-50">
        {messages.length === 0 ? (
          <div className="h-full flex items-center justify-center text-gray-400 text-center">
            <p>
              No messages yet. <br />
              <span className="text-sm">Be the first to say something!</span>
            </p>
          </div>
        ) : (
          messages.map((message) => (
            <div
              key={message.$id}
              className={`flex ${
                message.senderId === userId ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`max-w-xs px-4 py-2 rounded-lg ${
                  message.senderId === userId
                    ? "bg-blue-500 text-white rounded-br-none"
                    : "bg-white border border-gray-200 rounded-bl-none"
                }`}
              >
                {message.senderId !== userId && (
                  <div className="text-xs font-semibold mb-1 opacity-75">
                    {message.senderName}
                  </div>
                )}
                <div className="break-words">{message.content}</div>
                <div
                  className={`text-xs mt-1 ${
                    message.senderId === userId
                      ? "text-blue-100"
                      : "text-gray-400"
                  }`}
                >
                  {new Date(message.createdAt).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </div>
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* INPUT */}
      <form
        onSubmit={handleSendMessage}
        className="p-4 border-t bg-white flex gap-2"
      >
        <input
          value={messageInput}
          onChange={(e) => setMessageInput(e.target.value)}
          disabled={loading}
          className="flex-1 border border-gray-300 p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
          placeholder="Say something..."
        />
        <button
          type="submit"
          disabled={loading || !messageInput.trim()}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-400 transition font-semibold"
        >
          Send
        </button>
      </form>
    </div>
  );
};

export default MoodCircles;