import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useUserContext } from "@/context/AuthContext";

const Settings = () => {
  const { user, logout } = useUserContext();
  const [darkMode, setDarkMode] = useState(false);

  // Load dark mode from localStorage
  useEffect(() => {
    const savedMode = localStorage.getItem("darkMode");
    if (savedMode === "true") setDarkMode(true);
  }, []);

  const toggleTheme = () => {
    setDarkMode(!darkMode);
    localStorage.setItem("darkMode", JSON.stringify(!darkMode));
  };

  return (
    <div
      className={`settings-page min-h-screen p-6 ${
        darkMode ? "bg-gray-900 text-white" : "bg-white text-black"
      }`}
    >
      <h1 className="text-3xl font-bold mb-6">Settings</h1>

      {/* Account Section */}
      <section className="mb-6">
        <h2 className="text-xl font-semibold mb-2">Account</h2>
        <div className="flex flex-col gap-3">
          {/* Link to Updateprofile page */}
          <Link
            to={`/update-profile/${user.id}`}
            className="border p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition"
          >
            Edit Profile
          </Link>
          <button
            onClick={logout}
            className="border p-2 rounded text-red-500 hover:bg-red-100 dark:hover:bg-red-700 transition"
          >
            Logout
          </button>
        </div>
      </section>

      {/* Preferences Section */}
      <section className="mb-6">
        <h2 className="text-xl font-semibold mb-2">Preferences</h2>
        <button
          onClick={toggleTheme}
          className="border p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition"
        >
          Theme: {darkMode ? "Dark" : "Light"}
        </button>
      </section>

      {/* User Info Section */}
      <section>
        <h2 className="text-xl font-semibold mb-2">Profile Info</h2>
        <div className="text-sm text-gray-500 dark:text-gray-300">
          <p>
            <strong>Name:</strong> {user?.name || "N/A"}
          </p>
          <p>
            <strong>Username:</strong> {user?.username || "N/A"}
          </p>
          <p>
            <strong>Email:</strong> {user?.email || "N/A"}
          </p>
        </div>
      </section>
    </div>
  );
};

export default Settings;