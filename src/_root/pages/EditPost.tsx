import React from 'react';
import { useParams } from 'react-router-dom';
import { Loader } from 'lucide-react';
import { useGetPostById } from '@/lib/react-query/queriesAndMutations';
import PostForm from '@/components/Forms/PostForm';
import type { AppwritePost } from '@/types';
import { useTheme } from '@/context/ThemeProvider';

const D = { bg: "#0d1f16", card: "#112218", border: "#1e3d2a", text: "#d6ebe0" };

const EditPost = () => {
  const { id } = useParams();
  const { darkMode } = useTheme();
  const { data: post, isPending, error } = useGetPostById(id || '');

  const bg = darkMode ? D.bg : "#f6fbf8";
  const card = darkMode ? D.card : "rgba(255,255,255,0.8)";
  const border = darkMode ? D.border : "#d6ebe0";
  const text = darkMode ? D.text : "#2f6e4f";

  if (isPending) return (
    <div style={{ background: bg }} className="flex justify-center items-center h-full w-full">
      <Loader className="animate-spin text-[#4f9f75]" />
    </div>
  );

  if (error) return (
    <div style={{ background: bg }} className="flex justify-center items-center h-full w-full">
      <div style={{ background: card, border: `1px solid ${border}`, borderRadius: 16, padding: 24, color: "#f87171" }}>Failed to load post</div>
    </div>
  );

  if (!post) return (
    <div style={{ background: bg }} className="flex justify-center items-center h-full w-full">
      <div style={{ background: card, border: `1px solid ${border}`, borderRadius: 16, padding: 24, color: text }}>Post not found</div>
    </div>
  );

  return (
    <div style={{ display: "flex", flex: 1, minHeight: "100vh", background: bg, transition: "background 0.3s" }}>
      <div className="common-container w-full px-6 py-10">
        <div className="max-w-5xl flex items-center gap-4 w-full mb-8">
          <div style={{ padding: 12, borderRadius: 16, background: "linear-gradient(135deg, #4f9f75, #7bbf9a)" }}>
            <img src="/assets/icons/add-post.svg" width={20} height={20} alt="edit post" className="brightness-0 invert" />
          </div>
          <h2 style={{ color: text, fontSize: 28, fontWeight: 700 }}>Edit Post</h2>
        </div>
        <div style={{ maxWidth: 960, width: "100%", background: card, backdropFilter: "blur(10px)", border: `1px solid ${border}`, borderRadius: 24, padding: 32 }}>
          <PostForm action="Update" post={post as unknown as AppwritePost} />
        </div>
      </div>
    </div>
  );
};

export default EditPost;