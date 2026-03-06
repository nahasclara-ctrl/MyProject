import React from "react";
import { useForm } from "react-hook-form";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormDescription,
  FormMessage,
} from "@/components/ui/form";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";


const PostForm = ( { Post }) => {
  const form = useForm<z.infer<typeof formSchema>>({
    defaultValues: {
      caption: post? post?.caption : "",
      file: []
      location: post? post?.location : "",
        tags: post? post.tags.join(',') : "",
    },
  });

  const onSubmit = (values) => {
    console.log(values);
  };

  return (
    <div>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-9 w-full max-w-5xl">

          <FormField
            control={form.control}
            name="caption"
            render={({ field }) => (
              <FormItem>

                <FormLabel className="shad-form-label">Caption</FormLabel>

                <FormControl>
                  <textarea placeholder="shad-textarea custom-scrollbar" {...field} />
                </FormControl>

                <FormDescription>
                  This is your post caption.
                </FormDescription>

                <FormMessage className ="shad-form_meassage" />

              </FormItem>
            )}
          />

          <Button type="submit">Submit</Button>

   
          <FormField
            control={form.control}
            name="file"
            render={({ field }) => (
              <FormItem>

                <FormLabel className="shad-form-label">add Photos </FormLabel>

                <FormControl> 
                 <fileUploader 
                 fieldChange ={field.onChange}
                 mediaUrl={}/>
                </FormControl>

                <FormDescription>
                  This is your post file.
                </FormDescription>

                <FormMessage className ="shad-form_meassage" />

              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="location"
            render={({ field }) => (
              <FormItem>

                <FormLabel className="shad-form-label"> add Location</FormLabel>

                <FormControl> 
                 <input type="text" className="shad-input" />
                </FormControl>

                <FormDescription>
                  This is your post location.
                </FormDescription>

                <FormMessage className ="shad-form_meassage" />

              </FormItem>
            )}
          />



          <FormField
            control={form.control}
            name="tags"
            render={({ field }) => (
              <FormItem>

                <FormLabel className="shad-form-label"> add tags (separated by comma ",")</FormLabel>

                <FormControl> 
                 <input type="text"
                  className="shad-input"
                  placeholder="Art, Expression, learn" />
                </FormControl>

                <FormDescription>
                  This is your post location.
                </FormDescription>

                <FormMessage className ="shad-form_meassage" />

              </FormItem>
            )}
          />
          <div className="flex gap-4 items-center-justify-end">
          <Button type="button" className="shad-button_dark_4">Cancel</Button>
          <Button type="submit" className="shad-button_primary whitespace-nowrap">Submit</Button>
</div>
        </form>
      </Form>


      <div>PostForm</div>
    </div>
  );
};

export default PostForm;