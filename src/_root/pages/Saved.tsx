import { useGetCurrentUser } from "@/lib/react-query/queriesAndMutations";
import Loader from "@/components/shared/Loader";
import GridPostList from "@/components/shared/GridPostList";

const Saved = () => {
  const { data: currentUser, isLoading } = useGetCurrentUser();

  if (isLoading) {
    return (
      <div className="flex-center w-full h-full">
        <Loader />
      </div>
    );
  }

  // currentUser.save is an array of save documents, each has a `.post` relation
  const savedPosts = currentUser?.save
    ?.map((saveDoc: any) => saveDoc.post)
    .filter(Boolean)
    .reverse() ?? [];

  return (
    <div className="saved-container">
      <div className="flex gap-2 w-full max-w-5xl">
        <img
          src="/assets/icons/save.svg"
          width={36}
          height={36}
          alt="saved"
          className="invert-white"
        />
        <h2 className="h3-bold md:h2-bold text-left w-full">Saved Posts</h2>
      </div>

      {savedPosts.length === 0 ? (
        <p className="text-light-4 mt-10 text-center w-full">
          No saved posts yet. Save posts to find them here!
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