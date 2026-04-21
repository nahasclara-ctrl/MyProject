"use client";

import { useState, useRef, useCallback, type ChangeEvent } from "react";
import { ID } from "appwrite";
import { storage, databases, appwriteConfig } from "@/lib/appwrite/config";
import { useUserContext } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeProvider";

interface Toast { message: string; type: "success" | "error"; }

const ASPECT_RATIOS: Record<string, string> = { "1:1": "aspect-square", "4:5": "aspect-[4/5]", "16:9": "aspect-video" };
const MAX_CAPTION = 2200;
const MAX_TAGS = 30;

const D = { bg: "#0d1f16", card: "#112218", border: "#1e3d2a", text: "#d6ebe0", muted: "#7aab90", input: "#1a3526" };

function ToastBanner({ toast, onDismiss }: { toast: Toast; onDismiss: () => void }) {
  return (
    <div role="alert" onClick={onDismiss}
      className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 px-5 py-3 rounded-2xl shadow-lg cursor-pointer select-none transition-all ${toast.type === "success" ? "bg-[#4f9f75] text-white" : "bg-red-500 text-white"}`}>
      <span className="text-lg">{toast.type === "success" ? "✓" : "✕"}</span>
      <span className="text-sm font-medium">{toast.message}</span>
    </div>
  );
}

export default function CreatePost() {
  const { user } = useUserContext();
  const { darkMode } = useTheme();

  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [ratio, setRatio] = useState<string>("1:1");
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [caption, setCaption] = useState("");
  const [location, setLocation] = useState("");
  const [tagInput, setTagInput] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<Toast | null>(null);

  const showToast = (message: string, type: Toast["type"]) => { setToast({ message, type }); setTimeout(() => setToast(null), 3500); };

  const resetAll = () => {
    setFile(null); setPreview(null); setCaption(""); setLocation("");
    setTagInput(""); setTags([]); setRatio("1:1");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleFileChange = (f: File | null) => {
    if (!f) return;
    setFile(f);
    setPreview(URL.createObjectURL(f));
  };

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault(); setIsDragging(false);
    handleFileChange(e.dataTransfer.files?.[0] ?? null);
  }, []);

  const addTag = (raw: string) => {
    const tag = raw.replace(/^#+/, "").trim().toLowerCase();
    if (!tag || tags.includes(tag) || tags.length >= MAX_TAGS) return;
    setTags((prev) => [...prev, tag]);
  };

  const handleTagKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (["Enter", ",", " "].includes(e.key)) { e.preventDefault(); addTag(tagInput); setTagInput(""); }
    else if (e.key === "Backspace" && tagInput === "" && tags.length > 0) setTags((prev) => prev.slice(0, -1));
  };

  const detectLocation = () => {
    if (!navigator.geolocation) { showToast("Geolocation not supported.", "error"); return; }
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const { latitude, longitude } = pos.coords;
          const res = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`);
          const data = await res.json();
          const city = data.address?.city || data.address?.town || data.address?.village || "";
          const country = data.address?.country || "";
          setLocation([city, country].filter(Boolean).join(", "));
        } catch { showToast("Could not detect location.", "error"); }
      },
      () => showToast("Location permission denied.", "error")
    );
  };

  const handleSubmit = async () => {
    if (!file) return showToast("Please select a photo or video.", "error");
    if (!user?.$id) return showToast("You must be logged in.", "error");
    setLoading(true);
    try {
      const fileId = ID.unique();
      await storage.createFile(appwriteConfig.storageId, fileId, file);
      const imageUrl = storage.getFileView(appwriteConfig.storageId, fileId).toString();
      await databases.createDocument(appwriteConfig.databaseId, appwriteConfig.postCollectionId, ID.unique(), {
        caption, imageUrl, imageId: fileId, creator: user.$id, location: location.trim() || null, tags,
      });
      showToast("Post shared successfully! 🎉", "success");
      resetAll();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Something went wrong.";
      showToast(msg, "error");
    } finally { setLoading(false); }
  };

  const bg = darkMode ? D.bg : "#f6fbf8";
  const card = darkMode ? D.card : "#ffffff";
  const border = darkMode ? D.border : "#d6ebe0";
  const text = darkMode ? D.text : "#2f6e4f";
  const muted = darkMode ? D.muted : "#7bbf9a";
  const inputBg = darkMode ? D.input : "#f6fbf8";
  const inputText = darkMode ? D.text : "#374151";

  return (
    <div style={{ minHeight: "100vh", background: bg, display: "flex", alignItems: "flex-start", justifyContent: "center", padding: "40px 16px", transition: "background 0.3s" }}>
      {toast && <ToastBanner toast={toast} onDismiss={() => setToast(null)} />}

      <div style={{ width: "100%", maxWidth: 560, background: card, borderRadius: 24, border: `1px solid ${border}`, overflow: "hidden", transition: "background 0.3s" }}>
        {/* Header */}
        <div style={{ padding: "20px 24px", borderBottom: `1px solid ${border}`, display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ width: 32, height: 32, borderRadius: "50%", background: darkMode ? D.input : "#eaf5ef", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <svg viewBox="0 0 24 24" style={{ width: 16, height: 16, stroke: "#4f9f75", fill: "none", strokeWidth: 2 }}>
              <rect x="3" y="3" width="18" height="18" rx="5" />
              <circle cx="12" cy="12" r="4" />
              <circle cx="17.5" cy="6.5" r="1" fill="#4f9f75" strokeWidth={0} />
            </svg>
          </div>
          <h1 style={{ fontSize: 18, fontWeight: 600, color: text }}>Create Post</h1>
        </div>

        <div style={{ padding: 24, display: "flex", flexDirection: "column", gap: 24 }}>
          {/* Drop Zone */}
          {!preview ? (
            <div
              onClick={() => fileInputRef.current?.click()}
              onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={onDrop}
              style={{
                display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
                gap: 12, borderRadius: 16, border: `2px dashed ${isDragging ? "#4f9f75" : border}`,
                background: darkMode ? D.input : "#eaf5ef", cursor: "pointer", padding: "56px 0",
              }}
            >
              <svg viewBox="0 0 24 24" style={{ width: 40, height: 40, stroke: muted, fill: "none", strokeWidth: 1.5 }}>
                <path d="M4 16l4-4 4 4 4-6 4 6" /><rect x="3" y="3" width="18" height="18" rx="4" />
              </svg>
              <p style={{ color: text, fontSize: 14, fontWeight: 500 }}>Drag & drop or click to upload</p>
              <p style={{ color: muted, fontSize: 12 }}>Photos and videos supported</p>
              <input ref={fileInputRef} type="file" accept="image/*,video/*" style={{ display: "none" }} onChange={(e) => handleFileChange(e.target.files?.[0] ?? null)} />
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <div style={{ display: "flex", gap: 8 }}>
                {Object.keys(ASPECT_RATIOS).map((r) => (
                  <button key={r} onClick={() => setRatio(r)} style={{
                    flex: 1, padding: "6px 0", borderRadius: 12, fontSize: 12, fontWeight: 600,
                    border: `1px solid ${r === ratio ? "#4f9f75" : border}`,
                    background: r === ratio ? "#4f9f75" : card, color: r === ratio ? "#fff" : "#4f9f75", cursor: "pointer",
                  }}>{r}</button>
                ))}
              </div>
              <div style={{ position: "relative", borderRadius: 16, overflow: "hidden", background: "#000", aspectRatio: ratio.replace(":", "/") }}>
                {file?.type.startsWith("video") ? <video src={preview} controls style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : <img src={preview} alt="Preview" style={{ width: "100%", height: "100%", objectFit: "cover" }} />}
                <button onClick={() => { setFile(null); setPreview(null); }} style={{ position: "absolute", top: 8, right: 8, background: "rgba(0,0,0,0.5)", color: "#fff", border: "none", borderRadius: "50%", width: 28, height: 28, cursor: "pointer" }}>✕</button>
              </div>
            </div>
          )}

          {/* Caption */}
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <label style={{ fontSize: 11, fontWeight: 600, color: "#3f8a63", textTransform: "uppercase", letterSpacing: "0.08em" }}>Caption</label>
            <textarea value={caption} onChange={(e) => setCaption(e.target.value.slice(0, MAX_CAPTION))} placeholder="Write a caption…" rows={3}
              style={{ width: "100%", padding: "12px 16px", borderRadius: 16, border: `1px solid ${border}`, background: inputBg, color: inputText, fontSize: 14, resize: "none", outline: "none", boxSizing: "border-box" }} />
            <p style={{ textAlign: "right", fontSize: 12, color: caption.length >= MAX_CAPTION ? "#f87171" : muted }}>{caption.length} / {MAX_CAPTION}</p>
          </div>

          {/* Location */}
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <label style={{ fontSize: 11, fontWeight: 600, color: "#3f8a63", textTransform: "uppercase", letterSpacing: "0.08em" }}>Location</label>
            <div style={{ display: "flex", gap: 8 }}>
              <input type="text" value={location} onChange={(e) => setLocation(e.target.value)} placeholder="Add a location…"
                style={{ flex: 1, padding: "12px 16px", borderRadius: 16, border: `1px solid ${border}`, background: inputBg, color: inputText, fontSize: 14, outline: "none" }} />
              <button onClick={detectLocation} style={{ padding: "0 14px", borderRadius: 16, border: `1px solid ${border}`, background: darkMode ? D.input : "#eaf5ef", color: "#4f9f75", cursor: "pointer" }}>📍</button>
            </div>
          </div>

          {/* Tags */}
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <label style={{ fontSize: 11, fontWeight: 600, color: "#3f8a63", textTransform: "uppercase", letterSpacing: "0.08em" }}>Tags ({tags.length}/{MAX_TAGS})</label>
            <div style={{ minHeight: 48, padding: "8px 12px", borderRadius: 16, border: `1px solid ${border}`, background: inputBg, display: "flex", flexWrap: "wrap", gap: 8, cursor: "text" }}
              onClick={() => document.getElementById("tag-input")?.focus()}>
              {tags.map((tag, idx) => (
                <span key={tag} style={{ display: "inline-flex", alignItems: "center", gap: 4, padding: "4px 10px", borderRadius: 12, background: darkMode ? D.input : "#eaf5ef", color: "#3f8a63", fontSize: 12, fontWeight: 500 }}>
                  #{tag}
                  <button onClick={(e) => { e.stopPropagation(); setTags((p) => p.filter((_, i) => i !== idx)); }} style={{ background: "none", border: "none", color: muted, cursor: "pointer", fontSize: 14, lineHeight: 1 }}>×</button>
                </span>
              ))}
              <input id="tag-input" type="text" value={tagInput} onChange={(e) => setTagInput(e.target.value)} onKeyDown={handleTagKeyDown}
                onBlur={() => { if (tagInput) { addTag(tagInput); setTagInput(""); } }}
                placeholder={tags.length === 0 ? "Add tags (press Enter, comma, or space)…" : ""}
                style={{ flex: 1, minWidth: 140, background: "transparent", border: "none", outline: "none", fontSize: 14, color: inputText }}
                disabled={tags.length >= MAX_TAGS} />
            </div>
            <p style={{ fontSize: 12, color: muted }}>Press Enter, comma, or space to add a tag</p>
          </div>

          {/* Actions */}
          <div style={{ display: "flex", gap: 12, paddingTop: 8 }}>
            <button onClick={resetAll} disabled={loading} style={{ flex: 1, padding: "12px 0", borderRadius: 16, border: `1px solid ${border}`, background: "transparent", color: "#4f9f75", fontSize: 14, fontWeight: 600, cursor: "pointer" }}>Cancel</button>
            <button onClick={handleSubmit} disabled={loading || !file} style={{ flex: 1, padding: "12px 0", borderRadius: 16, background: "#4f9f75", color: "#fff", fontSize: 14, fontWeight: 600, cursor: loading || !file ? "not-allowed" : "pointer", opacity: loading || !file ? 0.5 : 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 8, border: "none" }}>
              {loading ? "Sharing…" : "Share"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}