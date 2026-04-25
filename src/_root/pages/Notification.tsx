import { useEffect, useState, useRef, useCallback } from "react";
import { useUserContext } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeProvider";
import { getNotifications, markNotificationsRead } from "@/lib/appwrite/api";
import { appwriteConfig, client } from "@/lib/appwrite/config";
import Loader from "@/components/shared/Loader";
import { Link } from "react-router-dom";
 
const P = {
  50: "#f6fbf8", 100: "#eaf5ef", 200: "#d6ebe0",
  300: "#b7dcc8", 400: "#7bbf9a", 500: "#4f9f75",
  600: "#3f8a63", 700: "#2f6e4f",
};
const D = {
  bg: "#0f1a14", surface: "#1a2b20", border: "#2a3f30",
  text: "#d6ebe0", subtext: "#7bbf9a", muted: "#3a5444",
};
 
const PAGE_SIZE = 20;
 
const Notifications = () => {
  const { user } = useUserContext();
  const { darkMode } = useTheme();
 
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading]             = useState(true);
  const [loadingMore, setLoadingMore]     = useState(false);
  const [hasMore, setHasMore]             = useState(true);
  const [unreadCount, setUnreadCount]     = useState(0);
  const cursorRef  = useRef<string | null>(null); // last doc $id for pagination
  const bottomRef  = useRef<HTMLDivElement>(null);
 
  const t = {
    pageBg:  darkMode ? D.bg      : `linear-gradient(180deg, ${P[50]}, #ffffff)`,
    surface: darkMode ? D.surface : "#fff",
    border:  darkMode ? D.border  : P[200],
    text:    darkMode ? D.text    : P[700],
    subtext: darkMode ? D.subtext : P[500],
    muted:   darkMode ? D.muted   : P[400],
  };
 
  // ── Initial fetch ────────────────────────────────────────────
  useEffect(() => {
    if (!user.$id) return;
    (async () => {
      setLoading(true);
      const res = await getNotifications(user.$id, PAGE_SIZE, null);
      setNotifications(res.documents);
      setUnreadCount(res.documents.filter((n: any) => !n.read).length);
      cursorRef.current = res.documents.length > 0
        ? res.documents[res.documents.length - 1].$id
        : null;
      setHasMore(res.documents.length === PAGE_SIZE);
      setLoading(false);
    })();
  }, [user.$id]);
 
  // ── Load more ────────────────────────────────────────────────
  const loadMore = useCallback(async () => {
    if (loadingMore || !hasMore || !cursorRef.current) return;
    setLoadingMore(true);
    const res = await getNotifications(user.$id, PAGE_SIZE, cursorRef.current);
    setNotifications((prev) => {
      const existingIds = new Set(prev.map((n) => n.$id));
      const fresh = res.documents.filter((n: any) => !existingIds.has(n.$id));
      return [...prev, ...fresh];
    });
    cursorRef.current = res.documents.length > 0
      ? res.documents[res.documents.length - 1].$id
      : cursorRef.current;
    setHasMore(res.documents.length === PAGE_SIZE);
    setLoadingMore(false);
  }, [loadingMore, hasMore, user.$id]);
 
  // ── Infinite scroll observer ─────────────────────────────────
  useEffect(() => {
    if (!bottomRef.current) return;
    const observer = new IntersectionObserver(
      (entries) => { if (entries[0].isIntersecting) loadMore(); },
      { threshold: 0.1 }
    );
    observer.observe(bottomRef.current);
    return () => observer.disconnect();
  }, [loadMore]);
 
  // ── Realtime subscription ────────────────────────────────────
  useEffect(() => {
    if (!user.$id) return;
    const channel = `databases.${appwriteConfig.databaseId}.collections.${appwriteConfig.notificationsCollectionId}.documents`;
 
    const unsub = client.subscribe(channel, (response: any) => {
      const event = response.events?.[0] ?? "";
      const doc   = response.payload;
      if (doc?.receiverId !== user.$id) return;
 
      if (event.includes("create")) {
        setNotifications((prev) => [doc, ...prev]);
        setUnreadCount((c) => c + 1);
      }
      if (event.includes("delete")) {
        setNotifications((prev) => prev.filter((n) => n.$id !== doc.$id));
      }
    });
 
    return () => unsub();
  }, [user.$id]);
 
  // ── Mark read after 2s ───────────────────────────────────────
  useEffect(() => {
    if (!user.$id || unreadCount === 0) return;
    const timer = setTimeout(() => {
      markNotificationsRead(user.$id);
      setUnreadCount(0);
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    }, 2000);
    return () => clearTimeout(timer);
  }, [unreadCount, user.$id]);
 
  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen" style={{ background: t.pageBg }}>
        <Loader />
      </div>
    );
  }
 
  return (
    <div
      className="min-h-screen w-full max-w-2xl mx-auto px-4 py-8 transition-colors duration-300"
      style={{ background: t.pageBg, color: t.text }}
    >
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <span className="text-2xl">🔔</span>
        <h2 className="text-2xl font-bold tracking-tight" style={{ color: t.text }}>
          Notifications
        </h2>
        {unreadCount > 0 && (
          <span
            className="ml-auto px-2.5 py-0.5 rounded-full text-xs font-bold text-white"
            style={{ background: P[500] }}
          >
            {unreadCount} new
          </span>
        )}
      </div>
 
      {/* Empty state */}
      {notifications.length === 0 ? (
        <div
          className="text-center mt-20 p-10 rounded-2xl border"
          style={{ backgroundColor: t.surface, borderColor: t.border }}
        >
          <p className="text-4xl mb-2">🔔</p>
          <p className="font-semibold" style={{ color: t.subtext }}>No notifications yet</p>
          <p className="text-sm mt-1" style={{ color: t.muted }}>Likes and follows will appear here</p>
        </div>
      ) : (
        <>
          <ul className="flex flex-col gap-3">
            {notifications.map((notif) => (
              <li
                key={notif.$id}
                className="flex items-center gap-3 p-4 rounded-2xl border transition hover:-translate-y-0.5 hover:shadow-md"
                style={{
                  borderColor: t.border,
                  backgroundColor: !notif.read
                    ? (darkMode ? "#1e3326" : P[100])
                    : t.surface,
                }}
              >
                <Link to={`/profile/${notif.senderId}`}>
                  <img
                    src={notif.senderImg || "/assets/icons/profile-placeholder.svg"}
                    className="w-11 h-11 rounded-full object-cover flex-shrink-0"
                    style={{ border: `1px solid ${t.border}` }}
                  />
                </Link>
 
                <div className="flex-1 min-w-0">
                  <p className="text-sm">
                    <Link
                      to={`/profile/${notif.senderId}`}
                      style={{ color: t.subtext, fontWeight: 700, textDecoration: "none" }}
                    >
                      {notif.senderName}
                    </Link>{" "}
                    <span style={{ color: t.muted }}>
                      {notif.type === "like" ? "liked your post" : "started following you"}
                    </span>
                  </p>
                  {notif.caption && (
                    <p className="text-xs mt-0.5 italic truncate" style={{ color: t.muted }}>
                      "{notif.caption}"
                    </p>
                  )}
                  <p className="text-xs mt-0.5" style={{ color: t.muted }}>
                    {new Date(notif.$createdAt).toLocaleDateString(undefined, {
                      month: "short", day: "numeric",
                      hour: "2-digit", minute: "2-digit",
                    })}
                  </p>
                </div>
 
                {notif.postImg && notif.type === "like" && (
                  <Link to={`/posts/${notif.postId}`} className="flex-shrink-0">
                    <img
                      src={notif.postImg}
                      className="w-11 h-11 rounded-xl object-cover"
                      style={{ border: `1px solid ${t.border}` }}
                    />
                  </Link>
                )}
 
                <span className="flex-shrink-0">
                  {notif.type === "like" ? "❤️" : "👤"}
                </span>
              </li>
            ))}
          </ul>
 
          {/* Infinite scroll sentinel */}
          <div ref={bottomRef} className="py-4 flex justify-center">
            {loadingMore && <Loader />}
            {!hasMore && notifications.length > PAGE_SIZE && (
              <p className="text-xs" style={{ color: t.muted }}>You're all caught up 🎉</p>
            )}
          </div>
        </>
      )}
    </div>
  );
};
 
export default Notifications;