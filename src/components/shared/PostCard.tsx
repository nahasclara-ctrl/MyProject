import { Link } from "react-router-dom";
import { formatDate } from "@/lib/utils";
import { useUserContext } from "@/context/AuthContext";
import PostStats from "./PostStats";
import type { Post } from "@/types";

type PostCardProps = { post: Post };

const PostCard = ({ post }: PostCardProps) => {
  const { user } = useUserContext();

  return (
    <div className="
      border border-[#eefaf5]
      rounded-lg
      shadow-sm
      bg-white
      p-4
      flex flex-col gap-3
    ">

      {/* Header */}
      <div className="flex justify-between items-center">

        <div className="flex items-center gap-3">

          <Link to={`/profile/${post.creator?.$id || ""}`}>
            <img
              src={post.creator?.imageUrl || "/assets/icons/profile-placeholder.svg"}
              className="
                rounded-full w-12 h-12
                border border-[#eefaf5]
              "
            />
          </Link>

          <div className="flex flex-col">

            {/* 👤 NAME (NO BLACK) */}
            <p className="base-medium text-[#4b7f73] font-semibold">
              {post.creator?.name || "Unknown"}
            </p>

            {/* 🌿 META */}
            <div className="flex gap-2 text-sm text-[#9ccfc3]">

              <p>
                {post.$createdAt ? formatDate(post.$createdAt) : ""}
              </p>

              {post.location && (
                <p className="text-[#7fd1c2]">
                  {post.location}
                </p>
              )}

            </div>
          </div>

        </div>

        {/* Edit */}
        {user?.id === post.creator?.$id && (
          <Link to={`/update-post/${post.$id}`}>
            <img
              src="/assets/icons/edit.svg"
              width={20}
              height={20}
              style={{ opacity: 0.5 }}
            />
          </Link>
        )}

      </div>

      {/* Caption */}
      <Link to={`/posts/${post.$id}`} className="block">

        <div className="py-3">

          {/* 🧠 TEXT (NO BLACK) */}
          <p className="text-[#6faea2] leading-relaxed">
            {post.caption}
          </p>

          {post.tags && post.tags.length > 0 && (
            <ul className="flex gap-2 mt-2 flex-wrap">

              {post.tags.map(tag => (
                <li
                  key={tag}
                  className="text-[#86d6c6] text-sm"
                >
                  #{tag}
                </li>
              ))}

            </ul>
          )}

        </div>

        {post.imageUrl && (
          <img
            src={post.imageUrl}
            className="
              w-full
              rounded-lg
              border border-[#f3fbf8]
            "
          />
        )}

      </Link>

      {/* Stats */}
      <PostStats post={post} userId={user?.id || ""} />

    </div>
  );
};

export default PostCard;