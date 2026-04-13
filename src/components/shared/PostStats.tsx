import { useState, useEffect } from "react";
import type { Post } from "@/types";
import { useUserContext } from "@/context/AuthContext";
import {
  useLikePost,
  useSavePost,
  useDeletSavedPost,
  useGetCurrentUser,
} from "@/lib/react-query/queriesAndMutations";
import { useQueryClient } from "@tanstack/react-query";
import { QUERY_KEYS } from "@/lib/react-query/queryKeys";
 
type PostStatsProps = {
  post: Post;
  userId: string;
  showStats?: boolean;
};
 
const PostStats = ({ post, userId, showStats = true }: PostStatsProps) => {
  const { user } = useUserContext();
  const queryClient = useQueryClient();
  const { data: currentUser, isLoading: isLoadingUser } = useGetCurrentUser();
 
  const [likes, setLikes] = useState<string[]>(
    Array.isArray(post.likes)
      ? post.likes.map((u: any) => (typeof u === "string" ? u : u.$id))
      : []
  );
 
  const [isSaved, setIsSaved] = useState<boolean>(false);
  const [savedRecordIds, setSavedRecordIds] = useState<string[]>([]);
  const [isPending, setIsPending] = useState(false);
 
  const { mutate: likePost } = useLikePost();
  const { mutate: savePost, isPending: isSaving } = useSavePost();
  const { mutate: deleteSavedPost, isPending: isDeleting } = useDeletSavedPost();
 
  // Sync saved state from Appwrite
  useEffect(() => {
    if (!currentUser?.save || isLoadingUser) {
      setIsSaved(false);
      setSavedRecordIds([]);
      return;
    }
 
    // Find ALL records for this post
    const allRecordsForPost = currentUser.save.filter((r: any) => {
      const recordPostId = typeof r.post === "string" ? r.post : r.post?.$id;
      return recordPostId === post.$id;
    });
 
    if (allRecordsForPost.length > 0) {
      setIsSaved(true);
      setSavedRecordIds(allRecordsForPost.map((r: any) => r.$id));
      console.log(`✅ Post ${post.$id} is saved. Records:`, allRecordsForPost.map((r: { $id: any; }) => r.$id));
    } else {
      setIsSaved(false);
      setSavedRecordIds([]);
      console.log(`❌ Post ${post.$id} is NOT saved`);
    }
 
    setIsPending(false);
  }, [currentUser, post.$id, isLoadingUser]);
 
  const handleLikePost = (e: React.MouseEvent) => {
    e.stopPropagation();
    const hasLiked = likes.includes(userId);
    const newLikes = hasLiked
      ? likes.filter((id) => id !== userId)
      : [...likes, userId];
    setLikes(newLikes);
    likePost({ postId: post.$id, likesArray: newLikes });
  };
 
  const handleSavePost = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
 
    console.log("===============================================");
    console.log("🖱️ SAVE BUTTON CLICKED");
    console.log("===============================================");
    console.log("Current state:", {
      isSaved,
      savedRecordIds,
      isPending,
      isSaving,
      isDeleting,
      isLoadingUser,
    });
    console.log("User:", user);
    console.log("Post:", post.$id);
    console.log("===============================================");
 
    // Prevent multiple clicks
    if (isSaving || isDeleting || isLoadingUser || isPending) {
      console.warn("⏳ BLOCKED: Already pending/loading");
      return;
    }
 
    if (isSaved && savedRecordIds.length > 0) {
      // UNSAVE
      console.log(`\n🗑️ ACTION: UNSAVE`);
      console.log(`Deleting ${savedRecordIds.length} record(s):`, savedRecordIds);
 
      setIsSaved(false);
      setSavedRecordIds([]);
      setIsPending(true);
 
      savedRecordIds.forEach((recordId, index) => {
        console.log(`\n  [${index + 1}/${savedRecordIds.length}] Calling deleteSavedPost("${recordId}")`);
 
        deleteSavedPost(recordId, {
          onSuccess: () => {
            console.log(`  ✅ SUCCESS: Record ${recordId} deleted`);
          },
          onError: (error) => {
            console.error(`  ❌ ERROR: Failed to delete ${recordId}:`, error);
          },
          onSettled: () => {
            console.log(`  🔄 SETTLED: Record ${recordId} mutation complete`);
          },
        });
      });
 
      // Refetch after a delay to allow mutations to complete
      setTimeout(() => {
        console.log("\n🔄 Refetching queries...");
        queryClient.invalidateQueries({
          queryKey: [QUERY_KEYS.GET_CURRENT_USER],
        });
        queryClient.invalidateQueries({
          queryKey: [QUERY_KEYS.GET_SAVED_POSTS, user?.$id],
        });
        console.log("✅ Refetch triggered");
        setIsPending(false);
      }, 500);
    } else if (!isSaved && savedRecordIds.length === 0) {
      // SAVE
      console.log(`\n💾 ACTION: SAVE`);
      console.log(`User ID: ${user?.$id}`);
 
      setIsSaved(true);
      setIsPending(true);
 
      console.log(`Calling savePost with:`, {
        postId: post.$id,
        userId: user?.$id,
      });
 
      savePost(
        { postId: post.$id, userId: user?.$id ?? "" },
        {
          onSuccess: (data: any) => {
            console.log(`✅ SUCCESS: Post saved`, data);
            setSavedRecordIds([data?.$id ?? ""]);
 
            queryClient.invalidateQueries({
              queryKey: [QUERY_KEYS.GET_CURRENT_USER],
            });
            queryClient.invalidateQueries({
              queryKey: [QUERY_KEYS.GET_SAVED_POSTS, user?.$id],
            });
          },
          onError: (error: any) => {
            console.error(`❌ ERROR: Failed to save:`, error);
            setIsSaved(false);
            setSavedRecordIds([]);
 
            queryClient.invalidateQueries({
              queryKey: [QUERY_KEYS.GET_CURRENT_USER],
            });
          },
          onSettled: () => {
            console.log(`🔄 SETTLED: Save mutation complete`);
            setIsPending(false);
          },
        }
      );
    } else {
      console.warn("⚠️ STATE MISMATCH:", { isSaved, savedRecordIds });
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.GET_CURRENT_USER],
      });
      setIsPending(false);
    }
 
    console.log("===============================================\n");
  };
 
  return (
    <div className="flex justify-between items-center z-20">
      {/* Like button - only show if showStats is true */}
      {showStats && (
        <div className="flex gap-2 mr-5">
          <img
            src={likes.includes(userId) ? "/assets/icons/liked.svg" : "/assets/icons/like.svg"}
            alt="like"
            width={20}
            height={20}
            onClick={handleLikePost}
            className="cursor-pointer"
          />
          <p className="small-medium lg:base-medium">{likes.length}</p>
        </div>
      )}
 
      {/* Save button */}
      <div className="flex gap-2">
        <img
          src={isSaved ? "/assets/icons/saved.svg" : "/assets/icons/save.svg"}
          alt={isSaved ? "unsave" : "save"}
          width={20}
          height={20}
          onClick={handleSavePost}
          className={`cursor-pointer transition-opacity ${
            isSaving || isDeleting || isLoadingUser || isPending ? "opacity-50 cursor-not-allowed" : "opacity-100 cursor-pointer"
          }`}
          title={isSaved ? "Click to unsave" : "Click to save"}
        />
      </div>
    </div>
  );
};
 
export default PostStats;