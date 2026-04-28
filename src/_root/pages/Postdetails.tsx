import { useGetPostById } from "@/lib/react-query/queriesAndMutations";
import { useParams, Link } from "react-router-dom";
import Loader from "@/components/shared/Loader";
import { formatDate } from "@/lib/utils";
import { useUserContext } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import PostStats from "@/components/shared/PostStats";
import { type AppwritePost } from "@/types";
import { useTheme } from "@/context/ThemeProvider";

const P = {
  50: "#f6fbf8", 100: "#eaf5ef", 200: "#d6ebe0",
  300: "#b7dcc8", 400: "#7bbf9a", 500: "#4f9f75",
  600: "#3f8a63", 700: "#2f6e4f",
};

const D = {
  bg:      "#0f1a14",
  surface: "#1a2b20",
  border:  "#2a3f30",
  text:    "#d6ebe0",
  subtext: "#7bbf9a",
  muted:   "#3a5444",
};

const Postdetails = () => {
  const { id } = useParams();
  const { data: post, isPending } = useGetPostById(id || "");
  const { user } = useUserContext();
  const { darkMode } = useTheme(); // ← only addition

  const handleDeletePost = () => {};

  // ── Theme tokens ──────────────────────────────────────────────
  const t = {
    pageBg:  darkMode ? D.bg      : `linear-gradient(180deg, ${P[50]}, #ffffff)`,
    surface: darkMode ? D.surface : "#ffffff",
    border:  darkMode ? D.border  : P[200],
    text:    darkMode ? D.text    : P[700],
    subtext: darkMode ? D.subtext : P[400],
    caption: darkMode ? D.text    : P[600],
    tagBg:   darkMode ? D.muted   : P[50],
    tagText: darkMode ? D.subtext : P[500],
    divider: darkMode ? D.border  : P[200],
  };

  if (isPending) {
    return (
      <div
        className="flex justify-center items-center min-h-screen transition-colors duration-300"
        style={{ background: t.pageBg }}
      >
        <Loader />
      </div>
    );
  }

  if (!post) {
    return (
      <div
        className="flex justify-center items-center min-h-screen transition-colors duration-300"
        style={{ background: t.pageBg }}
      >
        <div
          className="p-6 rounded-2xl border text-center"
          style={{ background: t.surface, borderColor: t.border, color: t.caption }}
        >
          Post not found.
        </div>
      </div>
    );
  }

  const isOwner = user.id === post?.creator?.$id;

  return (
    <div
      className="min-h-screen flex justify-center px-4 py-10 transition-colors duration-300"
      style={{ background: t.pageBg }}
    >
      <div
        className="w-full max-w-4xl rounded-2xl overflow-hidden border shadow-sm transition-colors duration-300"
        style={{ borderColor: t.border, background: t.surface }}
      >
        {/* IMAGE */}
        {post.imageUrl && (
          <img
            src={post.imageUrl}
            alt="post"
            className="w-full max-h-[520px] object-cover"
          />
        )}

        {/* CONTENT */}
        <div className="p-6 flex flex-col gap-5">

          {/* HEADER */}
          <div className="flex justify-between items-start">
            {post.creator && (
              <Link
                to={`/profile/${post.creator.$id}`}
                className="flex items-center gap-3"
              >
                <img
                  src={post.creator.imageUrl || "/assets/icons/profile-placeholder.svg"}
                  className="w-11 h-11 rounded-full object-cover"
                  style={{ border: `1px solid ${t.border}` }}
                />
                <div>
                  <p className="font-semibold" style={{ color: t.text }}>
                    {post.creator.name}
                  </p>
                  <p className="text-xs" style={{ color: t.subtext }}>
                    {post.$createdAt ? formatDate(post.$createdAt) : ""}
                    {post.location && ` • ${post.location}`}
                  </p>
                </div>
              </Link>
            )}

            {/* ACTIONS */}
            <div className="flex items-center gap-3">
              {isOwner && (
                <>
                  <Link to={`/update-post/${post?.$id}`}>
                    <img
                      src="/assets/icons/edit.svg"
                      width={20}
                      height={20}
                      className="opacity-60 hover:opacity-100 transition"
                      style={{ filter: darkMode ? "invert(1)" : "none" }}
                    />
                  </Link>
                  <Button onClick={handleDeletePost} variant="ghost" className="p-1">
                    <img
                      src="/assets/icons/delete.svg"
                      width={20}
                      height={20}
                      className="opacity-60 hover:opacity-100 transition"
                      style={{ filter: darkMode ? "invert(1)" : "none" }}
                    />
                  </Button>
                </>
              )}
            </div>
          </div>

          {/* DIVIDER */}
          <div className="h-px" style={{ backgroundColor: t.divider }} />

          {/* CAPTION */}
          <div className="space-y-3">
            <p style={{ color: t.caption }}>{post?.caption}</p>
            <ul className="flex flex-wrap gap-2">
              {post?.tags.map((tag: string, index: number) => (
                <li
                  key={`${tag}-${index}`}
                  className="text-sm px-2 py-1 rounded-full"
                  style={{
                    color: t.tagText,
                    backgroundColor: t.tagBg,
                    border: `1px solid ${t.border}`,
                  }}
                >
                  #{tag}
                </li>
              ))}
            </ul>
          </div>

          {/* STATS */}
          <div className="pt-4 border-t" style={{ borderColor: t.divider }}>
            <PostStats
              post={post as unknown as AppwritePost}
              userId={user.id || ""}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Postdetails;
