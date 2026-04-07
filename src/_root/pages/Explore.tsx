import React, { useState, useEffect, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Link } from "react-router-dom";
import { useSearchPosts, useGetExplorePosts } from "@/lib/react-query/queriesAndMutations";
import { useSearchUsers } from "@/lib/react-query/queriesAndMutations";
import useDebounce from "@/hooks/useDebounce";
import Loader from "@/components/shared/Loader";
import GridPostList from "@/components/shared/GridPostList";
import { useUserContext } from "@/context/AuthContext";

const Explore = () => {
  const [searchValue, setSearchValue] = useState("");
  const debouncedValue = useDebounce(searchValue, 500);
  const { user: currentUser } = useUserContext();
  const bottomRef = useRef<HTMLDivElement>(null);

  const {
    data: posts,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useGetExplorePosts(currentUser ?? { $id: "", following: [] });

  const { data: searchedPosts, isFetching: isSearchFetching } = useSearchPosts(debouncedValue);
  const { data: searchedUsers, isFetching: isUserFetching } = useSearchUsers(debouncedValue);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage && !searchValue) {
          fetchNextPage();
        }
      },
      { threshold: 0.1 }
    );
    if (bottomRef.current) observer.observe(bottomRef.current);
    return () => observer.disconnect();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage, searchValue]);

  if (!posts) {
    return (
      <div className="flex-center w-full h-full">
        <Loader />
      </div>
    );
  }

  const shouldShowSearchResults = searchValue !== "";
  const allPosts = posts.pages.flatMap((page: any) => page.documents);
  const foundPosts = searchedPosts?.documents ?? [];
  const foundUsers = searchedUsers?.documents ?? [];
  const isLoading = isSearchFetching || isUserFetching;

  return (
    <div className="explore-container">
      <div className="explore-inner_container">
        <h2 className="h3-bold md:h2-bold w-full">Search Posts</h2>
        <div className="flex gap-1 px-4 w-full rounded-lg bg-dark-4">
          <img src="/assets/icons/search.svg" width={24} height={24} alt="search" />
          <Input
            type="text"
            placeholder="Search posts or people..."
            className="explore-search"
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
          />
        </div>
      </div>

      <div className="flex-between w-full max-w-5xl mt-16 mb-7">
        <h3 className="body-bold md:h3-bold">
          {shouldShowSearchResults ? "Search Results" : "Discover Posts"}
        </h3>
        {!shouldShowSearchResults && (
          <div className="flex-center gap-3 bg-dark-3 rounded-xl px-4 py-2 cursor-pointer">
            <p className="small-medium md:base-medium text-light-2">All</p>
            <img src="/assets/icons/filter.svg" width={20} height={20} alt="filter" />
          </div>
        )}
      </div>

      <div className="flex flex-col gap-9 w-full max-w-5xl">
        {shouldShowSearchResults ? (
          isLoading ? (
            <Loader />
          ) : foundUsers.length === 0 && foundPosts.length === 0 ? (
            <p className="text-light-4 mt-10 text-center w-full">No results found</p>
          ) : (
            <>
              {/* People results */}
              {foundUsers.length > 0 && (
                <div className="flex flex-col gap-4">
                  <h4 className="base-bold text-light-1">People</h4>
                  <ul className="flex flex-col gap-3">
                    {foundUsers.map((person: any) => (
                      <li key={person.$id}>
                        <Link
                          to={`/profile/${person.$id}`}
                          className="flex items-center gap-4 bg-dark-2 rounded-2xl px-5 py-3 hover:bg-dark-3 transition-colors"
                        >
                          <img
                            src={person.imageUrl || "/assets/icons/profile-placeholder.svg"}
                            alt={person.name}
                            className="w-12 h-12 rounded-full object-cover flex-shrink-0"
                          />
                          <div className="flex flex-col">
                            <p className="text-light-1 base-semibold">{person.name}</p>
                            <p className="text-light-4 small-regular">@{person.username}</p>
                            {person.bio && (
                              <p className="text-light-3 tiny-medium line-clamp-1">{person.bio}</p>
                            )}
                          </div>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Post results */}
              {foundPosts.length > 0 && (
                <div className="flex flex-col gap-4">
                  <h4 className="base-bold text-light-1">Posts</h4>
                  <GridPostList posts={foundPosts as any} />
                </div>
              )}
            </>
          )
        ) : allPosts.length === 0 ? (
          <p className="text-light-4 mt-10 text-center w-full">No posts to discover yet.</p>
        ) : (
          posts.pages.map((page: any, index: number) => (
            <GridPostList key={`page-${index}`} posts={page.documents} />
          ))
        )}
      </div>

      {/* Infinite scroll trigger */}
      {!shouldShowSearchResults && (
        <div ref={bottomRef} className="w-full py-6 flex justify-center">
          {isFetchingNextPage && <Loader />}
          {!hasNextPage && allPosts.length > 0 && (
            <p className="text-light-4 text-sm">You've seen everything! 🎉</p>
          )}
        </div>
      )}
    </div>
  );
};

export default Explore;