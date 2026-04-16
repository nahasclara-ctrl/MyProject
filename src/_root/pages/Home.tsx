import { useEffect, useRef } from "react";
import Loader from "@/components/shared/Loader";
import PostCard from "@/components/shared/PostCard";
import { useGetFollowingPosts } from "@/lib/react-query/queriesAndMutations";
import MoodModal from "@/components/MoodModal";
import { useUserContext } from "@/context/AuthContext";

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

const Home = () => {
  const { user: currentUser } = useUserContext();

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

  const allPosts =
    posts?.pages.flatMap((page: any) => page.documents) ?? [];

  return (
    <>
      <MoodModal
        userId={currentUser?.$id}
        userDisplayName={currentUser?.name}
      />

      <div
        className="flex flex-1 relative overflow-hidden"
        style={{
          background: `linear-gradient(135deg, ${P[50]}, ${P[100]}, #ffffff)`,
        }}
      >
        {/* ambient background blobs */}
        <div
          className="absolute -top-40 -left-40 w-[420px] h-[420px] rounded-full blur-3xl"
          style={{ backgroundColor: P[200], opacity: 0.5 }}
        />
        <div
          className="absolute top-40 right-0 w-[320px] h-[320px] rounded-full blur-3xl"
          style={{ backgroundColor: P[300], opacity: 0.35 }}
        />
        <div
          className="absolute bottom-0 left-1/2 w-[360px] h-[360px] rounded-full blur-3xl"
          style={{ backgroundColor: P[100], opacity: 0.6 }}
        />

        <div className="relative z-10 w-full">
          <div className="w-full max-w-2xl mx-auto py-10 px-4">

            {/* HEADER */}
            <h2
              className="text-3xl md:text-4xl font-bold tracking-tight mb-8"
              style={{ color: P[700] }}
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
                className="w-full text-center mt-16 p-10 rounded-2xl border"
                style={{
                  backgroundColor: P[50],
                  borderColor: P[200],
                }}
              >
                <p
                  className="text-lg font-medium"
                  style={{ color: P[500] }}
                >
                  No posts yet
                </p>
                <p className="text-sm mt-2" style={{ color: P[400] }}>
                  Follow people to start seeing fresh content 🌿
                </p>
              </div>
            ) : (
              <ul className="flex flex-col gap-6 w-full">
                {allPosts.map((post: any) => (
                  <div
                    key={post.$id}
                    className="rounded-2xl bg-white border shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md"
                    style={{
                      borderColor: P[200],
                    }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.borderColor = P[300])
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.borderColor = P[200])
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
                <p style={{ color: P[400] }} className="text-sm font-medium">
                  You’ve reached the end ✨
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