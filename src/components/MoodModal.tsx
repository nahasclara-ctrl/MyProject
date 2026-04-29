import { useState } from "react";
import MoodCircles from "@/components/MoodCircles";

type MoodType = "happy" | "sad" | "stressed" | "bored" | "chill";

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
  sad: { emoji: "😔", color: "#6B9BD1", label: "Sad" },
  stressed: { emoji: "😤", color: "#EF6B6B", label: "Stressed" },
  bored: { emoji: "😴", color: "#A9A9A9", label: "Bored" },
  chill: { emoji: "😎", color: P[400], label: "Chill" },
};

interface Props {
  userId: string;
  userDisplayName: string;
}

export default function MoodModal({ userId, userDisplayName }: Props) {
  const [selectedMood, setSelectedMood] = useState<MoodType | null>(null);
  const [open, setOpen] = useState(true);

  const handleClose = () => {
    sessionStorage.setItem("moodModalSeen", "true");
    setOpen(false);
  };

  const handleMoodSelect = (mood: MoodType) => {
    sessionStorage.setItem("moodModalSeen", "true");
    setSelectedMood(mood);
  };

  // Closed entirely
  if (!open) return null;

  // Mood selected → show the chat
  if (selectedMood) {
    return (
      <div className="fixed inset-0 flex items-center justify-center z-50">
        <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" onClick={handleClose} />
        <div
          className="relative rounded-3xl overflow-hidden shadow-2xl"
          style={{ width: 360, height: 560, background: P[50] }}
        >
          {/* X button */}
          <button
            onClick={() => setSelectedMood(null)}
            style={{
              position: "absolute",
              top: 10,
              right: 12,
              zIndex: 10,
              background: "#ffffff",
              border: `1px solid ${P[200]}`,
              borderRadius: "50%",
              width: 28,
              height: 28,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              fontSize: 13,
              color: P[600],
              fontWeight: 700,
              boxShadow: "0 2px 6px rgba(0,0,0,0.08)",
            }}
          >
            ✕
          </button>

          <MoodCircles
            userId={userId}
            userDisplayName={userDisplayName}
            initialMood={selectedMood}
          />
        </div>
      </div>
    );
  }

  // Mood picker box
  return (
    <div className="fixed inset-0 flex items-center justify-center z-50">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/20 backdrop-blur-sm"
        onClick={handleClose}
      />

      {/* Floating box */}
      <div
        className="relative rounded-3xl shadow-2xl"
        style={{
          width: 320,
          background: "#ffffff",
          border: `1px solid ${P[200]}`,
          padding: "24px 20px 20px",
        }}
      >
        {/* X button */}
        <button
          onClick={handleClose}
          style={{
            position: "absolute",
            top: 12,
            right: 14,
            background: P[50],
            border: `1px solid ${P[200]}`,
            borderRadius: "50%",
            width: 28,
            height: 28,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            fontSize: 13,
            color: P[600],
            fontWeight: 700,
            lineHeight: 1,
          }}
        >
          ✕
        </button>

        {/* Title */}
        <h2
          style={{
            fontSize: 18,
            fontWeight: 800,
            color: P[700],
            marginBottom: 4,
            marginTop: 0,
          }}
        >
          Pick your mood 🎭
        </h2>
        <p style={{ fontSize: 13, color: P[500], marginBottom: 16, marginTop: 0 }}>
          Join people sharing the same vibe
        </p>

        {/* Mood grid */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 10,
          }}
        >
          {Object.entries(MOODS).map(([key, mood]) => (
            <button
              key={key}
              onClick={() => handleMoodSelect(key as MoodType)}
              style={{
                background: mood.color,
                color: "white",
                border: "none",
                borderRadius: 16,
                padding: "14px 10px",
                cursor: "pointer",
                fontWeight: 700,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 4,
                fontSize: 13,
                boxShadow: "0 4px 14px rgba(0,0,0,0.10)",
                transition: "transform 0.15s ease",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.05)")}
              onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
            >
              <span style={{ fontSize: 22 }}>{mood.emoji}</span>
              {mood.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}