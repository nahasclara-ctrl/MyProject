import React from "react";
import { useSavedPosts } from "@/context/savedPostsContext";
import type { Post } from "@/types";
import PostCard from "@/components/shared/PostCard"; // your existing PostCard

const Saved = () => {
  const { savedPosts } = useSavedPosts();

  if (savedPosts.length === 0)
    return (
      <div className="p-4 text-center text-gray-500">
        No saved posts yet!
      </div>
    );

  return (
    <div className="flex flex-col gap-6 w-full max-w-5xl mx-auto p-4">
      <h1 className="text-2xl font-bold">Saved Posts</h1>
      {savedPosts.map((post: Post) => (
        <PostCard key={post.$id} post={post} />
      ))}
    </div>
  );
};

export default Saved;