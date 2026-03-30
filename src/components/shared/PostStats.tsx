import { useState, useEffect } from "react";
import type { Post } from "@/types";
import { useSavedPosts } from "@/context/savedPostsContext";

type PostStatsProps = {
  post: Post;
  userId: string;
};

const PostStats = ({ post, userId }: PostStatsProps) => {
  const [likes, setLikes] = useState<string[]>(post.likes || []);
  const { savedPosts, savePost: savePostContext, removePost } = useSavedPosts();
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    setIsSaved(savedPosts.some((p) => p.$id === post.$id));
  }, [savedPosts, post.$id]);

  const handleSavePost = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isSaved) removePost(post.$id);
    else savePostContext(post);
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
          onClick={() => {
            const newLikes = likes.includes(userId)
              ? likes.filter((id) => id !== userId)
              : [...likes, userId];
            setLikes(newLikes);
          }}
          className="cursor-pointer"
        />
        <p>{likes.length}</p>
      </div>

      {/* Save button */}
      <div className="flex gap-2">
        <img
          src={isSaved ? "/assets/icons/saved.svg" : "/assets/icons/save.svg"}
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