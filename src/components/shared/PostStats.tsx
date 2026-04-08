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
};

const PostStats = ({ post, userId }: PostStatsProps) => {
  const { user } = useUserContext();
  const queryClient = useQueryClient();
  const { data: currentUser } = useGetCurrentUser();

  const [likes, setLikes] = useState<string[]>(
    Array.isArray(post.likes)
      ? post.likes.map((u: any) => (typeof u === "string" ? u : u.$id))
      : []
  );

  const [isSaved, setIsSaved] = useState<boolean>(false);
  const [savedRecordId, setSavedRecordId] = useState<string | null>(null);

  const { mutate: likePost } = useLikePost();
  const { mutate: savePost, isPending: isSaving } = useSavePost();
  const { mutate: deleteSavedPost, isPending: isDeleting } = useDeletSavedPost();

  // Sync saved state from Appwrite whenever currentUser loads or changes
  useEffect(() => {
    if (!currentUser?.save) return;
    const record = currentUser.save.find(
      (r: any) => r.post?.$id === post.$id
    );
    if (record) {
      setIsSaved(true);
      setSavedRecordId(record.$id);
    } else {
      setIsSaved(false);
      setSavedRecordId(null);
    }
  }, [currentUser, post.$id]);

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

    if (isSaving || isDeleting) return;

    if (isSaved && savedRecordId) {
      // Optimistic unsave
      setIsSaved(false);
      setSavedRecordId(null);

      deleteSavedPost(savedRecordId, {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.GET_CURRENT_USER] });
        },
        onError: () => {
          setIsSaved(true);
          setSavedRecordId(savedRecordId);
        },
      });
    } else if (!isSaved) {
      // Optimistic save
      setIsSaved(true);

      savePost(
        { postId: post.$id, userId: user.id ?? "" },
        {
          onSuccess: (data: any) => {
            setSavedRecordId(data?.$id ?? null);
            queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.GET_CURRENT_USER] });
          },
          onError: () => {
            setIsSaved(false);
            setSavedRecordId(null);
          },
        }
      );
    }
  };

  return (
    <div className="flex justify-between items-center z-20">
      {/* Like button */}
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

      {/* Save button */}
      <div className="flex gap-2">
        <img
          src={isSaved ? "/assets/icons/saved.svg" : "/assets/icons/save.svg"}
          alt="save"
          width={20}
          height={20}
          onClick={handleSavePost}
          className={`cursor-pointer transition-opacity ${isSaving || isDeleting ? "opacity-50" : "opacity-100"}`}
        />
      </div>
    </div>
  );
};

export default PostStats;