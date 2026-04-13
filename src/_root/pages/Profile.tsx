import { useParams, Link, useNavigate } from "react-router-dom";
import { useGetUserById, useGetUserPosts } from "@/lib/react-query/queriesAndMutations";
import { useUserContext } from "@/context/AuthContext";
import { Loader, X } from "lucide-react";
import { useState } from "react";
import { databases, appwriteConfig } from "@/lib/appwrite/config";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getUsersByIds } from "@/lib/appwrite/api";

const Profile = () => {
  const { id: profileId } = useParams<{ id: string }>();
  const { user: currentUser, setUser } = useUserContext();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  
  const { data: user, isLoading: isUserLoading } = useGetUserById(profileId || "");
  const { data: userPosts, isLoading: isPostsLoading } = useGetUserPosts(profileId || "");
  const [showFollowers, setShowFollowers] = useState(false);
  const [showFollowing, setShowFollowing] = useState(false);

  const { data: followers, isLoading: isFollowersLoading } = useQuery({
    queryKey: ["followers", user?.followers],
    queryFn: () => getUsersByIds(user?.followers || []),
    enabled: !!user && showFollowers,
  });

  const { data: following, isLoading: isFollowingLoading } = useQuery({
    queryKey: ["following", user?.following],
    queryFn: () => getUsersByIds(user?.following || []),
    enabled: !!user && showFollowing,
  });

  const [loadingFollow, setLoadingFollow] = useState(false);

  if (isUserLoading) {
    return (
      <div className="flex justify-center items-center w-full h-full">
        <Loader className="animate-spin" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex justify-center items-center w-full h-full">
        <p className="text-light-4">User not found.</p>
      </div>
    );
  }

  const isOwnProfile = currentUser.$id === user.$id;
  const isFollowing = currentUser.following?.includes(user.$id);
 
  const handleFollow = async () => {
    if (!currentUser || !setUser) return;

    setLoadingFollow(true);
    try {
      const updatedFollowing = [...(currentUser.following || []), user.$id];
      setUser({ ...currentUser, following: updatedFollowing });

      await databases.updateDocument(
        appwriteConfig.databaseId,
        appwriteConfig.usersCollectionId,
        currentUser.$id,
        { following: updatedFollowing }
      );

      const updatedFollowers = [...(user.followers || []), currentUser.$id];
      await databases.updateDocument(
        appwriteConfig.databaseId,
        appwriteConfig.usersCollectionId,
        user.$id,
        { followers: updatedFollowers }
      );

      user.followers = updatedFollowers;

      queryClient.invalidateQueries({ queryKey: ["followers", updatedFollowers] });
      queryClient.invalidateQueries({ queryKey: ["following", currentUser?.following] });
      queryClient.invalidateQueries({ queryKey: ["getUserById", user?.$id] });
      queryClient.invalidateQueries({ queryKey: ["getUserById", currentUser?.$id] });

    } catch (error) {
      console.error("Error following user:", error);
    } finally {
      setLoadingFollow(false);
    }
  };

  return (
    <div className="profile-container w-full min-h-screen px-6 py-10 bg-white">
      {/* Header + Profile Info */}
      <div className="flex flex-col xl:flex-row gap-8 w-full items-start xl:items-center mb-10">
        <img
          src={user.imageUrl || "/assets/icons/profile-placeholder.svg"}
          alt="profile"
          className="w-28 h-28 lg:w-36 lg:h-36 rounded-full object-cover"
        />

        <div className="flex flex-col flex-1 w-full">
          <div className="flex flex-col w-full mb-4">
            <h1 className="text-center xl:text-left h3-bold md:h1-semibold text-black">{user.name}</h1>
            <p className="small-regular md:body-medium text-gray-600 text-center xl:text-left">
              @{user.username}
            </p>
          </div>

          {/* Stats */}
          <div className="flex flex-wrap gap-8 justify-center xl:justify-start items-center mb-5">
            <StatBlock value={userPosts?.documents.length ?? 0} label="Posts" />
            
            {/* ✅ FIXED: Wrapped in button to make it clickable */}
            <button
              onClick={() => setShowFollowers(!showFollowers)}
              className="cursor-pointer hover:opacity-75 transition-opacity"
            >
              <StatBlock value={user.followers?.length ?? 0} label="Followers" />
            </button>

            {/* ✅ FIXED: Wrapped in button to make it clickable */}
            <button
              onClick={() => setShowFollowing(!showFollowing)}
              className="cursor-pointer hover:opacity-75 transition-opacity"
            >
              <StatBlock value={user.following?.length ?? 0} label="Following" />
            </button>
          </div>

          {/* Bio */}
          {user.bio && (
            <p className="small-medium md:base-medium text-center xl:text-left">
              {user.bio}
            </p>
          )}
        </div>

        {/* Edit / Follow button */}
        <div className="flex justify-center mt-5 xl:mt-0">
          {isOwnProfile ? (
            <Link
              to={`/update-profile/${user.$id}`}
              className="h-12 bg-dark-4 px-5 text-light-1 flex items-center justify-center gap-2 rounded-lg"
            >
              <img src="/assets/icons/edit.svg" alt="edit" width={20} height={20} />
              <p className="flex whitespace-nowrap small-medium">Edit Profile</p>
            </Link>
          ) : (
            <button
              className={`shad-button_primary px-8 ${isFollowing ? "bg-blue-600 text-white" : ""}`}
              onClick={handleFollow}
              disabled={loadingFollow || isFollowing}
            >
              {loadingFollow ? "Following..." : isFollowing ? "Following" : "Follow"}
            </button>
          )}
        </div>
      </div>

      {/* Divider */}
      <div className="w-full h-0.5 bg-dark-4/80 mb-8" />

      {/* Posts Section - Full Width */}
      <div className="flex flex-col w-full">
        <h3 className="body-bold md:h3-bold mb-5">Posts</h3>

        {isPostsLoading ? (
          <div className="flex justify-center w-full py-10">
            <Loader className="animate-spin" />
          </div>
        ) : (userPosts?.documents ?? []).length === 0 ? (
          <p className="text-light-4 text-center py-10">No posts yet.</p>
        ) : (
          <ul className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5 w-full">
            {(userPosts?.documents ?? []).map((post: any) => (
              <li
                key={post.$id}
                className="relative cursor-pointer rounded-[24px] overflow-hidden transition-transform duration-200 hover:scale-105"
                onClick={() => navigate(`/posts/${post.$id}`)}
              >
                {post.imageUrl && (
                  <img
                    src={post.imageUrl}
                    alt={post.caption ?? "Post image"}
                    className="w-full aspect-square object-cover"
                  />
                )}

                {post.caption && (
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-4">
                    <p className="text-white small-medium line-clamp-1">{post.caption}</p>
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* ✅ FIXED: Followers Modal */}
      {showFollowers && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full max-h-96 overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold">Followers</h3>
              <button
                onClick={() => setShowFollowers(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X size={24} />
              </button>
            </div>

            {isFollowersLoading ? (
              <div className="flex justify-center py-4">
                <Loader className="animate-spin" />
              </div>
            ) : followers && followers.length > 0 ? (
              <div className="space-y-2">
                {followers.map((u: any) => (
                  <div
                    key={u.$id}
                    onClick={() => {
                      navigate(`/profile/${u.$id}`);
                      setShowFollowers(false);
                    }}
                    className="flex items-center gap-3 p-2 rounded hover:bg-gray-100 cursor-pointer"
                  >
                    <img
                      src={u.imageUrl || "/assets/icons/profile-placeholder.svg"}
                      alt={u.name}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                    <div>
                      <p className="font-semibold">{u.name}</p>
                      <p className="text-sm text-gray-600">@{u.username}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-4">No followers yet</p>
            )}
          </div>
        </div>
      )}

      {/* ✅ FIXED: Following Modal */}
      {showFollowing && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full max-h-96 overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold">Following</h3>
              <button
                onClick={() => setShowFollowing(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X size={24} />
              </button>
            </div>

            {isFollowingLoading ? (
              <div className="flex justify-center py-4">
                <Loader className="animate-spin" />
              </div>
            ) : following && following.length > 0 ? (
              <div className="space-y-2">
                {following.map((u: any) => (
                  <div
                    key={u.$id}
                    onClick={() => {
                      navigate(`/profile/${u.$id}`);
                      setShowFollowing(false);
                    }}
                    className="flex items-center gap-3 p-2 rounded hover:bg-gray-100 cursor-pointer"
                  >
                    <img
                      src={u.imageUrl || "/assets/icons/profile-placeholder.svg"}
                      alt={u.name}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                    <div>
                      <p className="font-semibold">{u.name}</p>
                      <p className="text-sm text-gray-600">@{u.username}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-4">Not following anyone yet</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

const StatBlock = ({ value, label }: { value: number; label: string }) => (
  <div className="flex items-center gap-2">
    <p className="small-semibold lg:body-bold text-gray-900">{value}</p>
    <p className="small-medium lg:base-medium text-gray-600">{label}</p>
  </div>
);

export default Profile;