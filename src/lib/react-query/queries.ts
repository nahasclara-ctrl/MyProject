import { useQuery } from "@tanstack/react-query";
import { getRecentPosts } from "@/lib/appwrite/api"; // adjust if path differs

export const QUERY_KEYS = {
  GET_RECENT_POSTS: "getRecentPosts",
};

export const useGetRecentPosts = () => {
  return useQuery({
    queryKey: [QUERY_KEYS.GET_RECENT_POSTS],
    queryFn: getRecentPosts,
  });
};