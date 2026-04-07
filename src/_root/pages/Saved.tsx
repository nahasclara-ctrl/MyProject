import { useUserContext } from "@/context/AuthContext";
import { useGetSavedPosts } from "@/lib/react-query/queriesAndMutations"; 
import { getPostById } from "@/lib/appwrite/api";
import { useEffect, useState } from "react";
import Loader from "@/components/shared/Loader";
import GridPostList from "@/components/shared/GridPostList";

const Saved = () => {
  const { user } = useUserContext();
  const { data: savedDocs, isLoading } = useGetSavedPosts(user.$id); 

  const [savedPosts, setSavedPosts] = useState<any[]>([]);

  useEffect(() => {
    const fetchPosts = async () => {
      if (!savedDocs) return;

      const posts = await Promise.all(
        savedDocs.map((doc: any) => getPostById(doc.post))
      );

      setSavedPosts(posts.filter(Boolean).reverse());
    };

    fetchPosts();
  }, [savedDocs]);

  if (isLoading) {
    return (
      <div className="flex-center w-full h-full">
        <Loader />
      </div>
    );
  }

  return (
    <div className="saved-container">
      <h2 className="h3-bold md:h2-bold text-left w-full">
        Saved Posts
      </h2>

      {savedPosts.length === 0 ? (
        <p className="text-light-4 mt-10 text-center w-full">
          No saved posts yet.
        </p>
      ) : (
        <div className="w-full flex justify-center max-w-5xl">
          <GridPostList posts={savedPosts} showStats={false} />
        </div>
      )}
    </div>
  );
};

export default Saved;