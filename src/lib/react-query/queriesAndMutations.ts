import {
  useMutation,
  useQuery,
  useQueryClient,
  useInfiniteQuery,
} from "@tanstack/react-query";

import { createUserAccount, signInAccount } from "../appwrite/api";
import type { INewUser } from "@/types";

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