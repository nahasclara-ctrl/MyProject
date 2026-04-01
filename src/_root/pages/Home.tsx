import { useEffect, useRef } from "react";
import Loader from "@/components/shared/Loader";
import PostCard from "@/components/shared/PostCard";
import { useGetFollowingPosts } from "@/lib/react-query/queriesAndMutations";
import { useUserContext } from "@/context/AuthContext";

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

  const allPosts = posts?.pages.flatMap((page: any) => page.documents) ?? [];

  return (
    <div className="flex flex-1">
      <div className="home-container">
        <div className="home-posts">
          <h2 className="h3-bold md:h2-bold text-left w-full">Home Feed</h2>

          {isPostLoading ? (
            <Loader />
          ) : allPosts.length === 0 ? (
            <p className="text-light-4 text-center w-full mt-10">
              No posts yet. Follow people to see their posts!
            </p>
          ) : (
            <ul className="flex flex-col flex-1 gap-9 w-full">
              {allPosts.map((post: any) => (
                <PostCard post={post} key={post.$id} />
              ))}
            </ul>
          )}

          {/* Infinite scroll trigger */}
          <div ref={bottomRef} className="w-full py-4 flex justify-center">
            {isFetchingNextPage && <Loader />}
            {!hasNextPage && allPosts.length > 0 && (
              <p className="text-light-4 text-sm">You've seen all posts 🎉</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;