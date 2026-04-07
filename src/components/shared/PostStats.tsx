import { useState } from "react";
import type { Post } from "@/types";
import { useUserContext } from "@/context/AuthContext";
import {
  useLikePost,
  useSavePost,
  useDeletSavedPost,
  useGetCurrentUser,useGetSavedPosts,
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

  // ✅ Fix likes initialization
  const [likes, setLikes] = useState<string[]>(
    Array.isArray(post.likes)
      ? post.likes.map((u: any) =>
          typeof u === "string" ? u : u.$id
        )
      : []
  );

  const { mutate: likePost } = useLikePost();
  const { mutate: savePost } = useSavePost();
  const { mutate: deleteSavedPost } = useDeletSavedPost();
  const { data: currentUser } = useGetCurrentUser();

  // ✅ FIXED: handle post as string OR object
  const savedRecord = currentUser?.save?.find((record: any) => {
    const savedPostId =
      typeof record.post === "string"
        ? record.post
        : record.post?.$id;

    return savedPostId === post.$id;
  });

  const isSaved = !!savedRecord;

  // ✅ DEBUG (remove later if you want)
  console.log("CURRENT USER SAVE:", currentUser?.save);
  console.log("POST ID:", post.$id);
  console.log("SAVED RECORD:", savedRecord);

  // ================= LIKE =================
  const handleLikePost = (e: React.MouseEvent) => {
    e.stopPropagation();

    const hasLiked = likes.includes(userId);

    const newLikes = hasLiked
      ? likes.filter((id) => id !== userId)
      : [...likes, userId];

    setLikes(newLikes);

    likePost({
      postId: post.$id,
      likesArray: newLikes,
    });
  };

  // ================= SAVE =================
  const handleSavePost = (e: React.MouseEvent) => {
    e.stopPropagation();

    // 🔥 REMOVE SAVE
    if (isSaved && savedRecord) {
      deleteSavedPost(savedRecord.$id, {
        onSuccess: () => {
          queryClient.invalidateQueries({
            queryKey: [QUERY_KEYS.GET_CURRENT_USER],
          });
        },
      });
    }

    // 🔥 ADD SAVE
    else {
      savePost(
        {
          postId: post.$id,
          userId: user.$id, // ✅ FIXED
        },
        {
          onSuccess: () => {
            queryClient.invalidateQueries({
              queryKey: [QUERY_KEYS.GET_CURRENT_USER],
            });
          },
        }
      );
    }
  };

  return (
    <div className="flex justify-between items-center z-20">
      {/* LIKE */}
      <div className="flex gap-2 mr-5">
        <img
          src={
            likes.includes(userId)
              ? "/assets/icons/liked.svg"
              : "/assets/icons/like.svg"
          }
          alt="like"
          width={20}
          height={20}
          onClick={handleLikePost}
          className="cursor-pointer"
        />
        <p className="small-medium lg:base-medium">
          {likes.length}
        </p>
      </div>

      {/* SAVE */}
      <div className="flex gap-2">
        <img
          src={
            isSaved
              ? "/assets/icons/saved.svg"
              : "/assets/icons/save.svg"
          }
          alt="save"
          width={20}
          height={20}
          onClick={handleSavePost}
          className="cursor-pointer"
        />
      </div>
    </div>
  );
};

export default PostStats;