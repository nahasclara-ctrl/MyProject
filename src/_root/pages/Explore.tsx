import React, { useState, useEffect, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Link } from "react-router-dom";
import { useSearchPosts, useGetExplorePosts, useSearchUsers } from "@/lib/react-query/queriesAndMutations";
import useDebounce from "@/hooks/useDebounce";
import Loader from "@/components/shared/Loader";
import GridPostList from "@/components/shared/GridPostList";
import { useUserContext } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeProvider";

const D = { bg: "#0d1f16", card: "#112218", border: "#1e3d2a", text: "#d6ebe0", muted: "#7aab90", input: "#1a3526" };

const Explore = () => {
  const [searchValue, setSearchValue] = useState("");
  const debouncedValue = useDebounce(searchValue, 500);
  const { user: currentUser } = useUserContext();
  const { darkMode } = useTheme();
  const bottomRef = useRef<HTMLDivElement>(null);

  const { data: posts, fetchNextPage, hasNextPage, isFetchingNextPage } = useGetExplorePosts(currentUser?.$id ?? "");
  const { data: searchedPosts, isFetching: isSearchFetching } = useSearchPosts(debouncedValue);
  const { data: searchedUsers, isFetching: isUserFetching } = useSearchUsers(debouncedValue);

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage && !searchValue) fetchNextPage();
    }, { threshold: 0.1 });
    if (bottomRef.current) observer.observe(bottomRef.current);
    return () => observer.disconnect();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage, searchValue]);

  const bg = darkMode ? D.bg : "#f6fbf8";
  const card = darkMode ? D.card : "#ffffff";
  const border = darkMode ? D.border : "#d6ebe0";
  const text = darkMode ? D.text : "#2f6e4f";
  const muted = darkMode ? D.muted : "#7bbf9a";
  const inputBg = darkMode ? D.input : "rgba(255,255,255,0.8)";

  if (!posts) return (
    <div style={{ background: bg }} className="flex-center w-full h-full"><Loader /></div>
  );

  const shouldShowSearchResults = searchValue !== "";
  const allPosts = posts.pages.flatMap((page: any) => page.documents);
  const foundPosts = searchedPosts?.documents ?? [];
  const foundUsers = searchedUsers?.documents ?? [];
  const isLoading = isSearchFetching || isUserFetching;

  return (
    <div style={{ minHeight: "100vh", width: "100%", background: bg, padding: "32px 24px", transition: "background 0.3s" }}>
      {/* HEADER */}
      <div style={{ maxWidth: 960, margin: "0 auto", display: "flex", flexDirection: "column", gap: 20, marginBottom: 40 }}>
        <h2 style={{ color: text, fontSize: 28, fontWeight: 700 }}>Search Posts</h2>
        <div style={{ display: "flex", alignItems: "center", gap: 12, background: inputBg, backdropFilter: "blur(10px)", border: `1px solid ${border}`, borderRadius: 16, padding: "12px 16px" }}>
          <img src="/assets/icons/search.svg" width={22} height={22} alt="search" style={{ opacity: 0.6 }} />
          <Input type="text" placeholder="Search posts or people..." value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            className="border-0 bg-transparent focus-visible:ring-0"
            style={{ color: text }} />
        </div>
      </div>

      <div style={{ maxWidth: 960, margin: "0 auto", marginBottom: 32 }}>
        <h3 style={{ color: "#4f9f75", fontSize: 20, fontWeight: 700 }}>
          {shouldShowSearchResults ? "Search Results" : "Discover Posts"}
        </h3>
      </div>

      <div style={{ maxWidth: 960, margin: "0 auto", display: "flex", flexDirection: "column", gap: 40 }}>
        {shouldShowSearchResults ? (
          isLoading ? <Loader /> :
          foundUsers.length === 0 && foundPosts.length === 0 ? (
            <p style={{ textAlign: "center", color: muted }}>No results found</p>
          ) : (
            <>
              {foundUsers.length > 0 && (
                <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                  <h4 style={{ color: "#4f9f75", fontWeight: 600 }}>People</h4>
                  <ul style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                    {foundUsers.map((person: any) => (
                      <li key={person.$id}>
                        <Link to={`/profile/${person.$id}`} style={{
                          display: "flex", alignItems: "center", gap: 16,
                          background: card, backdropFilter: "blur(10px)",
                          border: `1px solid ${border}`, borderRadius: 16,
                          padding: "12px 20px", textDecoration: "none",
                        }}>
                          <img src={person.imageUrl || "/assets/icons/profile-placeholder.svg"}
                            style={{ width: 48, height: 48, borderRadius: "50%", objectFit: "cover", border: `1px solid ${border}` }} />
                          <div>
                            <p style={{ color: text, fontWeight: 600 }}>{person.name}</p>
                            <p style={{ color: "#4f9f75", fontSize: 14 }}>@{person.username}</p>
                            {person.bio && <p style={{ color: muted, fontSize: 12 }}>{person.bio}</p>}
                          </div>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {foundPosts.length > 0 && (
                <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                  <h4 style={{ color: "#4f9f75", fontWeight: 600 }}>Posts</h4>
                  <GridPostList posts={foundPosts as any} />
                </div>
              )}
            </>
          )
        ) : allPosts.length === 0 ? (
          <p style={{ textAlign: "center", color: muted }}>No posts to discover yet.</p>
        ) : (
          posts.pages.map((page: any, index: number) => (
            <GridPostList key={`page-${index}`} posts={page.documents} />
          ))
        )}
      </div>

      {!shouldShowSearchResults && (
        <div ref={bottomRef} style={{ width: "100%", padding: "40px 0", display: "flex", justifyContent: "center" }}>
          {isFetchingNextPage && <Loader />}
          {!hasNextPage && allPosts.length > 0 && <p style={{ color: muted, fontSize: 14 }}>You've seen everything 🎉</p>}
        </div>
      )}
    </div>
  );
};

export default Explore;