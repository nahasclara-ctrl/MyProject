import React from "react";
import { Link } from "react-router-dom";
import { formatDate } from "@/lib/utils";
import { useUserContext } from "@/context/AuthContext";
import PostStats from "./PostStats";
import type { Post } from "@/types";

type PostCardProps = { post: Post };

const PostCard = ({ post }: PostCardProps) => {
   console.log(post.creator);
  const { user } = useUserContext();

  return (
    <div className="post-card border rounded-lg shadow-sm bg-white p-4 flex flex-col gap-3">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          <Link to={`/profile/${post.creator?.$id || ""}`}>
            <img
              src={post.creator?.imageUrl || "/assets/icons/profile-placeholder.svg"}
              alt={post.creator?.name || "User"}
              className="rounded-full w-12 h-12"
            />
          </Link>
          <div className="flex flex-col">
            <p className="base-medium">{post.creator?.name || "Unknown"}</p>
            <div className="flex gap-2 text-light-3">
              <p>{post.$createdAt ? formatDate(post.$createdAt) : ""}</p>
              {post.location && <p>{post.location}</p>}
            </div>
          </div>
        </div>

        {/* Edit Button */}
        {user?.id === post.creator?.$id && (
          <Link to={`/update-post/${post.$id}`}>
            <img src="/assets/icons/edit.svg" alt="edit" width={20} height={20} />
          </Link>
        )}
      </div>

      {/* Caption & Tags */}
      <Link to={`/posts/${post.$id}`} className="block">
        <div className="py-3">
          <p>{post.caption}</p>
          {post.tags && post.tags.length > 0 && (
            <ul className="flex gap-2 mt-2 flex-wrap">
              {post.tags.map(tag => (
                <li key={tag} className="text-light-3 text-sm">
                  #{tag}
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Image */}
        {post.imageUrl && (
          <img src={post.imageUrl} alt="post image" className="post-card_img w-full rounded-lg" />
        
        )}
      </Link>

      {/* Likes / Saves */}

      <PostStats post={post} userId={user?.id || ""} />
    </div>
  )
};

export default PostCard;