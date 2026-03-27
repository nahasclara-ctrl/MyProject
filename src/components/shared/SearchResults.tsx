
import type { Models } from "appwrite";
import Loader from "./Loader";
import GridPostList from "./GridPostList";
import type {Post} from "@/types";
type SearchResultsProps = {
  isSearchFetching: boolean;
  searchedPosts: unknown;
};

const SearchResults = ({ isSearchFetching, searchedPosts }: SearchResultsProps) => {
  if (isSearchFetching) {
    return <Loader />;
  }
const posts = (searchedPosts as Models.DocumentList<Post>)?.documents;
  if (posts && posts.length > 0) {
    return <GridPostList posts={posts} />;
  }

  return (
    <p className="text-light-4 mt-10 text-center w-full">
      No results found
    </p>
  );
};

export default SearchResults;