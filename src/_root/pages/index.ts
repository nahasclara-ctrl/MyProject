export { default as AllUsers } from "./AllUsers";
export { default as CreatePost } from "./CreatePost";
export { default as EditPost } from "./EditPost";
export { default as Explore } from "./Explore";
export { default as Home } from "./Home";
export { default as LikedPosts } from "./LikedPosts";
export { default as Postdetails } from "./Postdetails";
export { default as Profile } from "./Profile";
export { default as Saved } from "./Saved";
export { default as Updateprofile } from "./Updateprofile";
import * as z from "zod"
export const SignupValidation= z.object({
    name: z.string().min(2, { message: 'Too short' }),
    username: z.string().min(2, { message: 'Too short' }),
    email: z.string().email(),
    password: z.string().min(8, { message: 'Password must be at least 8 characters.' }),
})
export const SigninValidation = z.object({
   email: z.string().email(),
    password: z.string().min(8, { message: 'Password must be at least 8 characters.' }),
})

export const PostValidation = z.object({
   caption: z.string().min(5).max(2200),
   file:z.custom<File[]>(),
    location: z.string().min(2).max(100),
    tags: z.string(),


})