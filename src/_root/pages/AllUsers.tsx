import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Loader } from "lucide-react";
import { useUserContext } from "@/context/AuthContext";
import { useGetUsers } from "@/lib/react-query/queriesAndMutations";
import { databases, appwriteConfig } from "@/lib/appwrite/config";
import { useQueryClient } from "@tanstack/react-query";
import { useTheme } from "@/context/ThemeProvider";

export interface IUser {
  $id: string; name: string; username: string;
  bio?: string; imageUrl?: string; followers?: string[]; following?: string[];
}

const L = { bg: "#f6fbf8", card: "#ffffffcc", border: "#d6ebe0", text: "#2f6e4f", muted: "#7bbf9a" };
const D = { bg: "#0d1f16", card: "#112218cc", border: "#1e3d2a", text: "#d6ebe0", muted: "#7aab90" };

const AllUsers: React.FC = () => {
  const { data: users, isLoading, isError } = useGetUsers();
  const { user: currentUser, setUser } = useUserContext();
  const { darkMode } = useTheme();
  const T = darkMode ? D : L;
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [loadingFollow, setLoadingFollow] = useState<string | null>(null);

  if (isLoading) return (
    <div className="flex-center w-full h-full" style={{ background: T.bg }}>
      <Loader className="animate-spin text-[#4f9f75]" />
    </div>
  );

  if (isError || !users?.documents) return (
    <div className="flex-center w-full h-full" style={{ background: T.bg }}>
      <p style={{ color: T.muted }}>Something went wrong loading users.</p>
    </div>
  );

  const userList: IUser[] = users.documents.map((doc) => ({
    $id: doc.$id,
    name: (doc as any).name || "",
    username: (doc as any).username || "",
    bio: (doc as any).bio || "",
    imageUrl: (doc as any).imageUrl || "",
    followers: (doc as any).followers || [],
    following: (doc as any).following || [],
  }));

  const handleFollow = async (followedUserId: string) => {
    if (!currentUser || !setUser) return;
    setLoadingFollow(followedUserId);
    try {
      const isCurrentlyFollowing = currentUser.following?.includes(followedUserId);
      if (isCurrentlyFollowing) {
        const updatedFollowing = (currentUser.following || []).filter((id) => id !== followedUserId);
        setUser({ ...currentUser, following: updatedFollowing });
        await databases.updateDocument(appwriteConfig.databaseId, appwriteConfig.usersCollectionId, currentUser.$id, { following: updatedFollowing });
        const followedUser = userList.find((u) => u.$id === followedUserId);
        if (followedUser) {
          const updatedFollowers = (followedUser.followers || []).filter((id) => id !== currentUser.$id);
          await databases.updateDocument(appwriteConfig.databaseId, appwriteConfig.usersCollectionId, followedUserId, { followers: updatedFollowers });
          followedUser.followers = updatedFollowers;
        }
      } else {
        const updatedFollowing = [...(currentUser.following || []), followedUserId];
        setUser({ ...currentUser, following: updatedFollowing });
        await databases.updateDocument(appwriteConfig.databaseId, appwriteConfig.usersCollectionId, currentUser.$id, { following: updatedFollowing });
        const followedUser = userList.find((u) => u.$id === followedUserId);
        if (followedUser) {
          const updatedFollowers = [...(followedUser.followers || []), currentUser.$id];
          await databases.updateDocument(appwriteConfig.databaseId, appwriteConfig.usersCollectionId, followedUserId, { followers: updatedFollowers });
          followedUser.followers = updatedFollowers;
        }
      }
      queryClient.invalidateQueries({ queryKey: ["getUsers"] });
      queryClient.invalidateQueries({ queryKey: ["getUserById", currentUser.$id] });
      queryClient.invalidateQueries({ queryKey: ["getUserById", followedUserId] });
      queryClient.invalidateQueries({ queryKey: ["getUserPosts", followedUserId] });
      navigate(`/profile/${followedUserId}`);
    } catch (error) {
      console.error("Error toggling follow:", error);
    } finally {
      setLoadingFollow(null);
    }
  };

  return (
    <div className="common-container" style={{ background: darkMode ? D.bg : "linear-gradient(180deg, #ffffff 0%, #f4faf7 100%)", minHeight: "100vh" }}>
      <div className="user-container">
        <h2 className="h3-bold md:h2-bold text-left w-full" style={{ color: T.text }}>Discover People</h2>
        <ul className="user-grid gap-6">
          {userList.map((person) => {
            const isFollowing = currentUser?.following?.includes(person.$id);
            return (
              <li key={person.$id} className="flex-1 min-w-[200px] w-full">
                <div
                  className="transition-all duration-300 hover:shadow-lg"
                  style={{
                    background: T.card, backdropFilter: "blur(10px)",
                    border: `1px solid ${T.border}`, borderRadius: "18px",
                    padding: "14px", boxShadow: darkMode ? "0 6px 20px rgba(0,0,0,0.3)" : "0 6px 20px rgba(79,159,117,0.08)",
                  }}
                >
                  <Link to={`/profile/${person.$id}`}>
                    <img
                      src={person.imageUrl || "/assets/icons/profile-placeholder.svg"}
                      alt={person.name}
                      className="rounded-full w-16 h-16 object-cover mx-auto"
                      style={{ border: "2px solid #b7dcc8", boxShadow: `0 0 0 4px ${T.bg}` }}
                    />
                    <div className="flex-center flex-col gap-1 mt-2">
                      <p className="base-medium text-center line-clamp-1" style={{ color: T.text, fontWeight: 600 }}>{person.name}</p>
                      <p className="small-regular text-center line-clamp-1" style={{ color: T.muted }}>@{person.username}</p>
                    </div>
                  </Link>
                  {currentUser?.$id !== person.$id && (
                    <button
                      onClick={() => handleFollow(person.$id)}
                      disabled={loadingFollow === person.$id}
                      style={{
                        width: "100%", marginTop: "12px", padding: "9px", borderRadius: "12px",
                        border: `1px solid ${T.border}`, cursor: "pointer", fontWeight: 600,
                        transition: "all 0.25s ease",
                        background: isFollowing ? "#4f9f75" : "linear-gradient(135deg, #4f9f75, #7bbf9a)",
                        color: "#fff", opacity: loadingFollow === person.$id ? 0.6 : 1,
                        boxShadow: isFollowing ? "none" : "0 6px 14px rgba(79,159,117,0.25)",
                      }}
                    >
                      {loadingFollow === person.$id ? "Loading..." : isFollowing ? "Following" : "Follow"}
                    </button>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
};

export default AllUsers;