import {
  useMutation,
  useQuery,
  useInfiniteQuery,
  useQueryClient,
} from "@tanstack/react-query";

import { createPost, createUserAccount, deletePost, deleteSavedPost, getCurrentUser, getInfinitePosts, getPostById, likePost, savePost, signInAccount, signOutAccount, updatePost } from "../appwrite/api";
import type { INewPost, INewUser, IUpdatePost } from "@/types";
import { getRecentPosts } from "@/lib/appwrite/api";
import { QUERY_KEYS } from "@/lib/react-query/queryKeys";
import { Save } from "lucide-react";

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
export const useLikePost = () =>{
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn:({ postId, likesArray } : {postId: string; likesArray:string[]}) =>
      likePost(postId, likesArray),
      onSuccess: (data) => {
        queryClient.invalidateQueries({
          queryKey: [QUERY_KEYS.GET_POST_BY_ID, data?.$id]
        })
        queryClient.invalidateQueries({
          queryKey: [QUERY_KEYS.GET_RECENT_POSTS]
        })
        queryClient.invalidateQueries({
          queryKey: [QUERY_KEYS.GET_POSTS]
        })
        queryClient.invalidateQueries({
          queryKey: [QUERY_KEYS.GET_CURRENT_USER]
        })
      }
    

  });
};
export const useSavePost = () =>{
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn:({ postId, userId } : {postId: string; userId:string}) =>
       savePost(postId, userId),
      onSuccess: ()=>{

        queryClient.invalidateQueries({
          queryKey: [QUERY_KEYS.GET_RECENT_POSTS]
        })
        queryClient.invalidateQueries({
          queryKey: [QUERY_KEYS.GET_POSTS]
        })
        queryClient.invalidateQueries({
          queryKey: [QUERY_KEYS.GET_CURRENT_USER]
        })
      }
    

    });


};
export const useDeletSavedPost = () =>{
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn:(savedRecordId: string ) => deleteSavedPost(savedRecordId),
       
      onSuccess: ()=>{

        queryClient.invalidateQueries({
          queryKey: [QUERY_KEYS.GET_RECENT_POSTS]
        })
        queryClient.invalidateQueries({
          queryKey: [QUERY_KEYS.GET_POSTS]
        })
        queryClient.invalidateQueries({
          queryKey: [QUERY_KEYS.GET_CURRENT_USER]
        })
      }
    

    });


};
export const useGetCurrentUser =() =>{
  return useQuery({
    queryKey: [QUERY_KEYS.GET_CURRENT_USER],
    queryFn: getCurrentUser
  })
}
export const useGetPostById =(postId: string) =>{
  return useQuery({
  queryKey: [QUERY_KEYS.GET_POST_BY_ID, postId],
  queryFn:() => getPostById(postId),
  enabled:!!postId
})
}
export const useUpdatedPost =() =>{
  const queryClient= useQueryClient();
  return useMutation({
  mutationFn:(post:IUpdatePost) => updatePost(post),
  onSuccess:(data) =>{
    queryClient.invalidateQueries({
      queryKey:[QUERY_KEYS.GET_POST_BY_ID, data?.$id]
    })
  }
})
}
export const useDeletePost =() =>{
  const queryClient= useQueryClient();
  return useMutation({
  mutationFn:({postId,imageId}:{ postId:string,imageId:string})=>deletePost(postId,imageId),
  onSuccess:(data) =>{
    queryClient.invalidateQueries({
      queryKey:[QUERY_KEYS.GET_,RECENT_POSTS]
    })
  }
  })
}
export const useGetPosts = () => {
  return useInfiniteQuery({
    queryKey: [QUERY_KEYS.GET_INFINITE_POSTS],
    queryFn: ({ pageParam = null }) =>
      getInfinitePosts({ pageParam }),
    getNextPageParam: (lastPage) => {
      if (!lastPage || lastPage.documents.length === 0) return null;

      const lastDocument =
        lastPage.documents[lastPage.documents.length - 1];

      return lastDocument.$id;
    },
    initialPageParam: null,
  });
};

export const useSearchPosts = (searchTerm: string) => {
  return useQuery({
    queryKey: [QUERY_KEYS.SEARCH_POSTS, searchTerm],
    queryFn: () => SearchPosts(searchTerm),
    enabled: !!searchTerm,
  });
};
