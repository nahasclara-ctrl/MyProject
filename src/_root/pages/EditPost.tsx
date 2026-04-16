// src/pages/EditPost.tsx
import React from 'react';
import { useParams } from 'react-router-dom';
import { Loader } from 'lucide-react';
import { useGetPostById } from '@/lib/react-query/queriesAndMutations';
import PostForm from '@/components/Forms/PostForm';
import type { AppwritePost } from '@/types';

const EditPost = () => {
  const { id } = useParams();

  const { data: post, isPending, error } = useGetPostById(id || '');

  if (isPending) {
    return (
      <div className="flex justify-center items-center h-full w-full bg-gradient-to-br from-[#f6fbf8] via-[#eaf5ef] to-[#d6ebe0]">
        <Loader className="animate-spin text-[#4f9f75]" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-full w-full bg-gradient-to-br from-[#f6fbf8] via-[#eaf5ef] to-[#d6ebe0]">
        <div className="bg-white/90 backdrop-blur-md border border-[#d6ebe0] rounded-2xl p-6 shadow-md text-red-500">
          Failed to load post
        </div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="flex justify-center items-center h-full w-full bg-gradient-to-br from-[#f6fbf8] via-[#eaf5ef] to-[#d6ebe0]">
        <div className="bg-white/90 backdrop-blur-md border border-[#d6ebe0] rounded-2xl p-6 shadow-md text-[#2f6e4f]">
          Post not found
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-1 min-h-screen bg-gradient-to-br from-[#f6fbf8] via-[#eaf5ef] to-[#d6ebe0]">

      <div className="common-container w-full px-6 py-10">

        {/* HEADER */}
        <div className="max-w-5xl flex items-center gap-4 w-full mb-8">

          <div className="p-3 rounded-2xl bg-gradient-to-r from-[#4f9f75] to-[#7bbf9a] shadow-md">
            <img
              src="/assets/icons/add-post.svg"
              width={20}
              height={20}
              alt="edit post"
              className="brightness-0 invert"
            />
          </div>

          <h2 className="h3-bold md:h2-bold text-[#2f6e4f] tracking-tight">
            Edit Post
          </h2>

        </div>

        {/* FORM */}
        <div className="max-w-5xl w-full bg-white/80 backdrop-blur-md border border-[#d6ebe0] rounded-3xl shadow-lg p-8 transition-all duration-300 hover:shadow-xl">
          <PostForm action="Update" post={post as unknown as AppwritePost} />
        </div>

      </div>
    </div>
  );
};

export default EditPost;