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
          {/* POST IMAGE — navigates to the post detail page */}
          <Link to={`/posts/${post.$id}`} className="block h-full w-full">
            <img
              src={post.imageUrl}
              alt={post.caption || "Post image"}
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          </Link>

          {/* HOVER TINT — decorative only, doesn't intercept clicks */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#2f6e4f]/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition duration-300 pointer-events-none" />

          {/* CREATOR BAR */}
          <div className="absolute bottom-0 left-0 w-full flex items-center bg-white border-t border-[#e2e8f0]">

            {showUser && post.creator ? (
              /*
               * REQUIREMENT: creator section is a navigable link.
               * - <Link> wraps avatar + name — full left half is clickable.
               * - to={`/profile/${post.creator.$id}`} routes to that user's profile.
               * - stopPropagation keeps the post <Link> above from also firing.
               * - hover:bg-[#f8faf9] + group-hover/creator:text-[#2f6e4f] give
               *   two simultaneous visual cues that this area is interactive.
               */
              <Link
                to={`/profile/${post.creator.$id}`}
                onClick={(e) => e.stopPropagation()}
                className="
                  flex items-center gap-2 flex-1 min-w-0
                  px-3 py-2.5
                  hover:bg-[#f8faf9]
                  transition-colors duration-150
                  group/creator
                "
              >
                <img
                  src={
                    post.creator.imageUrl ||
                    "/assets/icons/profile-placeholder.svg"
                  }
                  alt={post.creator.name || "Creator"}
                  className="h-7 w-7 rounded-full object-cover flex-shrink-0 ring-1 ring-[#d1e8dc]"
                />

                {/*
                 * REQUIREMENT: name must be clearly visible.
                 * - font-medium (500) on solid white = ~16:1 contrast ratio.
                 * - truncate prevents overflow from breaking the flex layout.
                 * - color shifts to brand green on hover — reinforces clickability.
                 */}
                <span className="
                  text-sm font-medium text-[#0f172a] truncate
                  group-hover/creator:text-[#2f6e4f]
                  transition-colors duration-150
                ">
                  {post.creator.name}
                </span>
              </Link>
            ) : (
              <div className="flex-1" />
            )}

            {/*
             * STATS sit outside the creator <Link> entirely.
             * stopPropagation on the wrapper prevents like/save clicks
             * from bubbling up to either the creator link or the post link.
             */}
            {showStats && (
              <div
                className="px-3 py-2.5 flex-shrink-0 text-[#64748b]"
                onClick={(e) => e.stopPropagation()}
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