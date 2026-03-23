import React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import FileUploader from "../shared/FileUploader";
import { PostValidation } from "@/_root/pages";
import { Textarea } from "../ui/textarea";
import type { Models } from "appwrite";
import { Button } from "@/components/ui/button";
import { useUserContext } from "@/context/AuthContext";
import { useToast } from "../ui/use-toast";
import {useCreatePost, useUpdatedPost} from "@/lib/react-query/queriesAndMutations";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

// Appwrite Post type with data fields
interface AppwritePost extends Models.Document {
  
    caption: string;
    tags: string[];
    location?: string;
    file?: any[];
    imageUrl:string;
    imageId:string;
  };


interface PostFormProps {
  post?: AppwritePost;
  action: "Create" | "Update";
}

const PostForm = ({ post, action }: PostFormProps) => {
const { mutateAsync: createPost, isPending: isLoadingCreate}=useCreatePost();
const { mutateAsync: updatePost, isPending: isLoadingUpdate}=useUpdatedPost();

const { user }=useUserContext();
const{ toast } =useToast();
const navigate=useNavigate();
  const form = useForm<z.infer<typeof PostValidation>>({
    resolver: zodResolver(PostValidation),
    defaultValues: {
      caption: post ? post.caption : "",
      file: post ? post.file || [] : [],
      location: post ? post.location || "" : "",
      tags: post ? post.tags.join(",") : "",
    },
  });
 const onSubmit =async (values: z.infer<typeof PostValidation>) => {
  if(post && action==='Update'){
    const updatedPost=await updatePost({
      ...values,
      postId:post.$id,
      imageId:post?.imageId,
      imageUrl:post?.imageUrl,
    })

    if(!updatedPost){
      toast({title:'Please try again'})
    }
    return navigate('/posts/${post.$id}')

  }
    const newPost = await createPost({
      ...values,
      userId:user.id,
    })
    if(!newPost) {
      toast({
        title:'Please try again'
      })

    }
    navigate('/');
  }
  
  console.log(post?.file)

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex flex-col gap-9 w-full max-w-5xl"
      >
        {/* Caption */}
        <FormField
          control={form.control}
          name="caption"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Caption</FormLabel>
              <FormControl>
                <Textarea className="shad-textarea custom-scrollbar" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* File Upload */}
        <FormField
          control={form.control}
          name="file"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="shad-form-label">Add Photos</FormLabel>
              <FormControl>
                <FileUploader fieldChange={field.onChange} mediaUrl={post?.file || []} />
              </FormControl>
              <FormMessage/>
            </FormItem>
          )}
        />

        {/* Location */}
        <FormField
          control={form.control}
          name="location"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Add Location</FormLabel>
              <FormControl>
                <Input type="text" className="shad-input" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Tags */}
        <FormField
          control={form.control}
          name="tags"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Add tags (comma-separated)</FormLabel>
              <FormControl>
                <Input
                  type="text"
                  placeholder="Art, Expression, Learn"
                  className="shad-input"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Buttons */}
        <div className="flex gap-4 justify-end">
          <Button type="button" className="shad-button_dark_4">
            Cancel
          </Button>
          <Button type="submit" className="shad-button_primary whitespace-nowrap" 
           disabled ={isLoadingCreate || isLoadingUpdate}>
            {isLoadingCreate || isLoadingUpdate && 'Loading...'}
            {action} Post
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default PostForm;