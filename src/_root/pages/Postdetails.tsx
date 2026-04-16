import { useGetPostById } from "@/lib/react-query/queriesAndMutations";
import { useParams, Link } from "react-router-dom";
import Loader from "@/components/shared/Loader";
import { formatDate } from "@/lib/utils";
import { useUserContext } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import PostStats from "@/components/shared/PostStats";
import { type AppwritePost } from "@/types";

const P = {
  50: "#f6fbf8",
  100: "#eaf5ef",
  200: "#d6ebe0",
  300: "#b7dcc8",
  400: "#7bbf9a",
  500: "#4f9f75",
  600: "#3f8a63",
  700: "#2f6e4f",
};

const Postdetails = () => {
  const { id } = useParams();
  const { data: post, isPending } = useGetPostById(id || "");
  const { user } = useUserContext();

  const handleDeletePost = () => {};

  if (isPending) {
    return (
      <div
        className="flex justify-center items-center min-h-screen"
        style={{ background: `linear-gradient(135deg, ${P[50]}, ${P[100]})` }}
      >
        <Loader />
      </div>
    );
  }

  if (!post) {
    return (
      <div
        className="flex justify-center items-center min-h-screen"
        style={{ background: `linear-gradient(135deg, ${P[50]}, ${P[100]})` }}
      >
        <div
          className="p-6 rounded-2xl border bg-white text-center"
          style={{ borderColor: P[200], color: P[600] }}
        >
          Post not found.
        </div>
      </div>
    );
  }

  const isOwner = user.id === post?.creator?.$id;

  return (
    <div
      className="min-h-screen flex justify-center px-4 py-10"
      style={{
        background: `linear-gradient(180deg, ${P[50]}, #ffffff)`,
      }}
    >
      <div
        className="w-full max-w-4xl rounded-2xl overflow-hidden border shadow-sm bg-white"
        style={{ borderColor: P[200] }}
      >
        {/* IMAGE */}
        {post.imageUrl && (
          <img
            src={post.imageUrl}
            alt="post"
            className="w-full max-h-[520px] object-cover"
          />
        )}

        {/* CONTENT */}
        <div className="p-6 flex flex-col gap-5">

          {/* HEADER */}
          <div className="flex justify-between items-start">
            {post.creator && (
              <Link
                to={`/profile/${post.creator.$id}`}
                className="flex items-center gap-3"
              >
                <img
                  src={
                    post.creator.imageUrl ||
                    "/assets/icons/profile-placeholder.svg"
                  }
                  className="w-11 h-11 rounded-full object-cover"
                  style={{ border: `1px solid ${P[200]}` }}
                />

                <div>
                  <p className="font-semibold" style={{ color: P[700] }}>
                    {post.creator.name}
                  </p>

                  <p className="text-xs" style={{ color: P[400] }}>
                    {post.$createdAt ? formatDate(post.$createdAt) : ""}
                    {post.location && ` • ${post.location}`}
                  </p>
                </div>
              </Link>
            )}

            {/* ACTIONS */}
            <div className="flex items-center gap-3">
              {isOwner && (
                <>
                  <Link to={`/update-post/${post?.$id}`}>
                    <img
                      src="/assets/icons/edit.svg"
                      width={20}
                      height={20}
                      className="opacity-60 hover:opacity-100 transition"
                    />
                  </Link>

                  <Button
                    onClick={handleDeletePost}
                    variant="ghost"
                    className="p-1"
                  >
                    <img
                      src="/assets/icons/delete.svg"
                      width={20}
                      height={20}
                      className="opacity-60 hover:opacity-100 transition"
                    />
                  </Button>
                </>
              )}
            </div>
          </div>

          {/* DIVIDER */}
          <div className="h-px" style={{ backgroundColor: P[200] }} />

          {/* CAPTION */}
          <div className="space-y-3">
            <p style={{ color: P[600] }}>{post?.caption}</p>

            <ul className="flex flex-wrap gap-2">
              {post?.tags.map((tag: string, index: number) => (
                <li
                  key={`${tag}-${index}`}
                  className="text-sm px-2 py-1 rounded-full"
                  style={{
                    color: P[500],
                    backgroundColor: P[50],
                    border: `1px solid ${P[200]}`,
                  }}
                >
                  #{tag}
                </li>
              ))}
            </ul>
          </div>

          {/* STATS */}
          <div
            className="pt-4 border-t"
            style={{ borderColor: P[200] }}
          >
            <PostStats
              post={post as unknown as AppwritePost}
              userId={user.id || ""}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Postdetails;
