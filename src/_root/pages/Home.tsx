import { useEffect, useRef } from "react";
import Loader from "@/components/shared/Loader";
import PostCard from "@/components/shared/PostCard";
import { useGetFollowingPosts } from "@/lib/react-query/queriesAndMutations";
import MoodModal from "@/components/MoodModal";
import { useUserContext } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeProvider";

const P = {
  50: "#f6fbf8", 100: "#eaf5ef", 200: "#d6ebe0",
  300: "#b7dcc8", 400: "#7bbf9a", 500: "#4f9f75",
  600: "#3f8a63", 700: "#2f6e4f",
};

const D = {
  bg:       "#0f1a14",
  blob1:    "#1a2b20",
  blob2:    "#2a3f30",
  surface:  "#1a2b20",
  border:   "#2a3f30",
  borderHover: "#3a5444",
  text:     "#d6ebe0",
  subtext:  "#7bbf9a",
  muted:    "#3a5444",
};

const Home = () => {
  const { user: currentUser } = useUserContext();
  const { darkMode } = useTheme(); // ← only addition

  const {
    data: posts,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isPending: isPostLoading,
  } = useGetFollowingPosts(currentUser);

  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      { threshold: 0.1 }
    );

    if (bottomRef.current) observer.observe(bottomRef.current);
    return () => observer.disconnect();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  const allPosts = posts?.pages.flatMap((page: any) => page.documents) ?? [];

  // ── Theme tokens ──────────────────────────────────────────────
  const t = {
    pageBg:       darkMode ? D.bg      : `linear-gradient(135deg, ${P[50]}, ${P[100]}, #ffffff)`,
    blob1Bg:      darkMode ? D.blob1   : P[200],
    blob2Bg:      darkMode ? D.blob2   : P[300],
    blob3Bg:      darkMode ? D.blob1   : P[100],
    heading:      darkMode ? D.text    : P[700],
    emptyBg:      darkMode ? D.surface : P[50],
    emptyBorder:  darkMode ? D.border  : P[200],
    emptyTitle:   darkMode ? D.subtext : P[500],
    emptySub:     darkMode ? D.muted   : P[400],
    cardBg:       darkMode ? D.surface : "#ffffff",
    cardBorder:   darkMode ? D.border  : P[200],
    cardBorderHover: darkMode ? D.borderHover : P[300],
    endText:      darkMode ? D.muted   : P[400],
  };

  return (
    <>
      <MoodModal
        userId={currentUser?.$id}
        userDisplayName={currentUser?.name}
      />

      <div
        className="flex flex-1 relative overflow-hidden transition-colors duration-300"
        style={{ background: t.pageBg }}
      >
        {/* ambient background blobs */}
        <div
          className="absolute -top-40 -left-40 w-[420px] h-[420px] rounded-full blur-3xl"
          style={{ backgroundColor: t.blob1Bg, opacity: darkMode ? 0.3 : 0.5 }}
        />
        <div
          className="absolute top-40 right-0 w-[320px] h-[320px] rounded-full blur-3xl"
          style={{ backgroundColor: t.blob2Bg, opacity: darkMode ? 0.2 : 0.35 }}
        />
        <div
          className="absolute bottom-0 left-1/2 w-[360px] h-[360px] rounded-full blur-3xl"
          style={{ backgroundColor: t.blob3Bg, opacity: darkMode ? 0.25 : 0.6 }}
        />

        <div className="relative z-10 w-full">
          <div className="w-full max-w-2xl mx-auto py-10 px-4">

            {/* HEADER */}
            <h2
              className="text-3xl md:text-4xl font-bold tracking-tight mb-8 transition-colors duration-300"
              style={{ color: t.heading }}
            >
              Home Feed
            </h2>

            {/* POSTS */}
            {isPostLoading ? (
              <div className="flex justify-center items-center py-20">
                <Loader />
              </div>
            ) : allPosts.length === 0 ? (
              <div
                className="w-full text-center mt-16 p-10 rounded-2xl border transition-colors duration-300"
                style={{ backgroundColor: t.emptyBg, borderColor: t.emptyBorder }}
              >
                <p className="text-lg font-medium" style={{ color: t.emptyTitle }}>
                  No posts yet
                </p>
                <p className="text-sm mt-2" style={{ color: t.emptySub }}>
                  Follow people to start seeing fresh content 🌿
                </p>
              </div>
            ) : (
              <ul className="flex flex-col gap-6 w-full">
                {allPosts.map((post: any) => (
                  <div
                    key={post.$id}
                    className="rounded-2xl border shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md"
                    style={{ backgroundColor: t.cardBg, borderColor: t.cardBorder }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.borderColor = t.cardBorderHover)
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.borderColor = t.cardBorder)
                    }
                  >
                    <PostCard post={post} />
                  </div>
                ))}
              </ul>
            )}

            {/* INFINITE SCROLL */}
            <div ref={bottomRef} className="w-full py-10 flex justify-center">
              {isFetchingNextPage && <Loader />}
              {!hasNextPage && allPosts.length > 0 && (
                <p className="text-sm font-medium" style={{ color: t.endText }}>
                  You've reached the end ✨
                </p>
              )}
            </div>

          </div>
        </div>
      </div>
    </>
  );
};

export default Home;