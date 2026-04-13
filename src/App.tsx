import { Routes, Route } from "react-router-dom";
import "./globals.css";
import {
  AllUsers,
  CreatePost,
  EditPost,
  Explore,
  Home,
  LikedPosts,
  Postdetails,
  Profile,
  Saved,
  Updateprofile,
  Settings,
} from "./_root/pages";

import Chat from "./_root/pages/Chat";
import Notifications from "./_root/pages/Notification";

import SigninForm from "./_auth/forms/SigninForm";
import SignupForm from "./_auth/forms/SignupForm";
import AuthLayout from "./_auth/AuthLayout";
import RootLayout from "./_root/RootLayout";
import FullPageLayout from "./_root/layouts/FullPageLayout";
import { Toaster } from "@/components/ui/toaster";
import { SavedPostsProvider } from "./context/savedPostsContext";
import MoodCircles from "./components/MoodCircles";

const App = () => {
  return (
    <SavedPostsProvider>
      <main className="flex h-screen">
        <Routes>
          {/* Public routes */}
          <Route element={<AuthLayout />}>
            <Route path="/sign-in" element={<SigninForm />} />
            <Route path="/sign-up" element={<SignupForm />} />
            
          </Route>

          {/* Private routes with normal layout */}
          <Route element={<RootLayout />}>
            <Route index element={<Home />} />
            <Route path="/explore" element={<Explore />} />
            <Route path="/saved" element={<Saved />} />
            <Route path="/all-users" element={<AllUsers />} />
            <Route path="/create-post" element={<CreatePost />} />
            <Route path="/update-post/:id" element={<EditPost />} />
            <Route path="/posts/:id" element={<Postdetails />} />
            <Route path="/profile/:id/*" element={<Profile />} />
            <Route path="/update-profile/:id" element={<Updateprofile />} />
            <Route path="/liked-posts" element={<LikedPosts />} />
            <Route path="/chat" element={<Chat />} />
            <Route path="/notifications" element={<Notifications />} />
            
          </Route>

          {/* Full-screen routes */}
          <Route element={<FullPageLayout />}>
            <Route path="/settings" element={<Settings />} />
          </Route>
        </Routes>

        <Toaster />
      </main>
    </SavedPostsProvider>
  );
};

export default App;