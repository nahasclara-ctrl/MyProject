import { useState } from "react";
import MoodCircles from "@/components/MoodCircles";

type MoodType = "happy" | "sad" | "stressed" | "bored" | "chill";

const MOODS: Record<MoodType, { emoji: string; color: string; label: string }> = {
  happy: { emoji: "😊", color: "#FFD93D", label: "Happy" },
  sad: { emoji: "😔", color: "#6B9BD1", label: "Sad" },
  stressed: { emoji: "😤", color: "#EF6B6B", label: "Stressed" },
  bored: { emoji: "😴", color: "#A9A9A9", label: "Bored" },
  chill: { emoji: "😎", color: "#95E1D3", label: "Chill" },
};

interface Props {
  userId: string;
  userDisplayName: string;
}

export default function MoodModal({ userId, userDisplayName }: Props) {
  const [selectedMood, setSelectedMood] = useState<MoodType | null>(null);

  // ✅ Only show if not already seen this session
  const [open, setOpen] = useState(true);

  // ✅ Close without picking a mood
  const handleClose = () => {
    sessionStorage.setItem("moodModalSeen", "true");
    setOpen(false);
  };

  // ✅ Pick a mood and mark as seen
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
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-xl w-[350px] text-center shadow-xl relative">

        {/* ❌ CLOSE BUTTON */}
        <button
          onClick={handleClose}
          className="absolute top-2 right-3 text-gray-500 hover:text-black text-xl"
        >
          ✕
        </button>

        <h2 className="text-xl font-bold mb-2">Pick your mood 🎭</h2>

        <p className="text-gray-500 mb-4 text-sm">
          You'll join people with the same vibe
        </p>

        <div className="grid grid-cols-2 gap-3">
          {Object.entries(MOODS).map(([key, mood]) => (
            <button
              key={key}
              onClick={() => handleMoodSelect(key as MoodType)}
              className="p-3 rounded-lg text-white font-semibold flex flex-col items-center gap-1"
              style={{ backgroundColor: mood.color }}
            >
              <span className="text-2xl">{mood.emoji}</span>
              {mood.label}
            </button>
          ))}
        </div>

      </div>
    </div>
  );
}