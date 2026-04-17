import { useParams, useNavigate, Link } from "react-router-dom";
import {
  useGetUserById,
  useGetUserPosts,
} from "@/lib/react-query/queriesAndMutations";
import { useUserContext } from "@/context/AuthContext";
import { Loader } from "lucide-react";
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { getUsersByIds } from "@/lib/appwrite/api";

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

const Profile = () => {
  const { id } = useParams();
  const { user: currentUser } = useUserContext();
  const navigate = useNavigate();

  const { data: user, isLoading } = useGetUserById(id || "");
  const { data: posts, isLoading: postsLoading } = useGetUserPosts(id || "");

  const [showFollowers, setShowFollowers] = useState(false);
  const [showFollowing, setShowFollowing] = useState(false);

  const [searchFollowers, setSearchFollowers] = useState("");
  const [searchFollowing, setSearchFollowing] = useState("");

  const [loadingFollow, setLoadingFollow] = useState<string | null>(null);
  const [isFollowing, setIsFollowing] = useState(false);

  useEffect(() => {
    if (user && currentUser) {
      setIsFollowing(user.followers?.includes(currentUser.$id));
    }
  }, [user, currentUser]);

  const handleFollow = async () => {
    if (!user) return;

    setLoadingFollow(user.$id);

    setTimeout(() => {
      setIsFollowing((prev) => !prev);
      setLoadingFollow(null);
    }, 500);
  };

  const { data: followers } = useQuery({
    queryKey: ["followers", user?.followers],
    queryFn: () => getUsersByIds(user?.followers || []),
    enabled: !!user && showFollowers,
  });

  const { data: following } = useQuery({
    queryKey: ["following", user?.following],
    queryFn: () => getUsersByIds(user?.following || []),
    enabled: !!user && showFollowing,
  });

  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center" style={{ background: P[50] }}>
        <Loader className="animate-spin" />
      </div>
    );
  }

  if (!user) return null;

  const isOwn = currentUser.$id === user.$id;

  return (
    <div className="min-h-screen bg-white">

      {/* HEADER */}
      <div className="max-w-4xl mx-auto px-6 py-8 flex items-center gap-8">

        <img
          src={user.imageUrl || "/assets/icons/profile-placeholder.svg"}
          className="w-24 h-24 md:w-32 md:h-32 rounded-full object-cover"
          style={{ border: `3px solid ${P[200]}` }}
        />

        <div className="flex-1 flex flex-col gap-3">

          <div className="flex items-center gap-4">
            <h1 className="text-xl md:text-2xl font-semibold" style={{ color: P[700] }}>
              {user.name}
            </h1>

            {isOwn ? (
              <Link
                to={`/update-profile/${user.$id}`}
                className="px-4 py-1 rounded-lg text-sm font-medium border"
                style={{ borderColor: P[200], color: P[700] }}
              >
                Edit Profile
              </Link>
            ) : (
              <button
                onClick={handleFollow}
                className="px-4 py-1 rounded-lg text-sm font-medium text-white"
                style={{ backgroundColor: isFollowing ? P[300] : P[500] }}
              >
                {loadingFollow === user.$id
                  ? "Loading..."
                  : isFollowing
                  ? "Following"
                  : "Follow"}
              </button>
            )}
          </div>

          <div className="flex gap-6 text-sm">
            <p>
              <span className="font-semibold">
                {posts?.documents?.length || 0}
              </span>{" "}
              posts
            </p>

            <button onClick={() => setShowFollowers(true)}>
              <span className="font-semibold">
                {user.followers?.length || 0}
              </span>{" "}
              followers
            </button>

            <button onClick={() => setShowFollowing(true)}>
              <span className="font-semibold">
                {user.following?.length || 0}
              </span>{" "}
              following
            </button>
          </div>

        </div>
      </div>

      {/* POSTS */}
      <div className="max-w-4xl mx-auto px-2 py-4">
        {postsLoading ? (
          <div className="flex justify-center py-10">
            <Loader className="animate-spin" />
          </div>
        ) : (posts?.documents || []).length === 0 ? (
          <div className="text-center text-sm py-10 text-gray-400">
            No posts yet
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-[3px]">
            {posts?.documents.map((post: any) => (
              <div
                key={post.$id}
                onClick={() => navigate(`/posts/${post.$id}`)}
                className="relative aspect-square overflow-hidden cursor-pointer"
              >
                <img
                  src={post.imageUrl}
                  className="w-full h-full object-cover"
                />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* FOLLOWERS MODAL */}
      {showFollowers && (
        <Modal
          title="Followers"
          search={searchFollowers}
          setSearch={setSearchFollowers}
          users={followers}
          onClose={() => setShowFollowers(false)}
        />
      )}

      {/* FOLLOWING MODAL */}
      {showFollowing && (
        <Modal
          title="Following"
          search={searchFollowing}
          setSearch={setSearchFollowing}
          users={following}
          onClose={() => setShowFollowing(false)}
        />
      )}
    </div>
  );
};

/* MODAL WITH SEARCH */
const Modal = ({ title, users, search, setSearch, onClose }: any) => {

  const filteredUsers = users?.filter((u: any) =>
    u.name.toLowerCase().includes(search.toLowerCase()) ||
    u.username.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4">

      <div className="bg-white w-full max-w-md rounded-2xl p-4 max-h-[70vh] overflow-y-auto shadow-xl">

        {/* HEADER */}
        <div className="flex justify-between items-center mb-3">
          <h3 className="font-semibold">{title}</h3>
          <button onClick={onClose}>✕</button>
        </div>

        {/* SEARCH */}
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search..."
          className="w-full mb-3 px-3 py-2 text-sm border rounded-lg outline-none"
        />

        {/* LIST */}
     <div className="space-y-3">
  {filteredUsers?.length > 0 ? (
    filteredUsers.map((u: any) => (
      <div key={u.$id} className="flex items-center gap-3">
        <img
          src={u.imageUrl}
          className="w-10 h-10 rounded-full object-cover"
        />
        <div>
          <p className="text-sm font-medium">{u.name}</p>
          <p className="text-xs text-gray-500">@{u.username}</p>
        </div>
      </div>
    ))
  ) : (
    <div className="text-center text-sm text-gray-400 py-6">
      No results found
    </div>
  )}
</div>
      </div>
    </div>
  );
};

export default Profile;