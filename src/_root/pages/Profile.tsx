import { useParams, Link, useNavigate } from "react-router-dom";
import { useGetUserById, useGetUserPosts } from "@/lib/react-query/queriesAndMutations";
import { useUserContext } from "@/context/AuthContext";
import { Loader } from "lucide-react";
import { useState } from "react";
import { databases, appwriteConfig } from "@/lib/appwrite/config";

const Profile = () => {
  const { id: profileId } = useParams<{ id: string }>();
  const { user: currentUser, setUser } = useUserContext();
  const navigate = useNavigate();

  const { data: user, isLoading: isUserLoading } = useGetUserById(profileId || "");
  const { data: userPosts, isLoading: isPostsLoading } = useGetUserPosts(profileId || "");

  const [loadingFollow, setLoadingFollow] = useState(false);

  if (isUserLoading) {
    return (
      <div className="flex-center w-full h-full">
        <Loader className="animate-spin" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex-center w-full h-full">
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
      // 1️⃣ Update currentUser following immediately (context)
      const updatedFollowing = [...(currentUser.following || []), user.$id];
      setUser({ ...currentUser, following: updatedFollowing });

      // 2️⃣ Update database for currentUser
      await databases.updateDocument(
        appwriteConfig.databaseId,
        appwriteConfig.usersCollectionId,
        currentUser.$id,
        { following: updatedFollowing }
      );

      // 3️⃣ Update database for the followed user
      const updatedFollowers = [...(user.followers || []), currentUser.$id];
      await databases.updateDocument(
        appwriteConfig.databaseId,
        appwriteConfig.usersCollectionId,
        user.$id,
        { followers: updatedFollowers }
      );

      // 4️⃣ Update local user object to reflect new followers count
      user.followers = updatedFollowers;
    } catch (error) {
      console.error("Error following user:", error);
    } finally {
      setLoadingFollow(false);
    }
  };

  return (
    <div className="profile-container">
      <div className="profile-inner_container">
        {/* Header */}
        <div className="flex xl:flex-row flex-col max-xl:items-center flex-1 gap-7">
          <img
            src={user.imageUrl || "/assets/icons/profile-placeholder.svg"}
            alt="profile"
            className="w-28 h-28 lg:h-36 lg:w-36 rounded-full object-cover"
          />

          <div className="flex flex-col flex-1 justify-between md:mt-2">
            <div className="flex flex-col w-full">
              <h1 className="text-center xl:text-left h3-bold md:h1-semibold w-full">{user.name}</h1>
              <p className="small-regular md:body-medium text-light-3 text-center xl:text-left">
                @{user.username}
              </p>
            </div>

            {/* Stats */}
            <div className="flex gap-8 mt-10 items-center justify-center xl:justify-start flex-wrap z-20">
              <StatBlock value={userPosts?.documents.length ?? 0} label="Posts" />
              <StatBlock value={user.followers?.length ?? 0} label="Followers" />
              <StatBlock value={currentUser.following?.length ?? 0} label="Following" />
            </div>

            {/* Bio */}
            {user.bio && (
              <p className="small-medium md:base-medium text-center xl:text-left mt-7 max-w-screen-sm">
                {user.bio}
              </p>
            )}
          </div>

          {/* Edit / Follow button */}
          <div className="flex justify-center gap-4">
            {isOwnProfile ? (
              <Link
                to={`/update-profile/${user.$id}`}
                className="h-12 bg-dark-4 px-5 text-light-1 flex-center gap-2 rounded-lg"
              >
                <img src="/assets/icons/edit.svg" alt="edit" width={20} height={20} />
                <p className="flex whitespace-nowrap small-medium">Edit Profile</p>
              </Link>
            ) : (
              <button
                className={`shad-button_primary px-8 ${isFollowing ? "bg-gray-400" : ""}`}
                onClick={handleFollow}
                disabled={loadingFollow || isFollowing}
              >
                {loadingFollow ? "Following..." : isFollowing ? "Following" : "Follow"}
              </button>
            )}
          </div>
        </div>

        {/* Divider */}
        <div className="flex w-full h-0.5 bg-dark-4/80 mt-10" />

        {/* Posts Grid */}
        <div className="flex flex-col w-full mt-8">
          <h3 className="body-bold md:h3-bold mb-5">Posts</h3>

          {isPostsLoading ? (
            <div className="flex-center w-full py-10">
              <Loader className="animate-spin" />
            </div>
          ) : userPosts?.documents.length === 0 ? (
            <p className="text-light-4 text-center py-10">No posts yet.</p>
          ) : (
            <ul className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 w-full">
              {userPosts?.documents.map((post: any) => (
                <li
                  key={post.$id}
                  className="relative min-w-80 h-80 cursor-pointer"
                  onClick={() => navigate(`/posts/${post.$id}`)}
                >
                  <img
                    src={post.imageUrl}
                    alt={post.caption}
                    className="w-full h-full object-cover rounded-[24px]"
                  />
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent rounded-b-[24px] p-4">
                    <p className="text-white small-medium line-clamp-1">{post.caption}</p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};

const StatBlock = ({ value, label }: { value: number; label: string }) => (
  <div className="flex-center gap-2">
    <p className="small-semibold lg:body-bold text-primary-500">{value}</p>
    <p className="small-medium lg:base-medium text-light-2">{label}</p>
  </div>
);

export default Profile;