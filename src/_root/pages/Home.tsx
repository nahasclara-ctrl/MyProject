import Loader from "@/components/shared/Loader";
import PostCard from "@/components/shared/PostCard";
import { type Post } from "@/types";
import { useGetRecentPosts } from "@/lib/react-query/queries";

const Home = () => {
  const {
    data: posts,
    isPending: isPostLoading,
    //i delete isError: isErrorPosts because i want to handle error in the future
  } = useGetRecentPosts();

  return (
    <div className="flex flex-1">
      <div className="home-container">
        <div className="home-posts">
          <h2 className="h3-bold md:h2-bold text-left w-full">
            Home Feed
          </h2>

          {isPostLoading && !posts ? (
            <Loader />
          ) : (
            <ul className="flex flex-col flex-1 gap-9 w-full">
              {(posts?.documents as unknown as Post[])?.map((post: Post) => (
                <PostCard post ={post} key={post.$id} />
              ))}
            </ul>
          )}

        </div>
      </div>
    </div>
  );
};

export default Home;

           