import { useParams, useNavigate, Link } from "react-router-dom";
import {
  useGetUserById,
  useGetUserPosts,
} from "@/lib/react-query/queriesAndMutations";
import { useUserContext } from "@/context/AuthContext";
import { Loader } from "lucide-react";
import { useState } from "react";
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

  const [open, setOpen] = useState<"followers" | "following" | null>(null);

  const { data: followers } = useQuery({
    queryKey: ["followers", user?.followers],
    queryFn: () => getUsersByIds(user?.followers || []),
    enabled: !!user && open === "followers",
  });

  const { data: following } = useQuery({
    queryKey: ["following", user?.following],
    queryFn: () => getUsersByIds(user?.following || []),
    enabled: !!user && open === "following",
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

      {/* HEADER (TikTok-style compact identity bar) */}
      <div className="sticky top-0 z-10 bg-white/80 backdrop-blur border-b" style={{ borderColor: P[200] }}>
        <div className="max-w-md mx-auto px-4 py-4 flex items-center gap-4">

          {/* Avatar */}
          <img
            src={user.imageUrl || "/assets/icons/profile-placeholder.svg"}
            className="w-16 h-16 rounded-full object-cover"
            style={{ border: `2px solid ${P[200]}` }}
          />

          {/* Info */}
          <div className="flex-1">
            <h1 className="font-bold text-lg" style={{ color: P[700] }}>
              {user.name}
            </h1>
            <p className="text-xs" style={{ color: P[400] }}>
              @{user.username}
            </p>

            {user.bio && (
              <p className="text-xs mt-1 line-clamp-2" style={{ color: P[500] }}>
                {user.bio}
              </p>
            )}
          </div>

          {/* Action */}
          {isOwn ? (
            <Link
              to={`/update-profile/${user.$id}`}
              className="text-xs px-3 py-1 rounded-full text-white"
              style={{ backgroundColor: P[500] }}
            >
              Edit
            </Link>
          ) : (
            <button
              className="text-xs px-3 py-1 rounded-full text-white"
              style={{ backgroundColor: P[500] }}
            >
              Follow
            </button>
          )}
        </div>

        {/* STATS BAR (TikTok-like minimal counters) */}
        <div className="max-w-md mx-auto flex justify-around py-2 text-center">
          <Stat value={posts?.documents?.length || 0} label="Posts" />

          <button onClick={() => setOpen("followers")}>
            <Stat value={user.followers?.length || 0} label="Followers" />
          </button>

          <button onClick={() => setOpen("following")}>
            <Stat value={user.following?.length || 0} label="Following" />
          </button>
        </div>
      </div>

      {/* POSTS (TikTok-style media wall) */}
      <div className="max-w-md mx-auto px-1 py-2">
        {postsLoading ? (
          <div className="flex justify-center py-10">
            <Loader className="animate-spin" />
          </div>
        ) : (posts?.documents || []).length === 0 ? (
          <div className="text-center text-sm py-10" style={{ color: P[400] }}>
            No posts yet
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-[2px]">

            {posts?.documents.map((post: any) => (
              <div
                key={post.$id}
                onClick={() => navigate(`/posts/${post.$id}`)}
                className="relative aspect-square overflow-hidden cursor-pointer"
              >
                <img
                  src={post.imageUrl}
                  className="w-full h-full object-cover hover:scale-105 transition duration-300"
                />

                {/* subtle overlay like TikTok grid */}
                <div className="absolute inset-0 bg-black/10 hover:bg-black/0 transition" />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* MODAL */}
      {open && (
        <Modal
          title={open}
          users={open === "followers" ? followers : following}
          onClose={() => setOpen(null)}
        />
      )}
    </div>
  );
};

/* ================= SMALL UI PIECES ================= */

const Stat = ({ value, label }: any) => (
  <div>
    <p className="text-sm font-bold" style={{ color: "#111" }}>
      {value}
    </p>
    <p className="text-[10px]" style={{ color: "#888" }}>
      {label}
    </p>
  </div>
);

const Modal = ({ title, users, onClose }: any) => (
  <div className="fixed inset-0 bg-black/40 flex items-end justify-center">
    <div className="bg-white w-full max-w-md rounded-t-2xl p-4 max-h-[70vh] overflow-y-auto">

      <div className="flex justify-between mb-3">
        <h3 className="font-semibold">{title}</h3>
        <button onClick={onClose}>✕</button>
      </div>

      <div className="space-y-3">
        {users?.map((u: any) => (
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
        ))}
      </div>

    </div>
  </div>
);

export default Profile;