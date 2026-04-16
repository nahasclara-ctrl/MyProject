import React, { useState } from "react";
import { storage, databases, ID } from "@/lib/appwrite/config";
import { useUserContext } from "@/context/AuthContext";
import { appwriteConfig } from "@/lib/appwrite/config";

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

const Updateprofile = () => {
  const [bio, setBio] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const { user: currentUser } = useUserContext();

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

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4"
      style={{ background: P[50] }}
    >
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md bg-white rounded-3xl shadow-sm border p-6"
        style={{ borderColor: P[200] }}
      >

        {/* HEADER */}
        <h2 className="text-center text-lg font-semibold mb-6" style={{ color: P[700] }}>
          Edit Profile
        </h2>

        {/* AVATAR SECTION (Instagram style) */}
        <div className="flex flex-col items-center mb-6">

          <div className="relative group">
            <img
              src={
                preview ||
                currentUser?.imageUrl ||
                "/assets/icons/profile-placeholder.svg"
              }
              className="w-28 h-28 rounded-full object-cover border-2"
              style={{ borderColor: P[300] }}
            />

            {/* overlay edit */}
            <label
              htmlFor="file"
              className="absolute inset-0 flex items-center justify-center rounded-full cursor-pointer opacity-0 group-hover:opacity-100 transition"
              style={{ backgroundColor: "rgba(0,0,0,0.35)", color: "#fff" }}
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

          <p className="text-xs mt-2" style={{ color: P[400] }}>
            Tap to change profile photo
          </p>
        </div>

        {/* BIO SECTION */}
        <div className="mb-5">
          <label className="text-xs font-medium" style={{ color: P[600] }}>
            Bio
          </label>

          <textarea
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            rows={4}
            placeholder="Write something about yourself..."
            className="w-full mt-2 p-3 rounded-xl outline-none resize-none text-sm"
            style={{
              border: `1px solid ${P[200]}`,
              backgroundColor: "#fff",
              color: P[700],
            }}
          />
        </div>

        {/* DIVIDER */}
        <div className="h-px my-4" style={{ background: P[200] }} />

        {/* ACTION BUTTON */}
        <button
          type="submit"
          disabled={loading}
          className="w-full py-2 rounded-xl text-white font-medium transition"
          style={{
            backgroundColor: loading ? P[300] : P[500],
          }}
        >
          {loading ? "Saving..." : "Save Changes"}
        </button>

        {/* FOOTER NOTE */}
        <p className="text-center text-xs mt-4" style={{ color: P[400] }}>
          Your profile will be updated instantly
        </p>
      </form>
    </div>
  );
};

export default Updateprofile;