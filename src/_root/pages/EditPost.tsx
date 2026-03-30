// src/pages/EditPost.tsx
import React from 'react';
import { useParams } from 'react-router-dom';
import { Loader } from 'lucide-react';
import { useGetPostById } from '@/lib/react-query/queriesAndMutations';
import PostForm from '@/components/Forms/PostForm';

const EditPost = () => {
  const { id } = useParams();

  const { data: post, isPending, error } = useGetPostById(id || '');

  
  if (isPending) {
    return (
      <div className="flex justify-center items-center h-full w-full">
        <Loader className="animate-spin" />
      </div>
    );
  }

  
  if (error) {
    return <div className="text-red-500">Failed to load post</div>;
  }


  if (!post) {
    return <div className="text-gray-500">Post not found</div>;
  }

  return (
    <div className="flex flex-1">
      <div className="common-container">
        {/* Header */}
        <div className="max-w-5xl flex-start gap-3 justify-start w-full mb-6">
          <img
            src="/assets/icons/add-post.svg"
            width={36}
            height={36}
            alt="edit post"
          />
          <h2 className="h3-bold md:h2-bold text-left w-full">
            Edit Post
          </h2>
        </div>

      
        <PostForm action="Update" post={post} />
      </div>
    </div>
  );
};

export default EditPost;