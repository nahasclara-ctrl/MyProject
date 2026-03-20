import {
  useMutation,
  useQuery,
  useInfiniteQuery,
  useQueryClient,
} from "@tanstack/react-query";

import { createPost, createUserAccount, signInAccount, signOutAccount } from "../appwrite/api";
import type { INewPost, INewUser } from "@/types";
import { getRecentPosts } from "@/lib/appwrite/api";
import { QUERY_KEYS } from "@/lib/react-query/queryKeys";

// ----------------------------
// Create Account Mutation
// ----------------------------
export const useCreateUserAccount = () => {
  return useMutation({
    mutationFn: (user: INewUser) => createUserAccount(user),
  });
};

// ----------------------------
// Sign In Mutation
// ----------------------------
export const useSignInAccount = () => {
  return useMutation({
    mutationFn: (user: { email: string; password: string }) =>
      signInAccount(user),
  });
};

// ----------------------------
// Sign Out Mutation
// ----------------------------
export const useSignOutAccount = () => {
  return useMutation({
    mutationFn: () => signOutAccount(),
  });
};

// ----------------------------
// Create Post Mutation
// ----------------------------
export const useCreatePost = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (post: INewPost) => createPost(post), // ← comma added

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["getRecentPosts"], // should be array
      
      });
    },
  });
}; 

export const useGetRecentPosts = () => {
  return useQuery({
    queryKey: [QUERY_KEYS.GET_RECENT_POSTS],
    queryFn: getRecentPosts,
  });
};
 