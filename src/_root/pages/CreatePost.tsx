"use client";

import { useState, useRef, useCallback, type ChangeEvent } from "react";
import { ID } from "appwrite";
import { storage, databases, appwriteConfig } from "@/lib/appwrite/config";
import { useUserContext } from "@/context/AuthContext";

// ─── Types ────────────────────────────────────────────────────────────────────
interface Toast {
  message: string;
  type: "success" | "error";
}

const ASPECT_RATIOS: Record<string, string> = {
  "1:1": "aspect-square",
  "4:5": "aspect-[4/5]",
  "16:9": "aspect-video",
};

const MAX_CAPTION = 2200;
const MAX_TAGS = 30;

// ─── Toast ────────────────────────────────────────────────────────────────────
function ToastBanner({ toast, onDismiss }: { toast: Toast; onDismiss: () => void }) {
  return (
    <div
      role="alert"
      onClick={onDismiss}
      className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3
        px-5 py-3 rounded-2xl shadow-lg cursor-pointer select-none transition-all
        ${toast.type === "success"
          ? "bg-[#4f9f75] text-white"
          : "bg-red-500 text-white"
        }`}
    >
      <span className="text-lg">{toast.type === "success" ? "✓" : "✕"}</span>
      <span className="text-sm font-medium">{toast.message}</span>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function CreatePost() {
  const { user } = useUserContext();

  // Media state
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [ratio, setRatio] = useState<string>("1:1");
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form state
  const [caption, setCaption] = useState("");
  const [location, setLocation] = useState("");
  const [tagInput, setTagInput] = useState("");
  const [tags, setTags] = useState<string[]>([]);

  // UI state
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<Toast | null>(null);

  // ── Helpers ──────────────────────────────────────────────────────────────
  const showToast = (message: string, type: Toast["type"]) => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  const resetAll = () => {
    setFile(null);
    setPreview(null);
    setCaption("");
    setLocation("");
    setTagInput("");
    setTags([]);
    setRatio("1:1");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // ── File handling ─────────────────────────────────────────────────────────
  const handleFileChange = (f: File | null) => {
    if (!f) return;
    setFile(f);
    const url = URL.createObjectURL(f);
    setPreview(url);
  };

  const onInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    handleFileChange(e.target.files?.[0] ?? null);
  };

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleFileChange(e.dataTransfer.files?.[0] ?? null);
  }, []);

  // ── Tags ──────────────────────────────────────────────────────────────────
  const addTag = (raw: string) => {
    const tag = raw.replace(/^#+/, "").trim().toLowerCase();
    if (!tag || tags.includes(tag) || tags.length >= MAX_TAGS) return;
    setTags((prev) => [...prev, tag]);
  };

  const handleTagKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (["Enter", ",", " "].includes(e.key)) {
      e.preventDefault();
      addTag(tagInput);
      setTagInput("");
    } else if (e.key === "Backspace" && tagInput === "" && tags.length > 0) {
      setTags((prev) => prev.slice(0, -1));
    }
  };

  const removeTag = (idx: number) => {
    setTags((prev) => prev.filter((_, i) => i !== idx));
  };

  // ── Geolocation ───────────────────────────────────────────────────────────
  const detectLocation = () => {
    if (!navigator.geolocation) {
      showToast("Geolocation not supported by your browser.", "error");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const { latitude, longitude } = pos.coords;
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`
          );
          const data = await res.json();
          const city =
            data.address?.city ||
            data.address?.town ||
            data.address?.village ||
            data.address?.county ||
            "";
          const country = data.address?.country || "";
          setLocation([city, country].filter(Boolean).join(", "));
        } catch {
          showToast("Could not reverse-geocode your location.", "error");
        }
      },
      () => showToast("Location permission denied.", "error")
    );
  };

  // ── Submit ────────────────────────────────────────────────────────────────
  const handleSubmit = async () => {
    if (!file) return showToast("Please select a photo or video.", "error");
    if (!user?.$id) return showToast("You must be logged in.", "error");

    setLoading(true);
    try {
      // 1. Upload file to Appwrite Storage
      const fileId = ID.unique();
      await storage.createFile(
        appwriteConfig.storageId,
        fileId,
        file
      );

      // 2. Build the public view URL via SDK (works for both public & private buckets)
      const imageUrl = storage.getFileView(
        appwriteConfig.storageId,
        fileId
      ).toString();

      // 3. Save document — include imageId so the required attribute is satisfied
      await databases.createDocument(
        appwriteConfig.databaseId,
        appwriteConfig.postCollectionId,
        ID.unique(),
        {
          caption,
          imageUrl,
          imageId: fileId,          // ← was missing, caused the 400
          creator: user.$id,
          location: location.trim() || null,
          tags,
          
        }
      );

      showToast("Post shared successfully! 🎉", "success");
      resetAll();
    } catch (err: unknown) {
      console.error(err);
      const msg =
        err instanceof Error ? err.message : "Something went wrong. Please try again.";
      showToast(msg, "error");
    } finally {
      setLoading(false);
    }
  };

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-[#f6fbf8] flex items-start justify-center py-10 px-4">
      {toast && <ToastBanner toast={toast} onDismiss={() => setToast(null)} />}

      <div className="w-full max-w-xl bg-white rounded-3xl shadow-sm border border-[#d6ebe0] overflow-hidden">
        {/* Header */}
        <div className="px-6 py-5 border-b border-[#d6ebe0] flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-[#eaf5ef] flex items-center justify-center">
            <svg viewBox="0 0 24 24" className="w-4 h-4 stroke-[#4f9f75] fill-none" strokeWidth={2}>
              <rect x="3" y="3" width="18" height="18" rx="5" />
              <circle cx="12" cy="12" r="4" />
              <circle cx="17.5" cy="6.5" r="1" fill="#4f9f75" strokeWidth={0} />
            </svg>
          </div>
          <h1 className="text-lg font-semibold text-[#2f6e4f] tracking-tight">Create Post</h1>
        </div>

        <div className="p-6 space-y-6">
          {/* Drop Zone / Preview */}
          <div>
            {!preview ? (
              <div
                onClick={() => fileInputRef.current?.click()}
                onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={onDrop}
                className={`relative flex flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed cursor-pointer transition-colors py-14
                  ${isDragging
                    ? "border-[#4f9f75] bg-[#eaf5ef]"
                    : "border-[#d6ebe0] bg-[#eaf5ef] hover:border-[#7bbf9a]"
                  }`}
              >
                <svg viewBox="0 0 24 24" className="w-10 h-10 stroke-[#7bbf9a] fill-none" strokeWidth={1.5}>
                  <path d="M4 16l4-4 4 4 4-6 4 6" />
                  <rect x="3" y="3" width="18" height="18" rx="4" />
                </svg>
                <div className="text-center">
                  <p className="text-sm font-medium text-[#2f6e4f]">Drag & drop or click to upload</p>
                  <p className="text-xs text-[#7bbf9a] mt-1">Photos and videos supported</p>
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*,video/*"
                  className="hidden"
                  onChange={onInputChange}
                />
              </div>
            ) : (
              <div className="space-y-3">
                {/* Aspect ratio toggle */}
                <div className="flex gap-2">
                  {Object.keys(ASPECT_RATIOS).map((r) => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => setRatio(r)}
                      className={`flex-1 py-1.5 rounded-xl text-xs font-semibold transition-all border
                        ${ratio === r
                          ? "bg-[#4f9f75] text-white border-[#4f9f75]"
                          : "bg-white text-[#4f9f75] border-[#d6ebe0] hover:border-[#7bbf9a]"
                        }`}
                    >
                      {r}
                    </button>
                  ))}
                </div>

                {/* Preview */}
                <div className={`relative rounded-2xl overflow-hidden bg-black ${ASPECT_RATIOS[ratio]}`}>
                  {file?.type.startsWith("video") ? (
                    <video src={preview} controls className="w-full h-full object-cover" />
                  ) : (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={preview} alt="Preview" className="w-full h-full object-cover" />
                  )}
                  <button
                    type="button"
                    onClick={() => { setFile(null); setPreview(null); }}
                    className="absolute top-2 right-2 bg-black/50 hover:bg-black/70 text-white rounded-full w-7 h-7 flex items-center justify-center text-sm transition-colors"
                    aria-label="Remove media"
                  >
                    ✕
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Caption */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-[#3f8a63] uppercase tracking-wider">
              Caption
            </label>
            <textarea
              value={caption}
              onChange={(e) => setCaption(e.target.value.slice(0, MAX_CAPTION))}
              placeholder="Write a caption…"
              rows={3}
              className="w-full px-4 py-3 rounded-2xl border border-[#d6ebe0] bg-[#f6fbf8] text-sm text-gray-700
                placeholder:text-[#7bbf9a] resize-none focus:outline-none focus:ring-2 focus:ring-[#4f9f75]/30 focus:border-[#4f9f75] transition"
            />
            <p className={`text-right text-xs ${caption.length >= MAX_CAPTION ? "text-red-400" : "text-[#7bbf9a]"}`}>
              {caption.length} / {MAX_CAPTION}
            </p>
          </div>

          {/* Location */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-[#3f8a63] uppercase tracking-wider">
              Location
            </label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#7bbf9a]">
                  <svg viewBox="0 0 24 24" className="w-4 h-4 fill-none stroke-current" strokeWidth={2}>
                    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" />
                    <circle cx="12" cy="9" r="2.5" />
                  </svg>
                </span>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="Add a location…"
                  className="w-full pl-9 pr-4 py-3 rounded-2xl border border-[#d6ebe0] bg-[#f6fbf8] text-sm text-gray-700
                    placeholder:text-[#7bbf9a] focus:outline-none focus:ring-2 focus:ring-[#4f9f75]/30 focus:border-[#4f9f75] transition"
                />
              </div>
              <button
                type="button"
                onClick={detectLocation}
                title="Detect my location"
                className="px-3 py-3 rounded-2xl border border-[#d6ebe0] bg-[#eaf5ef] text-[#4f9f75]
                  hover:bg-[#d6ebe0] transition-colors flex items-center justify-center"
              >
                <svg viewBox="0 0 24 24" className="w-4 h-4 fill-none stroke-current" strokeWidth={2}>
                  <circle cx="12" cy="12" r="3" />
                  <path d="M12 2v3M12 19v3M2 12h3M19 12h3" />
                  <circle cx="12" cy="12" r="9" strokeDasharray="2 2" />
                </svg>
              </button>
            </div>
          </div>

          {/* Tags */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-[#3f8a63] uppercase tracking-wider">
              Tags <span className="font-normal text-[#7bbf9a] normal-case">({tags.length}/{MAX_TAGS})</span>
            </label>
            <div
              className="min-h-[48px] w-full px-3 py-2 rounded-2xl border border-[#d6ebe0] bg-[#f6fbf8]
                focus-within:ring-2 focus-within:ring-[#4f9f75]/30 focus-within:border-[#4f9f75] transition flex flex-wrap gap-2 cursor-text"
              onClick={() => document.getElementById("tag-input")?.focus()}
            >
              {tags.map((tag, idx) => (
                <span
                  key={tag}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-[#eaf5ef] text-[#3f8a63] text-xs font-medium"
                >
                  #{tag}
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); removeTag(idx); }}
                    className="text-[#7bbf9a] hover:text-[#3f8a63] leading-none transition-colors"
                    aria-label={`Remove #${tag}`}
                  >
                    ×
                  </button>
                </span>
              ))}
              <input
                id="tag-input"
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={handleTagKeyDown}
                onBlur={() => { if (tagInput) { addTag(tagInput); setTagInput(""); } }}
                placeholder={tags.length === 0 ? "Add tags (press Enter, comma, or space)…" : ""}
                className="flex-1 min-w-[140px] bg-transparent text-sm text-gray-700 placeholder:text-[#7bbf9a] focus:outline-none"
                disabled={tags.length >= MAX_TAGS}
              />
            </div>
            <p className="text-xs text-[#7bbf9a]">Press Enter, comma, or space to add a tag</p>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={resetAll}
              disabled={loading}
              className="flex-1 py-3 rounded-2xl border border-[#d6ebe0] text-sm font-semibold text-[#4f9f75]
                hover:bg-[#eaf5ef] transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={loading || !file}
              className="flex-1 py-3 rounded-2xl bg-[#4f9f75] text-white text-sm font-semibold
                hover:bg-[#3f8a63] active:bg-[#2f6e4f] transition-colors disabled:opacity-50 disabled:cursor-not-allowed
                flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                  </svg>
                  Sharing…
                </>
              ) : (
                "Share"
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}