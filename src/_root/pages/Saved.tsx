import { useUserContext } from "@/context/AuthContext";
import { useGetSavedPosts } from "@/lib/react-query/queriesAndMutations";
import { useEffect, useState } from "react";
import { getPostById } from "@/lib/appwrite/api";
import Loader from "@/components/shared/Loader";
import GridPostList from "@/components/shared/GridPostList";
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

const Saved = () => {
  const { user } = useUserContext();
  const { darkMode } = useTheme();
  const { data: savedDocs, isLoading, refetch, error } =
    useGetSavedPosts(user?.$id);

  const [savedPosts, setSavedPosts] = useState<any[]>([]);
  const [isLoadingPosts, setIsLoadingPosts] = useState(false);

  // ── Theme tokens ──────────────────────────────────────────────
  const t = {
    pageBg:  darkMode ? D.bg      : `linear-gradient(180deg, ${P[50]}, #ffffff)`,
    surface: darkMode ? D.surface : "#fff",
    border:  darkMode ? D.border  : P[200],
    text:    darkMode ? D.text    : P[700],
    subtext: darkMode ? D.subtext : P[500],
    muted:   darkMode ? D.muted   : P[400],
  };

  useEffect(() => {
    const fetchPosts = async () => {
      if (!savedDocs || savedDocs.length === 0) { setSavedPosts([]); return; }
      setIsLoadingPosts(true);
      try {
        const postsMap = new Map<string, any>();
        for (const doc of savedDocs) {
          if (!doc) continue;
          const postId = typeof doc.post === "string" ? doc.post : doc.post?.$id;
          if (!postId || postsMap.has(postId)) continue;
          try {
            const fetchedPost = await getPostById(postId);
            if (fetchedPost) postsMap.set(postId, fetchedPost);
          } catch {}
        }
        setSavedPosts(Array.from(postsMap.values()).reverse());
      } finally {
        setIsLoadingPosts(false);
      }
    };
    fetchPosts();
  }, [savedDocs]);

  /* ── Loading saved docs ── */
  if (isLoading || isLoadingPosts) {
    return (
      <div className="flex items-center justify-center w-full h-full"
        style={{ background: t.pageBg }}>
        <Loader />
      </div>
    );
  }

  /* ── Error ── */
  if (error) {
    return (
      <div className="min-h-screen p-6" style={{ background: t.pageBg }}>
        <h2 className="text-left text-2xl font-bold" style={{ color: t.text }}>
          Saved Posts
        </h2>
        <div className="mt-10 text-center rounded-2xl p-6 border"
          style={{ borderColor: t.border, backgroundColor: t.surface, color: t.subtext }}>
          Error loading saved posts. Please try again.
        </div>
        <button onClick={() => refetch()}
          className="mt-4 px-5 py-2 rounded-xl text-white font-semibold transition"
          style={{ backgroundColor: P[500] }}
          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = P[600])}
          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = P[500])}>
          Retry
        </button>
      </div>
    );
  }

  /* ── Main ── */
  return (
    <div className="min-h-screen px-6 py-8 transition-colors duration-300"
      style={{ background: t.pageBg, color: t.text }}>

      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold" style={{ color: t.text }}>
          Saved Posts{" "}
          {savedPosts.length > 0 && (
            <span style={{ color: t.subtext, fontSize: 16 }}>
              ({savedPosts.length})
            </span>
          )}
        </h2>
        {savedPosts.length > 0 && (
          <button onClick={() => refetch()}
            className="text-xl font-bold transition"
            style={{ color: t.muted }}
            onMouseEnter={(e) => (e.currentTarget.style.color = t.subtext)}
            onMouseLeave={(e) => (e.currentTarget.style.color = t.muted)}>
            ↻
          </button>
        )}
      </div>

      {/* Empty state */}
      {savedPosts.length === 0 ? (
        <div className="mt-20 text-center rounded-2xl p-10 border"
          style={{ borderColor: t.border, backgroundColor: t.surface }}>
          <p className="text-5xl mb-3">📌</p>
          <p style={{ color: t.subtext }}>No saved posts yet.</p>
          <p className="text-sm mt-1" style={{ color: t.muted }}>
            Save posts to see them here.
          </p>
        </div>
      ) : (
        <div className="w-full flex justify-center max-w-5xl mx-auto">
          <div className="rounded-2xl border p-4 w-full"
            style={{ borderColor: t.border, backgroundColor: t.surface }}>
            <GridPostList posts={savedPosts} showStats={false} />
          </div>
        </div>
      )}
    </div>
  );
};

export default Saved;