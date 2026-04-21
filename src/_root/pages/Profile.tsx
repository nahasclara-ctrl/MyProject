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
      <div className="h-screen flex items-center justify-center bg-gradient-to-b from-[#f6fbf8] to-white">
        <Loader className="animate-spin" />
      </div>
    );
  }

  if (!user) return null;

  const isOwn = currentUser.$id === user.$id;

  return (
    <div className="min-h-screen bg-[#fafafa]">

      {/* PROFILE CARD */}
      <div className="max-w-5xl mx-auto px-6 pt-10">

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-10 flex flex-col md:flex-row items-center md:items-start gap-8">

          {/* AVATAR */}
          <img
            src={user.imageUrl || "/assets/icons/profile-placeholder.svg"}
            className="w-28 h-28 md:w-36 md:h-36 rounded-full object-cover shadow-md border"
            style={{ borderColor: P[200] }}
          />

          {/* INFO */}
          <div className="flex-1 w-full">

            {/* NAME + ACTION */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">

              <div>
                <h1 className="text-2xl font-bold text-gray-800">
                  {user.username}
                </h1>
                <p className="text-sm text-gray-500 mt-1">
                  {user.bio}
                </p>
              </div>

              {isOwn ? (
                <Link
                  to={`/update-profile/${user.$id}`}
                  className="px-5 py-2 rounded-xl text-sm font-medium border transition hover:scale-105"
                  style={{ borderColor: P[200], color: P[700] }}
                >
                  Edit Profile
                </Link>
              ) : (
                <button
                  onClick={handleFollow}
                  className="px-5 py-2 rounded-xl text-sm font-medium text-white transition hover:scale-105"
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

            {/* STATS */}
            <div className="flex gap-8 mt-6 text-sm text-gray-700">

              <p>
                <span className="font-bold text-gray-900">
                  {posts?.documents?.length || 0}
                </span>{" "}
                posts
              </p>

              <button
                onClick={() => setShowFollowers(true)}
                className="hover:opacity-70 transition"
              >
                <span className="font-bold text-gray-900">
                  {user.followers?.length || 0}
                </span>{" "}
                followers
              </button>

              <button
                onClick={() => setShowFollowing(true)}
                className="hover:opacity-70 transition"
              >
                <span className="font-bold text-gray-900">
                  {user.following?.length || 0}
                </span>{" "}
                following
              </button>
            </div>

          </div>
        </div>
      </div>

      {/* POSTS GRID (Instagram style) */}
      <div className="max-w-5xl mx-auto px-2 pt-8 pb-12">

        {postsLoading ? (
          <div className="flex justify-center py-10">
            <Loader className="animate-spin" />
          </div>
        ) : (posts?.documents || []).length === 0 ? (
          <div className="text-center text-sm py-16 text-gray-400">
            No posts yet
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-1 md:gap-2">

            {posts?.documents.map((post: any) => (
              <div
                key={post.$id}
                onClick={() => navigate(`/posts/${post.$id}`)}
                className="relative aspect-square cursor-pointer overflow-hidden group bg-black"
              >
                <img
                  src={post.imageUrl}
                  className="w-full h-full object-cover group-hover:scale-110 transition duration-300 opacity-95 group-hover:opacity-100"
                />

                {/* hover overlay */}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition" />
              </div>
            ))}

          </div>
        )}
      </div>

      {/* MODALS (UNCHANGED LOGIC) */}
      {showFollowers && (
        <Modal
          title="Followers"
          search={searchFollowers}
          setSearch={setSearchFollowers}
          users={followers}
          onClose={() => setShowFollowers(false)}
        />
      )}

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

/* MODAL (ONLY STYLED, SAME LOGIC) */
const Modal = ({ title, users, search, setSearch, onClose }: any) => {
  const filteredUsers = users?.filter((u: any) =>
    u.name.toLowerCase().includes(search.toLowerCase()) ||
    u.username.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">

      <div className="bg-white w-full max-w-md rounded-2xl p-5 max-h-[70vh] overflow-y-auto shadow-2xl">

        <div className="flex justify-between items-center mb-4">
          <h3 className="font-semibold text-lg">{title}</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-black">
            ✕
          </button>
        </div>

        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search..."
          className="w-full mb-4 px-3 py-2 text-sm border rounded-xl outline-none focus:ring-2 focus:ring-green-200"
        />

        <div className="space-y-3">

          {filteredUsers?.length > 0 ? (
            filteredUsers.map((u: any) => (
              <div key={u.$id} className="flex items-center gap-3 hover:bg-gray-50 p-2 rounded-lg transition">

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