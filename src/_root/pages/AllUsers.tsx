import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Loader } from "lucide-react";
import { useUserContext } from "@/context/AuthContext";
import { useGetUsers } from "@/lib/react-query/queriesAndMutations";
import { databases, appwriteConfig } from "@/lib/appwrite/config";
import { useQueryClient } from "@tanstack/react-query";

export interface IUser {
  $id: string;
  name: string;
  username: string;
  bio?: string;
  imageUrl?: string;
  followers?: string[];
  following?: string[];
}

const AllUsers: React.FC = () => {
  const { data: users, isLoading, isError } = useGetUsers();
  const { user: currentUser, setUser } = useUserContext();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [loadingFollow, setLoadingFollow] = useState<string | null>(null);

  if (isLoading) {
    return (
      <div className="flex-center w-full h-full">
        <Loader className="animate-spin" />
      </div>
    );
  }

  if (isError || !users?.documents) {
    return (
      <div className="flex-center w-full h-full">
        <p className="text-light-4">Something went wrong loading users.</p>
      </div>
    );
  }

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
      // 1️⃣ Update currentUser following immediately (context)
      const updatedFollowing = [...(currentUser.following || []), followedUserId];
      setUser({ ...currentUser, following: updatedFollowing });

      // 2️⃣ Update database for currentUser
      await databases.updateDocument(
        appwriteConfig.databaseId,
        appwriteConfig.usersCollectionId,
        currentUser.$id,
        { following: updatedFollowing }
      );

      // 3️⃣ Update database for the followed user
      const followedUser = userList.find((u) => u.$id === followedUserId);
      if (followedUser) {
        const updatedFollowers = [...(followedUser.followers || []), currentUser.$id];
        await databases.updateDocument(
          appwriteConfig.databaseId,
          appwriteConfig.usersCollectionId,
          followedUserId,
          { followers: updatedFollowers }
        );

        // Optional: update local object so the followers count updates if needed elsewhere
        followedUser.followers = updatedFollowers;
      }

      // 4️⃣ Refetch React Query to keep everything in sync
      queryClient.invalidateQueries({ queryKey: ["getUsers"] });
      queryClient.invalidateQueries({ queryKey: ["getUserById", currentUser.$id] });
      queryClient.invalidateQueries({ queryKey: ["getUserById", followedUserId] });

      // 5️⃣ Optional: navigate to followed user's profile
      navigate(`/profile/${followedUserId}`);
    } catch (error) {
      console.error("Error following user:", error);
    } finally {
      setLoadingFollow(null);
    }
  };

  return (
    <div className="common-container">
      <div className="user-container">
        <h2 className="h3-bold md:h2-bold text-left w-full">All Users</h2>

        <ul className="user-grid">
          {userList.map((person) => {
            const isFollowing = currentUser?.following?.includes(person.$id);

            return (
              <li key={person.$id} className="flex-1 min-w-[200px] w-full">
                {/* Profile Link */}
                <Link to={`/profile/${person.$id}`} className="user-card">
                  <img
                    src={person.imageUrl || "/assets/icons/profile-placeholder.svg"}
                    alt={person.name}
                    className="rounded-full w-14 h-14 object-cover"
                  />
                  <div className="flex-center flex-col gap-1">
                    <p className="base-medium text-light-1 text-center line-clamp-1">{person.name}</p>
                    <p className="small-regular text-light-3 text-center line-clamp-1">@{person.username}</p>
                  </div>
                </Link>

                {/* Follow Button */}
                {currentUser?.$id !== person.$id && (
                  <button
                    className={`shad-button_primary px-5 py-2 text-sm mt-2 w-full ${
                      isFollowing ? "bg-gray-400" : ""
                    }`}
                    onClick={() => handleFollow(person.$id)}
                    disabled={loadingFollow === person.$id || isFollowing}
                  >
                    {loadingFollow === person.$id
                      ? "Following..."
                      : isFollowing
                      ? "Following"
                      : "Follow"}
                  </button>
                )}
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
};

export default AllUsers;