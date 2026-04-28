import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import FileUploader from "../shared/fileUploader";
import { PostValidation } from "@/_root/pages";
import { Textarea } from "../ui/textarea";
import type { Models } from "appwrite";
import { Button } from "@/components/ui/button";
import { useUserContext } from "@/context/AuthContext";
import { useToast } from "../ui/use-toast";
import { useCreatePost, useUpdatedPost } from "@/lib/react-query/queriesAndMutations";
import { useTheme } from "@/context/ThemeProvider";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

const P = {
  200: "#d6ebe0",
  400: "#7bbf9a",
  500: "#4f9f75",
  600: "#3f8a63",
  700: "#2f6e4f",
};

const D = {
  bg:       "#0f1a14",
  surface:  "#1a2b20",
  border:   "#2a3f30",
  text:     "#d6ebe0",
  subtext:  "#7bbf9a",
  muted:    "#3a5444",
  inputBg:  "#152019",
};

interface AppwritePost extends Models.Document {
  caption: string;
  tags: string[];
  location?: string;
  file?: any[];
  imageUrl: string;
  imageId: string;
}

interface PostFormProps {
  post?: AppwritePost;
  action: "Create" | "Update";
}

const PostForm = ({ post, action }: PostFormProps) => {
  const { mutateAsync: createPost, isPending: isLoadingCreate } = useCreatePost();
  const { mutateAsync: updatePost, isPending: isLoadingUpdate } = useUpdatedPost();
  const { user } = useUserContext();
  const { toast } = useToast();
  const navigate = useNavigate();
  const { darkMode } = useTheme(); 

 
  const t = {
    label:    darkMode ? D.subtext  : P[700],
    inputBg:  darkMode ? D.inputBg  : "#ffffff",
    inputBorder: darkMode ? D.border : P[200],
    inputText:   darkMode ? D.text   : "#1f2937",
    placeholder: darkMode ? D.muted  : "#9ca3af",
  };

  const inputStyle = {
    background:   t.inputBg,
    borderColor:  t.inputBorder,
    color:        t.inputText,
  };

  const form = useForm<z.infer<typeof PostValidation>>({
    resolver: zodResolver(PostValidation),
    defaultValues: {
      caption:  post ? post.caption          : "",
      file:     post ? post.file || []       : [],
      location: post ? post.location || ""   : "",
      tags:     post ? post.tags.join(",")   : "",
    },
  });

  const onSubmit = async (values: z.infer<typeof PostValidation>) => {
    if (post && action === "Update") {
      const updatedPost = await updatePost({
        ...values,
        tags: values.tags.split(",").map((tag) => tag.trim()),
        postId: post.$id,
        imageId: post?.imageId,
        imageUrl: post?.imageUrl,
      });

      if (!updatedPost) toast({ title: "Please try again" });
      return navigate(`/posts/${post.$id}`);
    }

    if (!user?.id) {
      toast({ title: "User not found. Please log in." });
      return;
    }

    const newPost = await createPost({
      ...values,
      tags: values.tags.split(",").map((tag) => tag.trim()),
      userId: user.id,
    });

    if (!newPost) toast({ title: "Please try again" });
    navigate("/");
  };

  console.log(post?.file);

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex flex-col gap-9 w-full max-w-5xl"
      >
       
        <FormField
          control={form.control}
          name="caption"
          render={({ field }) => (
            <FormItem>
              <FormLabel style={{ color: t.label }}>Caption</FormLabel>
              <FormControl>
                <Textarea
                  className="shad-textarea custom-scrollbar"
                  style={inputStyle}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

       
        <FormField
          control={form.control}
          name="file"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="shad-form-label" style={{ color: t.label }}>
                Add Photos
              </FormLabel>
              <FormControl>
                <FileUploader
                  fieldChange={field.onChange}
                  mediaUrl={post?.file || []}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

      
        <FormField
          control={form.control}
          name="location"
          render={({ field }) => (
            <FormItem>
              <FormLabel style={{ color: t.label }}>Add Location</FormLabel>
              <FormControl>
                <Input
                  type="text"
                  className="shad-input"
                  style={inputStyle}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        
        <FormField
          control={form.control}
          name="tags"
          render={({ field }) => (
            <FormItem>
              <FormLabel style={{ color: t.label }}>
                Add tags (comma-separated)
              </FormLabel>
              <FormControl>
                <Input
                  type="text"
                  placeholder="Art, Expression, Learn"
                  className="shad-input"
                  style={inputStyle}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

      
        <div className="flex gap-4 justify-end">
          <Button
            type="button"
            className="shad-button_dark_4"
            style={darkMode ? { background: D.surface, color: D.text, borderColor: D.border } : {}}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            className="shad-button_primary whitespace-nowrap"
            disabled={isLoadingCreate || isLoadingUpdate}
            style={darkMode ? { background: P[600], color: "#fff" } : {}}
          >
            {isLoadingCreate || isLoadingUpdate ? "Loading..." : `${action} Post`}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default PostForm;