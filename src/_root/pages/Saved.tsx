import { useUserContext } from "@/context/AuthContext";
import { useGetSavedPosts } from "@/lib/react-query/queriesAndMutations";
import { useEffect, useState } from "react";
import { getPostById } from "@/lib/appwrite/api";
import Loader from "@/components/shared/Loader";
import GridPostList from "@/components/shared/GridPostList";
 
const Saved = () => {
  const { user } = useUserContext();
  const { data: savedDocs, isLoading, refetch, error } = useGetSavedPosts(user?.$id);
 
  const [savedPosts, setSavedPosts] = useState<any[]>([]);
  const [isLoadingPosts, setIsLoadingPosts] = useState(false);
 
  useEffect(() => {
    const fetchPosts = async () => {
      // Handle no data
      if (!savedDocs || savedDocs.length === 0) {
        console.log("✅ No saved posts");
        setSavedPosts([]);
        return;
      }
 
      console.log(`📝 Found ${savedDocs.length} saved records`);
      setIsLoadingPosts(true);
      try {
        // Use a Map to deduplicate by post ID (Instagram style)
        const postsMap = new Map<string, any>();
 
        // Fetch all posts
        for (const doc of savedDocs) {
          if (!doc) continue;
 
          const postId =
            typeof doc.post === "string"
              ? doc.post
              : doc.post?.$id;
 
          if (!postId) {
            console.warn("Save record has no post ID:", doc);
            continue;
          }
 
          // Skip if we already have this post (deduplicate)
          if (postsMap.has(postId)) {
            console.log(`  ⚠️ Post ${postId} already fetched, skipping duplicate`);
            continue;
          }
 
          try {
            console.log(`  - Fetching post ${postId}...`);
            const fetchedPost = await getPostById(postId);
            if (fetchedPost) {
              // Store by ID so we only keep one copy
              postsMap.set(postId, fetchedPost);
              console.log(`  ✅ Got post`);
            }
          } catch (error) {
            console.error(`Failed to fetch post ${postId}:`, error);
            // Continue fetching other posts even if one fails
          }
        }
 
        // Convert map to array and reverse to show newest first
        const posts = Array.from(postsMap.values()).reverse();
        console.log(`✅ Total unique posts: ${posts.length}`);
        setSavedPosts(posts);
      } catch (error) {
        console.error("Failed to fetch saved posts:", error);
        setSavedPosts([]);
      } finally {
        setIsLoadingPosts(false);
      }
    };
 
    fetchPosts();
  }, [savedDocs]);
 
  if (isLoading) {
    return (
      <div className="flex-center w-full h-full">
        <Loader />
      </div>
    );
  }
 
  if (error) {
    return (
      <div className="saved-container">
        <h2 className="h3-bold md:h2-bold text-left w-full">Saved Posts</h2>
        <div className="text-red-500 mt-10 text-center w-full">
          Error loading saved posts. Please try again.
        </div>
        <button
          onClick={() => refetch()}
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Retry
        </button>
      </div>
    );
  }
 
  if (isLoadingPosts) {
    return (
      <div className="flex-center w-full h-full">
        <Loader />
      </div>
    );
  }
 
  return (
    <div className="saved-container">
      <div className="flex justify-between items-center mb-6">
        <h2 className="h3-bold md:h2-bold text-left w-full">
          Saved Posts {savedPosts.length > 0 && `(${savedPosts.length})`}
        </h2>
        {savedPosts.length > 0 && (
          <button
            onClick={() => refetch()}
            className="text-sm text-light-3 hover:text-light-1 transition-colors"
            title="Refresh saved posts"
          >
            ↻
          </button>
        )}
      </div>
 
      {savedPosts.length === 0 ? (
        <p className="text-light-4 mt-10 text-center w-full">
          No saved posts yet.
        </p>
      ) : (
        <div className="w-full flex justify-center max-w-5xl">
          {/* Pass showStats={false} to GridPostList - this hides likes and shows only save button */}
          <GridPostList posts={savedPosts} showStats={false} />
        </div>
      )}
    </div>
  );
};
 
export default Saved;