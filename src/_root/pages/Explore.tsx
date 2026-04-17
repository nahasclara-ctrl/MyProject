import React, { useState, useEffect, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Link } from "react-router-dom";
import {
  useSearchPosts,
  useGetExplorePosts,
  useSearchUsers,
} from "@/lib/react-query/queriesAndMutations";
import useDebounce from "@/hooks/useDebounce";
import Loader from "@/components/shared/Loader";
import GridPostList from "@/components/shared/GridPostList";
import { useUserContext } from "@/context/AuthContext";

const Explore = () => {
  const [searchValue, setSearchValue] = useState("");
  const debouncedValue = useDebounce(searchValue, 500);
  const { user: currentUser } = useUserContext();
  const bottomRef = useRef<HTMLDivElement>(null);

 const { data: posts, fetchNextPage, hasNextPage, isFetchingNextPage } =
  useGetExplorePosts(currentUser?.$id ?? "");

  const { data: searchedPosts, isFetching: isSearchFetching } =
    useSearchPosts(debouncedValue);
  const { data: searchedUsers, isFetching: isUserFetching } =
    useSearchUsers(debouncedValue);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (
          entries[0].isIntersecting &&
          hasNextPage &&
          !isFetchingNextPage &&
          !searchValue
        ) {
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
      <div className="flex-center w-full h-full bg-gradient-to-br from-[#f6fbf8] via-[#eaf5ef] to-[#d6ebe0]">
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
    <div className="min-h-screen w-full bg-gradient-to-br from-[#f6fbf8] via-[#eaf5ef] to-[#d6ebe0] px-6 py-8">

      {/* HEADER */}
      <div className="max-w-5xl mx-auto flex flex-col gap-5 mb-10">

        <h2 className="text-[#2f6e4f] h3-bold md:h2-bold">
          Search Posts
        </h2>

        {/* SEARCH BAR */}
        <div className="flex items-center gap-3 w-full bg-white/80 backdrop-blur-md border border-[#d6ebe0] rounded-2xl px-4 py-3 shadow-sm focus-within:shadow-md transition-all">
          <img
            src="/assets/icons/search.svg"
            width={22}
            height={22}
            alt="search"
            className="opacity-60"
          />

          <Input
            type="text"
            placeholder="Search posts or people..."
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            className="border-0 bg-transparent focus-visible:ring-0 text-[#0f172a]"
          />
        </div>
      </div>

      {/* TITLE ROW */}
      <div className="max-w-5xl mx-auto flex items-center justify-between mb-8">
        <h3 className="text-[#4f9f75] body-bold md:h3-bold">
          {shouldShowSearchResults ? "Search Results" : "Discover Posts"}
        </h3>

       
      </div>

      {/* CONTENT */}
      <div className="max-w-5xl mx-auto flex flex-col gap-10">

        {shouldShowSearchResults ? (
          isLoading ? (
            <Loader />
          ) : foundUsers.length === 0 && foundPosts.length === 0 ? (
            <p className="text-center text-[#94a3b8]">
              No results found
            </p>
          ) : (
            <>
              {/* PEOPLE */}
              {foundUsers.length > 0 && (
                <div className="flex flex-col gap-4">
                  <h4 className="text-[#4f9f75] font-semibold">People</h4>

                  <ul className="flex flex-col gap-3">
                    {foundUsers.map((person: any) => (
                      <li key={person.$id}>
                        <Link
                          to={`/profile/${person.$id}`}
                          className="flex items-center gap-4 bg-white/80 backdrop-blur-md border border-[#d6ebe0] rounded-2xl px-5 py-3 hover:shadow-md transition-all"
                        >
                          <img
                            src={
                              person.imageUrl ||
                              "/assets/icons/profile-placeholder.svg"
                            }
                            className="w-12 h-12 rounded-full object-cover border border-[#d6ebe0]"
                          />

                          <div className="flex flex-col">
                            <p className="text-[#0f172a] font-semibold">
                              {person.name}
                            </p>

                            <p className="text-[#4f9f75] text-sm">
                              @{person.username}
                            </p>

                            {person.bio && (
                              <p className="text-[#94a3b8] text-xs">
                                {person.bio}
                              </p>
                            )}
                          </div>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* POSTS */}
              {foundPosts.length > 0 && (
                <div className="flex flex-col gap-4">
                  <h4 className="text-[#4f9f75] font-semibold">Posts</h4>
                  <GridPostList posts={foundPosts as any} />
                </div>
              )}
            </>
          )
        ) : allPosts.length === 0 ? (
          <p className="text-center text-[#94a3b8]">
            No posts to discover yet.
          </p>
        ) : (
          posts.pages.map((page: any, index: number) => (
            <GridPostList key={`page-${index}`} posts={page.documents} />
          ))
        )}
      </div>

      {/* INFINITE SCROLL */}
      {!shouldShowSearchResults && (
        <div ref={bottomRef} className="w-full py-10 flex justify-center">
          {isFetchingNextPage && <Loader />}

          {!hasNextPage && allPosts.length > 0 && (
            <p className="text-[#94a3b8] text-sm">
              You've seen everything 🎉
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default Explore;