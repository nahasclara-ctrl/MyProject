import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useUserContext } from "@/context/AuthContext";

const P = {
  50: "#f6fbf8",
  100: "#eaf5ef",
  200: "#d6ebe0",
  300: "#b7dcc8",
  400: "#7bbf9a",
  500: "#4f9f75",
  600: "#3f8a63",
  700: "#2f6e4f",
};

const Settings = () => {
  const { user, logout } = useUserContext();

  const [darkMode, setDarkMode] = useState(false);
  const [notifications, setNotifications] = useState(true);

  useEffect(() => {
    const saved = localStorage.getItem("darkMode");
    if (saved === "true") setDarkMode(true);
  }, []);

  const toggleTheme = () => {
    const newValue = !darkMode;
    setDarkMode(newValue);
    localStorage.setItem("darkMode", JSON.stringify(newValue));
  };

  return (
    <div
      className="min-h-screen px-6 py-10"
      style={{
        background: `linear-gradient(180deg, ${P[50]}, #ffffff)`,
        color: P[700],
      }}
    >
      <div className="max-w-3xl mx-auto space-y-8">

        {/* HEADER */}
        <div>
          <h1 className="text-3xl font-bold" style={{ color: P[700] }}>
            Settings
          </h1>
          <p className="text-sm mt-1" style={{ color: P[400] }}>
            Manage your account, privacy, and preferences
          </p>
        </div>

        {/* ACCOUNT */}
        <Section title="Account">
          <SettingItem>
            <Link
              to={`/update-profile/${user.id}`}
              style={{ color: P[600] }}
            >
              Edit Profile
            </Link>
          </SettingItem>

          <SettingItem danger>
            <button onClick={logout} style={{ color: "#b91c1c" }}>
              Logout
            </button>
          </SettingItem>

          <SettingItem danger>
            <button style={{ color: "#b91c1c" }}>
              Delete Account
            </button>
          </SettingItem>
        </Section>

        {/* PREFERENCES */}
        <Section title="Preferences">
          <SettingItem>
            <div className="flex justify-between w-full">
              <span>Dark Mode</span>
              <button onClick={toggleTheme} style={{ color: P[500] }}>
                {darkMode ? "On" : "Off"}
              </button>
            </div>
          </SettingItem>

          <SettingItem>
            <div className="flex justify-between w-full">
              <span>Notifications</span>
              <button
                onClick={() => setNotifications(!notifications)}
                style={{ color: P[500] }}
              >
                {notifications ? "Enabled" : "Disabled"}
              </button>
            </div>
          </SettingItem>

          <SettingItem>
            <Link to="/language" style={{ color: P[600] }}>
              Language
            </Link>
          </SettingItem>
        </Section>

        {/* PRIVACY */}
        <Section title="Privacy & Security">
          <SettingItem>
            <Link to="/privacy" style={{ color: P[600] }}>
              Privacy Settings
            </Link>
          </SettingItem>

          <SettingItem>
            <Link to="/blocked-users" style={{ color: P[600] }}>
              Blocked Users
            </Link>
          </SettingItem>

          <SettingItem>
            <Link to="/activity-log" style={{ color: P[600] }}>
              Activity Log
            </Link>
          </SettingItem>
        </Section>

        {/* PROFILE INFO */}
        <Section title="Profile Info">
          <div className="space-y-1 text-sm" style={{ color: P[500] }}>
            <p>
              <span style={{ color: P[700] }}>Name:</span> {user?.name}
            </p>
            <p>
              <span style={{ color: P[700] }}>Username:</span> {user?.username}
            </p>
            <p>
              <span style={{ color: P[700] }}>Email:</span> {user?.email}
            </p>
          </div>
        </Section>

      </div>
    </div>
  );
};

/* ================= UI HELPERS ================= */

const Section = ({ title, children }: any) => (
  <div>
    <h2 className="text-lg font-semibold mb-3" style={{ color: P[700] }}>
      {title}
    </h2>
    <div
      className="rounded-2xl border divide-y"
      style={{ borderColor: P[200], backgroundColor: "#fff" }}
    >
      {children}
    </div>
  </div>
);

const SettingItem = ({ children, danger }: any) => (
  <div
    className="px-4 py-3 flex items-center justify-between hover:bg-opacity-5 transition"
    style={{
      borderColor: P[200],
    }}
  >
    <div className={danger ? "text-red-600" : ""}>{children}</div>
  </div>
);

export default Settings;