import { useEffect, useState } from "react";
import { useUserContext } from "@/context/AuthContext";
import { getUnreadMessageCounts } from "@/lib/appwrite/api";
import { appwriteConfig, client } from "@/lib/appwrite/config";

export function useUnreadChats() {
  const { user } = useUserContext();
  const [unreadBySender, setUnreadBySender] = useState<Record<string, number>>({});

  // Total unread count (for sidebar badge)
  const totalUnread = Object.values(unreadBySender).reduce((a, b) => a + b, 0);

  // Initial fetch
  useEffect(() => {
    if (!user.$id) return;
    getUnreadMessageCounts(user.$id).then(setUnreadBySender);
  }, [user.$id]);

  // Realtime: update when new message arrives or message marked read
  useEffect(() => {
    if (!user.$id) return;

    const channel = `databases.${appwriteConfig.databaseId}.collections.${appwriteConfig.messagesCollectionId}.documents`;

    const unsub = client.subscribe(channel, (response: any) => {
      const event = response.events?.[0] ?? "";
      const doc = response.payload;

      // New unread message for me
      if (event.includes("create") && doc?.receiverId === user.$id) {
        setUnreadBySender((prev) => ({
          ...prev,
          [doc.senderId]: (prev[doc.senderId] ?? 0) + 1,
        }));
      }

      // Message marked as read
      if (event.includes("update") && doc?.receiverId === user.$id && doc?.read === true) {
        // Re-fetch to get accurate counts
        getUnreadMessageCounts(user.$id).then(setUnreadBySender);
      }
    });

    return () => unsub();
  }, [user.$id]);

  // Call this when user opens a conversation
  const clearUnreadFor = (senderId: string) => {
    setUnreadBySender((prev) => {
      const next = { ...prev };
      delete next[senderId];
      return next;
    });
  };

  return { unreadBySender, totalUnread, clearUnreadFor };
}