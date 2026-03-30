import { createContext, useContext, useState } from "react";
import type { ReactNode } from "react";
import type { Post } from "@/types";

type SavedPostsContextType = {
  savedPosts: Post[];
  savePost: (post: Post) => void;
  removePost: (postId: string) => void;
};

const SavedPostsContext = createContext<SavedPostsContextType | undefined>(undefined);

export const useSavedPosts = () => {
  const context = useContext(SavedPostsContext);
  if (!context) throw new Error("useSavedPosts must be used within a SavedPostsProvider");
  return context;
};

export const SavedPostsProvider = ({ children }: { children: ReactNode }) => {
  const [savedPosts, setSavedPosts] = useState<Post[]>([]);

  const savePost = (post: Post) => {
    setSavedPosts((prev) => {
      if (!prev.find((p) => p.$id === post.$id)) return [...prev, post];
      return prev;
    });
  };

  const removePost = (postId: string) => {
    setSavedPosts((prev) => prev.filter((p) => p.$id !== postId));
  };

  return (
    <SavedPostsContext.Provider value={{ savedPosts, savePost, removePost }}>
      {children}
    </SavedPostsContext.Provider>
  );
};