import type { Models } from "appwrite";
import Loader from "./Loader";
import GridPostList from "./GridPostList";
import type { Post } from "@/types";

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

type SearchResultsProps = {
  isSearchFetching: boolean;
  searchedPosts: unknown;
};

const SearchResults = ({
  isSearchFetching,
  searchedPosts,
}: SearchResultsProps) => {
  if (isSearchFetching) {
    return <Loader />;
  }

  const posts = (searchedPosts as Models.DocumentList<Post>)?.documents;

  if (posts && posts.length > 0) {
    return <GridPostList posts={posts} />;
  }

  return (
    <p
      className="mt-10 text-center w-full"
      style={{ color: P[400] }}
    >
      No results found
    </p>
  );
};

export default SearchResults;