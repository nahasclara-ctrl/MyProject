import React from "react";
import { useUserContext } from "@/context/AuthContext";
import { Link } from "react-router-dom";
import type { Post } from "@/types";
import PostStats from "./PostStats";

type GridPostListProps = {
  posts: Post[];
  showUser?: boolean;
  showStats?: boolean;
};

const GridPostList = ({
  posts,
  showUser = true,
  showStats = true,
}: GridPostListProps) => {
  const { user } = useUserContext();

  return (
    <ul className="grid-container gap-6">
      {posts?.map((post, index) => (
        <li
          key={`${post.$id}-${index}`}
          className="relative min-w-80 h-80 rounded-2xl overflow-hidden group shadow-sm hover:shadow-lg transition-all duration-300"
        >
          {/* IMAGE */}
          <Link to={`/posts/${post.$id}`} className="grid-post_link block h-full w-full">
            <img
              src={post.imageUrl}
              alt={post.caption || "Post image"}
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          </Link>

          {/* SOFT OVERLAY */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#2f6e4f]/70 via-[#2f6e4f]/20 to-transparent opacity-0 group-hover:opacity-100 transition duration-300" />

          {/* USER + STATS */}
          <div
            className="grid-post_user absolute bottom-0 left-0 w-full p-3 flex items-center justify-between gap-2 backdrop-blur-md bg-white/70 border-t border-[#d6ebe0]"
            onClick={(e) => e.stopPropagation()}
          >
            {showUser && post.creator && (
              <div className="flex items-center justify-start gap-2 flex-1">
                <img
                  src={post.creator.imageUrl}
                  alt={post.creator.name || "Creator"}
                  className="h-8 w-8 rounded-full object-cover ring-2 ring-[#b7dcc8]"
                />
                <p className="line-clamp-1 text-sm font-semibold text-[#2f6e4f]">
                  {post.creator.name}
                </p>
              </div>
            )}

            {showStats && (
              <div
                onClick={(e) => e.preventDefault()}
                className="text-[#4f9f75]"
              >
                <PostStats post={post} userId={user?.id || ""} />
              </div>
            )}
          </div>
        </li>
      ))}
    </ul>
  );
};

export default GridPostList;

