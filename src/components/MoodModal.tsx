import { useState } from "react";
import MoodCircles from "@/components/MoodCircles";

type MoodType = "happy" | "sad" | "stressed" | "bored" | "chill";

// ============================================================
// DESIGN SYSTEM (UNIFIED PALETTE)
// ============================================================

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

// ============================================================
// COMPONENT
// ============================================================

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

  if (!open) return null;

  if (selectedMood) {
    return (
      <MoodCircles
        userId={userId}
        userDisplayName={userDisplayName}
        initialMood={selectedMood}
      />
    );
  }

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50">

      {/* ======================================================
          BACKGROUND BLUR LAYERS
      ====================================================== */}
      <div className="absolute inset-0 bg-[#f6fbf8]" />

      <div className="absolute -top-40 -left-40 w-[500px] h-[500px] bg-[#4f9f75] opacity-20 blur-[140px] rounded-full" />
      <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-[#7bbf9a] opacity-20 blur-[140px] rounded-full" />

      {/* overlay glass */}
      <div className="absolute inset-0 bg-white/30 backdrop-blur-md" />

      {/* ======================================================
          MODAL CARD (GLASS STYLE)
      ====================================================== */}
      <div className="relative w-[360px] rounded-3xl border border-[#d6ebe0] bg-white/70 backdrop-blur-2xl shadow-2xl p-6 text-center">

        {/* close button */}
        <button
          onClick={handleClose}
          className="absolute top-3 right-4 text-[#7bbf9a] hover:text-[#2f6e4f] text-xl transition"
        >
          ✕
        </button>

        {/* title */}
        <h2 className="text-xl font-extrabold text-[#2f6e4f] mb-1">
          Pick your mood 🎭
        </h2>

        <p className="text-sm text-[#4f9f75] mb-5">
          Join people sharing the same vibe
        </p>

        {/* ======================================================
            MOOD GRID
        ====================================================== */}
        <div className="grid grid-cols-2 gap-3">
          {Object.entries(MOODS).map(([key, mood]) => (
            <button
              key={key}
              onClick={() => handleMoodSelect(key as MoodType)}
              className="rounded-2xl p-4 text-white font-semibold flex flex-col items-center gap-1 shadow-lg transition hover:scale-[1.05]"
              style={{
                background: mood.color,
                boxShadow: "0 12px 30px rgba(79,159,117,0.25)",
              }}
            >
              <span className="text-2xl">{mood.emoji}</span>
              <span className="text-sm">{mood.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}