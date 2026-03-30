import React, { useState } from "react";
import { storage, databases, ID,} from "@/lib/appwrite/config";
import { useUserContext } from "@/context/AuthContext";
import { appwriteConfig } from "@/lib/appwrite/config";

const Updateprofile = () => {
  const [bio, setBio] = useState<string>("");
  const [image, setImage] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);

  const { user: currentUser } = useUserContext();

  const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();

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

    // UPDATE EXISTING USER
    await databases.updateDocument(
      appwriteConfig.databaseId,
      appwriteConfig.usersCollectionId,
      currentUser.id, 
      {
        bio: bio,
        ...(imageUrl && { imageUrl: imageUrl }),
      }
    );

    alert("Profile updated successfully!");

  } catch (error) {
    console.error(error);
    alert("Error updating profile");
  }
};

  return (
    <div className="update-container">
      <div className="update-card">
        <h2>Edit Profile</h2>

        <form onSubmit={handleSubmit}>
          
          {preview && (
            <img src={preview} alt="preview" className="profile-preview" />
          )}

         {/* Hidden file input */}
<input
  type="file"
  id="file"
  style={{ display: "none" }}
  onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImage(file);
      setPreview(URL.createObjectURL(file));
    }
  }}
/>

{/* Styled label as button */}
<label htmlFor="file" className="choose-file-label">
  Choose File
</label>

          <textarea
            placeholder="Enter your bio..."
            value={bio}
            onChange={(e) => setBio(e.target.value)}
          />

          <button type="submit">Save Changes</button>
        </form>
      </div>
    </div>
  );
};

export default Updateprofile;