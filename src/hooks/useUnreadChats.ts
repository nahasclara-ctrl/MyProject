import { useEffect, useState } from "react";
import { useUserContext } from "@/context/AuthContext";
import { getUnreadMessageCounts } from "@/lib/appwrite/api";
import { appwriteConfig, client } from "@/lib/appwrite/config";

export function useUnreadChats() {
  const { user } = useUserContext();
  const [unreadBySender, setUnreadBySender] = useState<Record<string, number>>({});


  const totalUnread = Object.values(unreadBySender).reduce((a, b) => a + b, 0);


  useEffect(() => {
    if (!user.$id) return;
    getUnreadMessageCounts(user.$id).then(setUnreadBySender);
  }, [user.$id]);

  
  useEffect(() => {
    if (!user.$id) return;

    const channel = `databases.${appwriteConfig.databaseId}.collections.${appwriteConfig.messagesCollectionId}.documents`;

    const unsub = client.subscribe(channel, (response: any) => {
      const event = response.events?.[0] ?? "";
      const doc = response.payload;

    
      if (event.includes("create") && doc?.receiverId === user.$id) {
        setUnreadBySender((prev) => ({
          ...prev,
          [doc.senderId]: (prev[doc.senderId] ?? 0) + 1,
        }));
      }

      
      if (event.includes("update") && doc?.receiverId === user.$id && doc?.read === true) {
 
        getUnreadMessageCounts(user.$id).then(setUnreadBySender);
      }
    });

    return () => unsub();
  }, [user.$id]);

  const clearUnreadFor = (senderId: string) => {
    setUnreadBySender((prev) => {
      const next = { ...prev };
      delete next[senderId];
      return next;
    });
  };

  return { unreadBySender, totalUnread, clearUnreadFor };
}