import { useUserContext } from "@/context/AuthContext";
import { useGetSavedPosts } from "@/lib/react-query/queriesAndMutations";
import { useEffect, useState } from "react";
import { getPostById } from "@/lib/appwrite/api";
import Loader from "@/components/shared/Loader";
import GridPostList from "@/components/shared/GridPostList";

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

const Saved = () => {
  const { user } = useUserContext();
  const { data: savedDocs, isLoading, refetch, error } =
    useGetSavedPosts(user?.$id);

  const [savedPosts, setSavedPosts] = useState<any[]>([]);
  const [isLoadingPosts, setIsLoadingPosts] = useState(false);

  useEffect(() => {
    const fetchPosts = async () => {
      if (!savedDocs || savedDocs.length === 0) {
        setSavedPosts([]);
        return;
      }

      setIsLoadingPosts(true);

      try {
        const postsMap = new Map<string, any>();

        for (const doc of savedDocs) {
          if (!doc) continue;

          const postId =
            typeof doc.post === "string" ? doc.post : doc.post?.$id;

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

  /* ================= LOADING SAVED DOCS ================= */
  if (isLoading) {
    return (
      <div
        className="flex items-center justify-center w-full h-full"
        style={{
          background: `linear-gradient(135deg, ${P[50]}, ${P[100]})`,
        }}
      >
        <Loader />
      </div>
    );
  }

  /* ================= ERROR ================= */
  if (error) {
    return (
      <div
        className="min-h-screen p-6"
        style={{
          background: `linear-gradient(135deg, ${P[50]}, #ffffff)`,
        }}
      >
        <h2 className="text-left text-2xl font-bold" style={{ color: P[700] }}>
          Saved Posts
        </h2>

        <div
          className="mt-10 text-center rounded-2xl p-6 border"
          style={{
            borderColor: P[200],
            backgroundColor: "#fff",
            color: P[600],
          }}
        >
          Error loading saved posts. Please try again.
        </div>

        <button
          onClick={() => refetch()}
          className="mt-4 px-5 py-2 rounded-xl text-white font-semibold transition"
          style={{ backgroundColor: P[500] }}
          onMouseEnter={(e) =>
            (e.currentTarget.style.backgroundColor = P[600])
          }
          onMouseLeave={(e) =>
            (e.currentTarget.style.backgroundColor = P[500])
          }
        >
          Retry
        </button>
      </div>
    );
  }

  /* ================= LOADING POSTS ================= */
  if (isLoadingPosts) {
    return (
      <div
        className="flex items-center justify-center w-full h-full"
        style={{
          background: `linear-gradient(135deg, ${P[50]}, ${P[100]})`,
        }}
      >
        <Loader />
      </div>
    );
  }

  /* ================= MAIN ================= */
  return (
    <div
      className="min-h-screen px-6 py-8"
      style={{
        background: `linear-gradient(180deg, ${P[50]}, #ffffff)`,
      }}
    >
      {/* HEADER */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold" style={{ color: P[700] }}>
          Saved Posts{" "}
          {savedPosts.length > 0 && (
            <span style={{ color: P[500], fontSize: 16 }}>
              ({savedPosts.length})
            </span>
          )}
        </h2>

        {savedPosts.length > 0 && (
          <button
            onClick={() => refetch()}
            className="text-xl font-bold transition"
            style={{ color: P[400] }}
            onMouseEnter={(e) => (e.currentTarget.style.color = P[500])}
            onMouseLeave={(e) => (e.currentTarget.style.color = P[400])}
          >
            ↻
          </button>
        )}
      </div>

      {/* EMPTY STATE */}
      {savedPosts.length === 0 ? (
        <div
          className="mt-20 text-center rounded-2xl p-10 border"
          style={{
            borderColor: P[200],
            backgroundColor: "#fff",
          }}
        >
          <p className="text-5xl mb-3">📌</p>

          <p style={{ color: P[500] }}>No saved posts yet.</p>

          <p className="text-sm mt-1" style={{ color: P[400] }}>
            Save posts to see them here.
          </p>
        </div>
      ) : (
        <div className="w-full flex justify-center max-w-5xl mx-auto">
          <div
            className="rounded-2xl border p-4 w-full"
            style={{
              borderColor: P[200],
              backgroundColor: "#fff",
            }}
          >
            <GridPostList posts={savedPosts} showStats={false} />
          </div>
        </div>
      )}
    </div>
  );
};

export default Saved;