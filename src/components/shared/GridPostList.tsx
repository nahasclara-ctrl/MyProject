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
    <ul className="grid-container">
      {posts?.map((post, index) => (
        <li key={`${post.$id}-${index}`} className="relative min-w-80 h-80">
          <Link to={`/posts/${post.$id}`} className="grid-post_link">
            <img
              src={post.imageUrl}
              alt={post.caption || "Post image"}
              className="h-full w-full object-cover rounded-lg"
            />
          </Link>

          <div
            className="grid-post_user"
            onClick={(e) => e.stopPropagation()}
          >
            {showUser && post.creator && (
              <div className="flex items-center justify-start gap-2 flex-1">
                <img
                  src={post.creator.imageUrl}
                  alt={post.creator.name || "Creator"}
                  className="h-8 w-8 rounded-full"
                />
                <p className="line-clamp-1">{post.creator.name}</p>
              </div>
            )}

            {showStats && (
              <div onClick={(e) => e.preventDefault()}>
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


