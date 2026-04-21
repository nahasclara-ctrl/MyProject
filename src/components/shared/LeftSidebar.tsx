import { useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { useUserContext } from "@/context/AuthContext";
import MoodModal from "@/components/MoodModal";
import { useTheme } from "@/context/ThemeProvider";

const P = {
  50: "#f6fbf8", 100: "#eaf5ef", 200: "#d6ebe0",
  300: "#b7dcc8", 400: "#7bbf9a", 500: "#4f9f75",
  600: "#3f8a63", 700: "#2f6e4f",
};

const D = {
  bg: "#0d1f16", surface: "#112218", surface2: "#1a3526",
  border: "#1e3d2a", text: "#d6ebe0", muted: "#7aab90",
};

type NavLinkItem = {
  kind: "link"; label: string; route: string; icon: string; badge?: number;
};
type NavActionItem = {
  kind: "action"; label: string; icon: string; onClick: () => void;
};
type NavItem = NavLinkItem | NavActionItem;

const NavRow = ({
  icon, label, isActive = false, badge, collapsed, darkMode,
}: {
  icon: string; label: string; isActive?: boolean;
  badge?: number; collapsed: boolean; darkMode: boolean;
}) => {
  const hasBadge = badge !== undefined && badge > 0;

  return (
    <span
      style={{
        display: "flex",
        alignItems: "center",
        gap: collapsed ? 0 : "0.72rem",
        padding: collapsed ? "0.6rem" : "0.6rem 0.8rem",
        borderRadius: "11px",
        width: "100%",
        justifyContent: collapsed ? "center" : "flex-start",
        boxSizing: "border-box",
        transition: "all 0.18s ease",
        cursor: "pointer",
        ...(isActive
          ? { background: `linear-gradient(135deg, ${P[600]}, ${P[400]})`, boxShadow: `0 6px 18px rgba(79,159,117,0.25)` }
          : { background: "transparent" }),
      }}
    >
      <span
        style={{
          position: "relative", display: "flex", alignItems: "center",
          justifyContent: "center", width: 32, height: 32, borderRadius: "8px",
          flexShrink: 0,
          background: isActive ? "rgba(255,255,255,0.2)" : (darkMode ? D.surface2 : P[100]),
        }}
      >
        <img
          src={icon} alt={label}
          style={{ width: 17, height: 17, filter: isActive ? "brightness(0) invert(1)" : darkMode ? "opacity(0.8) invert(0.7)" : "opacity(0.55)" }}
        />
        {collapsed && hasBadge && <span style={iconBadgeStyle}>{badge! > 9 ? "9+" : badge}</span>}
      </span>

      {!collapsed && (
        <>
          <span style={{
            flex: 1, fontSize: "0.875rem",
            fontWeight: isActive ? 700 : 500,
            color: isActive ? "#fff" : (darkMode ? D.text : P[700]),
            letterSpacing: "-0.012em", whiteSpace: "nowrap",
          }}>
            {label}
          </span>
          {hasBadge && <span style={inlineBadgeStyle}>{badge! > 9 ? "9+" : badge}</span>}
        </>
      )}
    </span>
  );
};

const iconBadgeStyle: React.CSSProperties = {
  background: "#e35d5d", color: "#fff", fontSize: "0.55rem", fontWeight: 800,
  borderRadius: "999px", minWidth: 15, height: 15, display: "flex",
  alignItems: "center", justifyContent: "center", padding: "0 3px",
  position: "absolute", top: -3, right: -3, boxShadow: "0 0 0 2px #fff", lineHeight: 1,
};

const inlineBadgeStyle: React.CSSProperties = {
  background: "#e35d5d", color: "#fff", fontSize: "0.62rem", fontWeight: 800,
  borderRadius: "999px", minWidth: 18, height: 18, display: "flex",
  alignItems: "center", justifyContent: "center", padding: "0 5px",
};

const StoryRing = ({ children, active }: { children: React.ReactNode; active: boolean }) => (
  <span style={{
    display: "inline-flex", alignItems: "center", justifyContent: "center",
    borderRadius: "50%", padding: "2.5px",
    background: active
      ? `linear-gradient(135deg, ${P[600]}, ${P[400]})`
      : `linear-gradient(135deg, ${P[300]}, ${P[200]})`,
    flexShrink: 0,
    boxShadow: active ? `0 0 0 2px ${P[50]}, 0 0 12px rgba(79,159,117,0.35)` : "none",
    transition: "box-shadow 0.3s",
  }}>
    {children}
  </span>
);

const LeftSidebar = () => {
  const { pathname } = useLocation();
  const { user, logout } = useUserContext();
  const { darkMode } = useTheme();

  const [showMood, setShowMood] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  const unreadChats: number = 0;
  const unreadNotifications: number = 0;
  const isProfileActive = pathname.startsWith("/profile");

  const navItems: NavItem[] = [
    { kind: "link", label: "Home", route: "/", icon: "/assets/icons/home.svg" },
    { kind: "link", label: "Explore", route: "/explore", icon: "/assets/icons/wallpaper.svg" },
    { kind: "link", label: "People", route: "/all-users", icon: "/assets/icons/people.svg" },
    { kind: "link", label: "Chat", route: "/chat", icon: "/assets/icons/chat.svg", badge: unreadChats },
    { kind: "link", label: "Notifications", route: "/notifications", icon: "/assets/icons/like.svg", badge: unreadNotifications },
    { kind: "action", label: "Mood", icon: "/assets/images/mood.png", onClick: () => setShowMood(true) },
    { kind: "link", label: "Saved", route: "/saved", icon: "/assets/icons/bookmark.svg" },
    { kind: "link", label: "Create", route: "/create-post", icon: "/assets/icons/gallery-add.svg" },
    { kind: "link", label: "Settings", route: "/settings", icon: "/assets/icons/settings.svg" },
  ];

  const W = collapsed ? 72 : 260;

  return (
    <>
      <nav style={{
        display: "flex", flexDirection: "column", justifyContent: "space-between",
        height: "100vh", width: W, minWidth: W,
        padding: collapsed ? "1.2rem 0.5rem" : "1.2rem 0.85rem",
        background: darkMode
          ? `linear-gradient(180deg, ${D.surface} 0%, ${D.bg} 100%)`
          : `linear-gradient(180deg, #ffffff 0%, #f4faf7 100%)`,
        borderRight: `1px solid ${darkMode ? D.border : P[200]}`,
        boxShadow: darkMode ? "4px 0 28px rgba(0,0,0,0.3)" : "4px 0 28px rgba(79,159,117,0.08)",
        fontFamily: "'DM Sans', 'Inter', sans-serif",
        position: "sticky", top: 0, overflowY: "auto", overflowX: "hidden",
        transition: "width 0.24s cubic-bezier(.4,0,.2,1), background 0.3s, border-color 0.3s",
        zIndex: 40, boxSizing: "border-box",
      }}>
        <div style={{ display: "flex", flexDirection: "column", gap: "0.85rem" }}>

          {/* LOGO */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: collapsed ? "center" : "space-between" }}>
            {!collapsed && (
              <Link to="/">
                <img src="/assets/images/logo1.jpeg" alt="Logo" style={{ height: 50, borderRadius: "50%" }} />
              </Link>
            )}
            <button
              onClick={() => setCollapsed(c => !c)}
              style={{
                background: darkMode ? D.surface2 : P[100],
                border: "none", borderRadius: "8px",
                width: 28, height: 28,
                color: darkMode ? D.text : P[700],
                cursor: "pointer",
              }}
            >
              {collapsed ? "›" : "‹"}
            </button>
          </div>

          <div style={{ height: 1, background: `linear-gradient(90deg, transparent, ${darkMode ? D.border : P[200]}, transparent)` }} />

          {/* PROFILE */}
          <Link
            to={`/profile/${user.id}`}
            style={{
              display: "flex", alignItems: "center",
              gap: collapsed ? 0 : "0.72rem",
              justifyContent: collapsed ? "center" : "flex-start",
              padding: collapsed ? "0.4rem" : "0.55rem 0.7rem",
              borderRadius: "14px", textDecoration: "none",
              background: isProfileActive ? (darkMode ? D.surface2 : P[50]) : "transparent",
            }}
          >
            <StoryRing active={isProfileActive}>
              <img
                src={user.imageUrl || "/assets/icons/profile-placeholder.svg"}
                style={{ width: collapsed ? 38 : 42, height: collapsed ? 38 : 42, borderRadius: "50%", objectFit: "cover" }}
              />
            </StoryRing>

            {!collapsed && (
              <div>
                <p style={{ margin: 0, fontWeight: 700, color: darkMode ? D.text : P[700] }}>{user.name}</p>
                <p style={{ margin: 0, fontSize: "0.7rem", color: darkMode ? D.muted : P[500] }}>@{user.username}</p>
              </div>
            )}
          </Link>

          {/* NAV */}
          <ul style={{ listStyle: "none", padding: 0 }}>
            {navItems.map((item) => {
              if (item.kind === "action") {
                return (
                  <li key={item.label}>
                    <button type="button" onClick={item.onClick} style={{ all: "unset", display: "block", width: "100%" }}>
                      <NavRow icon={item.icon} label={item.label} collapsed={collapsed} darkMode={darkMode} />
                    </button>
                  </li>
                );
              }
              const isActive = item.route === "/" ? pathname === "/" : pathname.startsWith(item.route);
              return (
                <li key={item.label}>
                  <NavLink to={item.route} style={{ textDecoration: "none" }}>
                    <NavRow icon={item.icon} label={item.label} isActive={isActive} badge={item.badge} collapsed={collapsed} darkMode={darkMode} />
                  </NavLink>
                </li>
              );
            })}
          </ul>
        </div>

        {/* LOGOUT */}
        <button
          onClick={logout}
          style={{
            background: "transparent",
            border: `1px solid ${darkMode ? D.border : P[200]}`,
            color: darkMode ? D.muted : P[600],
            borderRadius: "11px",
            padding: collapsed ? "0.6rem" : "0.6rem 0.85rem",
            cursor: "pointer",
          }}
        >
          {!collapsed && "Logout"}
        </button>
      </nav>

      {showMood && user.id && (
        <div style={{ position: "fixed", inset: 0, zIndex: 9999, display: "flex" }}>
          <div onClick={() => setShowMood(false)} style={{ flex: 1, background: "rgba(0,0,0,0.25)" }} />
          <div style={{ width: 400, maxWidth: "100%", background: darkMode ? D.surface : "#fff" }}>
            <MoodModal userId={user.id} userDisplayName={user.name || "User"} />
          </div>
        </div>
      )}
    </>
  );
};

export default LeftSidebar;