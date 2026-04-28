import React, { useState } from "react";
import { storage, databases, ID } from "@/lib/appwrite/config";
import { useUserContext } from "@/context/AuthContext";
import { appwriteConfig } from "@/lib/appwrite/config";
import { useTheme } from "@/context/ThemeProvider";

const P = {
  50: "#f6fbf8", 100: "#eaf5ef", 200: "#d6ebe0",
  300: "#b7dcc8", 400: "#7bbf9a", 500: "#4f9f75",
  600: "#3f8a63", 700: "#2f6e4f",
};

const D = {
  bg:      "#0f1a14",
  surface: "#1a2b20",
  border:  "#2a3f30",
  text:    "#d6ebe0",
  subtext: "#7bbf9a",
  muted:   "#3a5444",
  inputBg: "#152019",
};

const Updateprofile = () => {
  const [bio, setBio] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const { user: currentUser } = useUserContext();
  const { darkMode } = useTheme(); // ← only addition

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      let imageUrl = "";

      if (image) {
        const file = await storage.createFile(
          appwriteConfig.storageId,
          ID.unique(),
          image
        );

        imageUrl = `https://cloud.appwrite.io/v1/storage/buckets/${appwriteConfig.storageId}/files/${file.$id}/view?project=${appwriteConfig.projectId}`;
      }

      await databases.updateDocument(
        appwriteConfig.databaseId,
        appwriteConfig.usersCollectionId,
        currentUser.$id,
        {
          bio,
          ...(imageUrl && { imageUrl }),
        }
      );

      alert("Profile updated ✨");
    } catch (err) {
      console.error(err);
      alert("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  // ── Theme tokens ──────────────────────────────────────────────
  const t = {
    pageBg:   darkMode ? D.bg      : P[50],
    surface:  darkMode ? D.surface : "#ffffff",
    border:   darkMode ? D.border  : P[200],
    text:     darkMode ? D.text    : P[700],
    subtext:  darkMode ? D.subtext : P[600],
    muted:    darkMode ? D.muted   : P[400],
    inputBg:  darkMode ? D.inputBg : "#ffffff",
    inputBorder: darkMode ? D.border : P[200],
    avatarRing:  darkMode ? D.border : P[300],
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4 transition-colors duration-300"
      style={{ background: t.pageBg }}
    >
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md rounded-3xl shadow-sm border p-6 transition-colors duration-300"
        style={{ background: t.surface, borderColor: t.border }}
      >

        {/* HEADER */}
        <h2
          className="text-center text-lg font-semibold mb-6"
          style={{ color: t.text }}
        >
          Edit Profile
        </h2>

        {/* AVATAR SECTION */}
        <div className="flex flex-col items-center mb-6">
          <div className="relative group">
            <img
              src={
                preview ||
                currentUser?.imageUrl ||
                "/assets/icons/profile-placeholder.svg"
              }
              className="w-28 h-28 rounded-full object-cover border-2"
              style={{ borderColor: t.avatarRing }}
            />
            <label
              htmlFor="file"
              className="absolute inset-0 flex items-center justify-center rounded-full cursor-pointer opacity-0 group-hover:opacity-100 transition"
              style={{ backgroundColor: "rgba(0,0,0,0.4)", color: "#fff", fontSize: 13, fontWeight: 500 }}
            >
              Change
            </label>
          </div>

          <input
            id="file"
            type="file"
            className="hidden"
            onChange={(e) => {
              if (e.target.files?.[0]) {
                const file = e.target.files[0];
                setImage(file);
                setPreview(URL.createObjectURL(file));
              }
            }}
          />

          <p className="text-xs mt-2" style={{ color: t.muted }}>
            Tap to change profile photo
          </p>
        </div>

        {/* BIO SECTION */}
        <div className="mb-5">
          <label className="text-xs font-medium" style={{ color: t.subtext }}>
            Bio
          </label>
          <textarea
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            rows={4}
            placeholder="Write something about yourself..."
            className="w-full mt-2 p-3 rounded-xl outline-none resize-none text-sm transition-colors duration-300"
            style={{
              border: `1px solid ${t.inputBorder}`,
              background: t.inputBg,
              color: t.text,
            }}
            onFocus={(e) => (e.target.style.borderColor = P[500])}
            onBlur={(e)  => (e.target.style.borderColor = t.inputBorder)}
          />
        </div>

        {/* DIVIDER */}
        <div className="h-px my-4" style={{ background: t.border }} />

        {/* ACTION BUTTON */}
        <button
          type="submit"
          disabled={loading}
          className="w-full py-2 rounded-xl text-white font-medium transition-all"
          style={{
            backgroundColor: loading ? P[300] : P[500],
            opacity: loading ? 0.7 : 1,
            cursor: loading ? "not-allowed" : "pointer",
          }}
        >
          {loading ? "Saving..." : "Save Changes"}
        </button>

        {/* FOOTER NOTE */}
        <p className="text-center text-xs mt-4" style={{ color: t.muted }}>
          Your profile will be updated instantly
        </p>
      </form>
    </div>
  );
};

export default Updateprofile;