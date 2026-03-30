import { useEffect } from "react";
import { Link, NavLink, useNavigate, useLocation } from "react-router-dom";
import { Button } from "../ui/button";
import { useUserContext } from "@/context/AuthContext";
import type { INavLink } from "@/types";
import { sidebarLinks } from "@/constants";

const LeftSidebar = () => {
  const { pathname } = useLocation();
  const { user, logout } = useUserContext(); // use AuthContext logout
  const navigate = useNavigate();

  return (
    <nav className="leftsidebar">
      <div className="flex flex-col gap-3 py-4">
        {/* Logo */}
        <Link to="/" className="flex gap-3 items-center">
          <img
            src="/assets/images/log0.png"
            alt="Logo"
            width={170}
            height={36}
          />
        </Link>

        {/* Profile link */}
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

        {/* Sidebar links */}
        <ul className="flex flex-col gap-6">
          {sidebarLinks.map((link: INavLink) => {
            const isActive = pathname === link.route;
            return (
              <li
                key={link.label}
                className={`leftsidebar__link group ${isActive && "bg-primary-500"}`}
              >
                <NavLink
                  to={link.route}
                  className="flex gap-4 items-center p-4"
                >
                  <img
                    src={link.imgURL}
                    alt={link.label}
                    className={`group-hover:invert-white ${isActive && "invert-white"}`}
                  />
                  {link.label}
                </NavLink>
              </li>
            );
          })}
        </ul>
      </div>

      {/* Logout button */}
      <Button
        variant="ghost"
        className="shad-button_ghost"
        onClick={() => logout()} // uses AuthContext logout
      >
        <img src="/assets/icons/logout.svg" alt="Logout" />
        <p className="small-medium lg:base-medium">Logout</p>
      </Button>
    </nav>
  );
};

export default LeftSidebar;