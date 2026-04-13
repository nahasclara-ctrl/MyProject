import { useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { Button } from "../ui/button";
import { useUserContext } from "@/context/AuthContext";
import type { INavLink } from "@/types";
import { sidebarLinks } from "@/constants";
import MoodModal from "@/components/MoodModal";

const LeftSidebar = () => {
  const { pathname } = useLocation();
  const { user, logout } = useUserContext();

  const [showMood, setShowMood] = useState(false);

  return (
    <>
      <nav className="leftsidebar">
        <div className="flex flex-col gap-3 py-4">
          
          {/* LOGO */}
          <Link to="/" className="flex gap-3 items-center">
            <img
              src="/assets/images/log0.png"
              alt="Logo"
              width={170}
              height={36}
            />
          </Link>

          {/* PROFILE */}
          <Link to={`/profile/${user.id}`} className="flex gap-3 items-center">
            <img
              src={user.imageUrl || "/assets/icons/profile-placeholder.svg"}
              alt="Profile"
              width={32}
              height={32}
              className="h-14 w-14 rounded-full"
            />
            <div className="flex flex-col">
              <p className="body-bold">{user.name}</p>
              <p className="small-regular text-light-3">@{user.username}</p>
            </div>
          </Link>

          {/* LINKS */}
          <ul className="flex flex-col gap-6">
            {sidebarLinks.map((link: INavLink) => {
              const isActive = pathname === link.route;

              return (
                <li
                  key={link.label}
                  className={`leftsidebar__link group ${
                    isActive && "bg-primary-500"
                  }`}
                >
                  <NavLink
                    to={link.route}
                    className="flex gap-4 items-center p-4"
                  >
                    <img
                      src={link.imgURL}
                      alt={link.label}
                      className={`group-hover:invert-white ${
                        isActive && "invert-white"
                      }`}
                    />
                    {link.label}
                  </NavLink>
                </li>
              );
            })}

            {/* 🎭 MOOD BUTTON (NEW) */}
            <li className="leftsidebar__link group">
              <button
                onClick={() => setShowMood(true)}
                className="flex gap-4 items-center p-4 w-full text-left"
              >
                <img src="/assets/icons/mood.svg" alt="Mood" />
                Mood 🎭
              </button>
            </li>
          </ul>
        </div>

        {/* LOGOUT */}
        <Button
          variant="ghost"
          className="shad-button_ghost"
          onClick={logout}
        >
          <img src="/assets/icons/logout.svg" alt="Logout" />
          <p className="small-medium lg:base-medium">Logout</p>
        </Button>
      </nav>

      {/* ================= MOOD DRAWER ================= */}
      {showMood && (
        <div className="fixed inset-0 z-50 flex">

          {/* BACKDROP */}
          <div
            className="flex-1 bg-black/40"
            onClick={() => setShowMood(false)}
          />

          {/* RIGHT PANEL (Instagram style) */}
          <div className="w-[400px] max-w-full bg-white h-full shadow-xl relative">
            
            {/* CLOSE BUTTON */}
            <button
              onClick={() => setShowMood(false)}
              className="absolute top-3 right-3 text-black text-xl"
            >
              ✕
            </button>

            {/* CONTENT */}
            <div className="p-4">
              {user.id && (
                <MoodModal
                  userId={user.id}
                  userDisplayName={user.name}
                />
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default LeftSidebar;