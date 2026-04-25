import { useEffect, useState } from "react";
import { useUserContext } from "@/context/AuthContext";
import { getNotifications } from "@/lib/appwrite/api";
import { appwriteConfig, client } from "@/lib/appwrite/config";

export function useUnreadNotifications() {
  const { user } = useUserContext();
  const [unreadCount, setUnreadCount] = useState(0);

  // Initial fetch
  useEffect(() => {
    if (!user.$id) return;
    getNotifications(user.$id).then((res) => {
      setUnreadCount(res.documents.filter((n: any) => !n.read).length);
    });
  }, [user.$id]);

  // Realtime: increment on new notification, decrement on delete
  useEffect(() => {
    if (!user.$id) return;

    const channel = `databases.${appwriteConfig.databaseId}.collections.${appwriteConfig.notificationsCollectionId}.documents`;

    const unsub = client.subscribe(channel, (response: any) => {
      const event = response.events?.[0] ?? "";
      const doc = response.payload;

      if (doc?.receiverId !== user.$id) return;

      if (event.includes("create") && !doc.read) {
        setUnreadCount((c) => c + 1);
      }
      if (event.includes("update") && doc.read) {
        // marked as read — reset to 0 (markNotificationsRead marks all)
        setUnreadCount(0);
      }
      if (event.includes("delete")) {
        setUnreadCount((c) => Math.max(0, c - 1));
      }
    });

    return () => unsub();
  }, [user.$id]);

  // Reset to 0 when user visits /notifications (handled externally via resetUnread)
  const resetUnread = () => setUnreadCount(0);

  return { unreadCount, resetUnread };
}