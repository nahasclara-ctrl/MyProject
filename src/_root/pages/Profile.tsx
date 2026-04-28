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
import { useTheme } from "@/context/ThemeProvider";

/* COLORS */
const P = {
  50: "#f6fbf8", 100: "#eaf5ef", 200: "#d6ebe0",
  300: "#b7dcc8", 400: "#7bbf9a", 500: "#4f9f75",
  600: "#3f8a63", 700: "#2f6e4f",
};

const D = {
  bg: "#0f1a14",
  surface: "#1a2b20",
  border: "#2a3f30",
  text: "#d6ebe0",
  subtext: "#7bbf9a",
  muted: "#3a5444",
  hover: "#1e3326",
};

const Profile = () => {
  const { id } = useParams();
  const { user: currentUser } = useUserContext();
  const navigate = useNavigate();
  const { darkMode } = useTheme();

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

  const t = {
    pageBg: darkMode ? D.bg : "#fafafa",
    surface: darkMode ? D.surface : "#ffffff",
    border: darkMode ? D.border : "#f3f4f6",
    text: darkMode ? D.text : "#1f2937",
    subtext: darkMode ? D.subtext : "#6b7280",
    muted: darkMode ? D.muted : "#9ca3af",
    statNum: darkMode ? D.text : "#111827",
  };

  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <Loader className="animate-spin" />
      </div>
    );
  }

  if (!user) return null;

  const isOwn = currentUser.$id === user.$id;

  return (
    <div className="min-h-screen" style={{ background: t.pageBg }}>

      {/* PROFILE */}
      <div className="max-w-5xl mx-auto px-6 pt-10">
        <div className="rounded-2xl border p-8 flex flex-col md:flex-row gap-8"
             style={{ background: t.surface, borderColor: t.border }}>

          <img
            src={user.imageUrl}
            className="w-32 h-32 rounded-full object-cover"
          />

          <div className="flex-1">
            <div className="flex justify-between items-center">
              <h1 className="text-2xl font-bold" style={{ color: t.text }}>
                {user.username}
              </h1>

              {isOwn ? (
                <Link to={`/update-profile/${user.$id}`} className="border px-4 py-2 rounded-lg">
                  Edit
                </Link>
              ) : (
                <button
                  onClick={handleFollow}
                  className="px-4 py-2 rounded-lg text-white"
                  style={{ background: isFollowing ? P[300] : P[500] }}
                >
                  {loadingFollow ? "..." : isFollowing ? "Following" : "Follow"}
                </button>
              )}
            </div>

            <p style={{ color: t.subtext }}>{user.bio}</p>

            <div className="flex gap-6 mt-4">
              <p><b>{posts?.documents?.length}</b> posts</p>
              <button onClick={() => setShowFollowers(true)}>
                <b>{user.followers?.length}</b> followers
              </button>
              <button onClick={() => setShowFollowing(true)}>
                <b>{user.following?.length}</b> following
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* POSTS */}
      <div className="max-w-5xl mx-auto grid grid-cols-3 gap-2 mt-8 px-2">
        {posts?.documents?.map((p: any) => (
          <img
            key={p.$id}
            src={p.imageUrl}
            className="aspect-square object-cover cursor-pointer"
            onClick={() => navigate(`/posts/${p.$id}`)}
          />
        ))}
      </div>

      {/* MODAL */}
      {showFollowers && (
        <Modal
          title="Followers"
          users={followers}
          search={searchFollowers}
          setSearch={setSearchFollowers}
          onClose={() => setShowFollowers(false)}
          darkMode={darkMode}
          t={t}
        />
      )}

      {showFollowing && (
        <Modal
          title="Following"
          users={following}
          search={searchFollowing}
          setSearch={setSearchFollowing}
          onClose={() => setShowFollowing(false)}
          darkMode={darkMode}
          t={t}
        />
      )}
    </div>
  );
};

/* ================= MODAL ================= */
const Modal = ({ title, users, search, setSearch, onClose, darkMode, t }: any) => {
  const navigate = useNavigate();

  const filteredUsers = users?.filter((u: any) =>
    u.name.toLowerCase().includes(search.toLowerCase()) ||
    u.username.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="fixed inset-0 flex items-center justify-center p-4 z-50"
         style={{ background: "rgba(0,0,0,0.6)" }}>

      <div className="w-full max-w-xl rounded-2xl flex flex-col overflow-hidden"
           style={{ background: t.surface, maxHeight: "75vh" }}>

        {/* HEADER */}
        <div className="sticky top-0 flex justify-between px-5 py-4 border-b"
             style={{ background: t.surface, borderColor: t.border }}>
          <h3 style={{ color: t.text }}>{title}</h3>
          <button onClick={onClose}>✕</button>
        </div>

        {/* SEARCH */}
        <div className="sticky top-[60px] px-5 py-3 border-b"
             style={{ background: t.surface, borderColor: t.border }}>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search..."
            className="w-full px-3 py-2 rounded-lg"
          />
        </div>

        {/* LIST */}
        <div className="overflow-y-auto flex-1">
          {filteredUsers?.map((u: any) => (
            <div
              key={u.$id}
              className="flex items-center gap-3 p-4 cursor-pointer"
              onClick={() => {
                navigate(`/profile/${u.$id}`);
                onClose();
              }}
            >
              <img src={u.imageUrl} className="w-12 h-12 rounded-full" />
              <div>
                <p style={{ color: t.text }}>{u.name}</p>
                <p style={{ color: t.subtext }}>@{u.username}</p>
              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
};

export default Profile;