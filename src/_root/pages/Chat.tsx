import { useState, useEffect, useRef, useCallback } from "react";
import { useGetUsers } from "@/lib/react-query/queriesAndMutations";
import { useUserContext } from "@/context/AuthContext";
import Loader from "@/components/shared/Loader";
import { databases, appwriteConfig, client, ID } from "@/lib/appwrite/config";
import { Query } from "appwrite";
import { useTheme } from "@/context/ThemeProvider";
import { getUnreadMessageCounts, markMessagesRead, getLatestMessage } from "@/lib/appwrite/api";

const LIGHT = {
  bg: "#f6fbf8", card: "#ffffffcc", soft: "#eaf5ef",
  border: "#d6ebe0", primary: "#4f9f75", primarySoft: "#7bbf9a",
  text: "#2f6e4f", muted: "#7bbf9a",
};
const DARK = {
  bg: "#0d1f16", card: "#112218cc", soft: "#1a3526",
  border: "#1e3d2a", primary: "#4f9f75", primarySoft: "#7bbf9a",
  text: "#d6ebe0", muted: "#7aab90",
};

type Message = {
  $id: string; senderId: string; receiverId: string;
  text: string; $createdAt: string; read?: boolean;
};

async function fetchMessages(userId1: string, userId2: string): Promise<Message[]> {
  try {
    const [res1, res2] = await Promise.all([
      databases.listDocuments(
        appwriteConfig.databaseId,
        appwriteConfig.messagesCollectionId,
        [
          Query.equal("senderId", userId1),
          Query.equal("receiverId", userId2),
          Query.orderAsc("$createdAt"),
          Query.limit(200),
        ]
      ),
      databases.listDocuments(
        appwriteConfig.databaseId,
        appwriteConfig.messagesCollectionId,
        [
          Query.equal("senderId", userId2),
          Query.equal("receiverId", userId1),
          Query.orderAsc("$createdAt"),
          Query.limit(200),
        ]
      ),
    ]);

    console.log("res1 (my sent):", res1.documents.length);
    console.log("res2 (their sent):", res2.documents.length);

    const merged = [...res1.documents, ...res2.documents];
    merged.sort((a, b) => new Date(a.$createdAt).getTime() - new Date(b.$createdAt).getTime());
    return merged as unknown as Message[];
  } catch (error) {
    console.error("fetchMessages error:", error);
    return [];
  }
}
async function sendMessage(senderId: string, receiverId: string, text: string) {
  return await databases.createDocument(
    appwriteConfig.databaseId,
    appwriteConfig.messagesCollectionId,
    ID.unique(),
    { senderId, receiverId, text, read: false }
  );
}

const Chat = () => {
  const { user: currentUser } = useUserContext();
  const { data: allUsers, isLoading } = useGetUsers();
  const { darkMode } = useTheme();
  const T = darkMode ? DARK : LIGHT;

  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);

  // unread counts per sender
  const [unreadBySender, setUnreadBySender] = useState<Record<string, number>>({});
  // latest message preview per conversation partner
  const [latestMsgs, setLatestMsgs] = useState<Record<string, Message | null>>({});
  // sorted user list
  const [sortedUsers, setSortedUsers] = useState<any[]>([]);

  const bottomRef = useRef<HTMLDivElement>(null);
  const selectedUserRef = useRef<any>(null);

  useEffect(() => {
    selectedUserRef.current = selectedUser;
  }, [selectedUser]);

  // ── Scroll to bottom on new messages ────────────────────────
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // ── Initial unread counts ────────────────────────────────────
  useEffect(() => {
    if (!currentUser.$id) return;
    getUnreadMessageCounts(currentUser.$id).then(setUnreadBySender);
  }, [currentUser.$id]);

  // ── Load latest messages + sort users ───────────────────────
  useEffect(() => {
    if (!allUsers?.documents || !currentUser.$id) return;
    const others = allUsers.documents.filter((u: any) => u.$id !== currentUser.$id);

    (async () => {
      const previews: Record<string, Message | null> = {};
      await Promise.all(
        others.map(async (person: any) => {
          previews[person.$id] = (await getLatestMessage(currentUser.$id, person.$id)) as unknown as Message | null;
        })
      );
      setLatestMsgs(previews);

      // Sort: users with messages first (by latest), then the rest
      const withMsg = others
        .filter((u: any) => previews[u.$id])
        .sort((a: any, b: any) => {
          const ta = new Date(previews[a.$id]!.$createdAt).getTime();
          const tb = new Date(previews[b.$id]!.$createdAt).getTime();
          return tb - ta;
        });
      const withoutMsg = others.filter((u: any) => !previews[u.$id]);
      setSortedUsers([...withMsg, ...withoutMsg]);
    })();
  }, [allUsers, currentUser.$id]);

  // ── Realtime: global message listener ───────────────────────
  useEffect(() => {
    if (!currentUser.$id) return;

    const channel = `databases.${appwriteConfig.databaseId}.collections.${appwriteConfig.messagesCollectionId}.documents`;

    const unsub = client.subscribe(channel, (response: any) => {
      const event = response.events?.[0] ?? "";
      const doc = response.payload as Message;

      const isForMe = doc.receiverId === currentUser.$id;
      const isFromMe = doc.senderId === currentUser.$id;
      if (!isForMe && !isFromMe) return;

      const partnerId = isForMe ? doc.senderId : doc.receiverId;

      if (event.includes("create")) {
        // Update latest message preview & re-sort
        setLatestMsgs((prev) => ({ ...prev, [partnerId]: doc }));
        setSortedUsers((prev) => {
          const idx = prev.findIndex((u) => u.$id === partnerId);
          if (idx === -1) return prev;
          const user = prev[idx];
          const rest = prev.filter((_, i) => i !== idx);
          return [user, ...rest];
        });

        // If this message is for me and I'm NOT in that conversation → add unread
        if (isForMe && selectedUserRef.current?.$id !== partnerId) {
          setUnreadBySender((prev) => ({
            ...prev,
            [partnerId]: (prev[partnerId] ?? 0) + 1,
          }));
        }

        // If I'm currently viewing this conversation → append to messages
        if (selectedUserRef.current?.$id === partnerId) {
          setMessages((prev) => {
            if (prev.find((m) => m.$id === doc.$id)) return prev;
            return [...prev, doc];
          });
          // Mark as read immediately
          if (isForMe) {
            markMessagesRead(doc.senderId, currentUser.$id);
          }
        }
      }
    });

    return () => unsub();
  }, [currentUser.$id]);

  // ── Open conversation ────────────────────────────────────────
  const openConversation = useCallback(async (person: any) => {
    setSelectedUser(person);
    setIsLoadingMessages(true);
    const msgs = await fetchMessages(currentUser.$id, person.$id);
    setMessages(msgs);
    setIsLoadingMessages(false);

    // Mark their messages as read
    await markMessagesRead(person.$id, currentUser.$id);
    setUnreadBySender((prev) => {
      const next = { ...prev };
      delete next[person.$id];
      return next;
    });
  }, [currentUser.$id]);

  // ── Send message ─────────────────────────────────────────────
  const handleSend = async () => {
    if (!inputText.trim() || !selectedUser || isSending) return;
    const text = inputText.trim();
    setInputText("");
    setIsSending(true);

    const optimistic: Message = {
      $id: "temp-" + Date.now(),
      senderId: currentUser.$id,
      receiverId: selectedUser.$id,
      text,
      $createdAt: new Date().toISOString(),
      read: false,
    };
    setMessages((prev) => [...prev, optimistic]);

    try {
      await sendMessage(currentUser.$id, selectedUser.$id, text);
      const msgs = await fetchMessages(currentUser.$id, selectedUser.$id);
      setMessages(msgs);

      // Update latest preview
      const latest = msgs[msgs.length - 1] ?? null;
      setLatestMsgs((prev) => ({ ...prev, [selectedUser.$id]: latest }));
      setSortedUsers((prev) => {
        const idx = prev.findIndex((u) => u.$id === selectedUser.$id);
        if (idx === -1) return prev;
        const user = prev[idx];
        return [user, ...prev.filter((_, i) => i !== idx)];
      });
    } finally {
      setIsSending(false);
    }
  };

  // ── Total unread for sidebar (exported via hook — see useUnreadChats) ──
  const totalUnread = Object.values(unreadBySender).reduce((a, b) => a + b, 0);

  if (isLoading) {
    return (
      <div style={{ background: T.bg }} className="flex-center w-full h-full">
        <Loader />
      </div>
    );
  }

  return (
    <div
      className="flex flex-1 h-full w-full max-w-5xl mx-auto overflow-hidden rounded-2xl shadow-md"
      style={{ background: T.bg, transition: "background 0.3s" }}
    >
      {/* ── LEFT PANEL ── */}
      <div
        className="w-72 flex flex-col"
        style={{ background: T.card, backdropFilter: "blur(10px)", borderRight: `1px solid ${T.border}` }}
      >
        {/* Header */}
        <div style={{ padding: 20, borderBottom: `1px solid ${T.border}`, display: "flex", alignItems: "center", gap: 8 }}>
          <h2 style={{ color: T.primary, fontWeight: 800, flex: 1 }}>Messages</h2>
          {totalUnread > 0 && (
            <span style={{
              background: "#e35d5d", color: "#fff", fontSize: "0.65rem", fontWeight: 800,
              borderRadius: 999, minWidth: 20, height: 20, display: "flex",
              alignItems: "center", justifyContent: "center", padding: "0 6px",
            }}>
              {totalUnread > 99 ? "99+" : totalUnread}
            </span>
          )}
        </div>

        {/* User list */}
        <ul className="flex flex-col overflow-y-auto flex-1">
          {sortedUsers.map((person: any) => {
            const isSelected = selectedUser?.$id === person.$id;
            const unread = unreadBySender[person.$id] ?? 0;
            const latest = latestMsgs[person.$id];

            return (
              <li
                key={person.$id}
                onClick={() => openConversation(person)}
                className="transition-all duration-200"
                style={{
                  display: "flex", gap: 12, padding: "10px 12px", cursor: "pointer",
                  alignItems: "center",
                  background: isSelected ? T.soft : "transparent",
                  borderLeft: isSelected ? `3px solid ${T.primary}` : "3px solid transparent",
                }}
              >
                {/* Avatar */}
                <div style={{ position: "relative", flexShrink: 0 }}>
                  <img
                    src={person.imageUrl || "/assets/icons/profile-placeholder.svg"}
                    className="w-11 h-11 rounded-full object-cover"
                    style={{ border: `2px solid ${unread > 0 ? T.primary : T.border}` }}
                  />
                  {unread > 0 && (
                    <span style={{
                      position: "absolute", top: -2, right: -2,
                      background: "#e35d5d", color: "#fff",
                      fontSize: "0.55rem", fontWeight: 800,
                      borderRadius: 999, minWidth: 16, height: 16,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      padding: "0 3px", boxShadow: "0 0 0 2px white",
                    }}>
                      {unread > 9 ? "9+" : unread}
                    </span>
                  )}
                </div>

                {/* Name + preview */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{
                    color: T.text, fontWeight: unread > 0 ? 700 : 600,
                    margin: 0, fontSize: "0.875rem",
                  }}>
                    {person.name}
                  </p>
                  {latest ? (
                    <p style={{
                      color: unread > 0 ? T.primary : T.muted,
                      fontSize: "0.72rem", margin: 0,
                      fontWeight: unread > 0 ? 600 : 400,
                      overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                    }}>
                      {latest.senderId === currentUser.$id ? "You: " : ""}{latest.text}
                    </p>
                  ) : (
                    <p style={{ color: T.muted, fontSize: "0.72rem", margin: 0 }}>
                      @{person.username}
                    </p>
                  )}
                </div>

                {/* Time */}
                {latest && (
                  <span style={{ color: T.muted, fontSize: "0.65rem", flexShrink: 0 }}>
                    {new Date(latest.$createdAt).toLocaleTimeString(undefined, {
                      hour: "2-digit", minute: "2-digit",
                    })}
                  </span>
                )}
              </li>
            );
          })}
        </ul>
      </div>

      {/* ── CHAT AREA ── */}
      <div className="flex flex-col flex-1" style={{ background: T.bg }}>
        {!selectedUser ? (
          <div className="flex-center flex-col gap-4 h-full">
            <p style={{ fontSize: 42 }}>💬</p>
            <p style={{ color: T.text }}>Select a conversation</p>
            {totalUnread > 0 && (
              <p style={{ color: T.muted, fontSize: "0.8rem" }}>
                You have {totalUnread} unread message{totalUnread > 1 ? "s" : ""}
              </p>
            )}
          </div>
        ) : (
          <>
            {/* Header */}
            <div style={{
              display: "flex", alignItems: "center", gap: 12, padding: 16,
              background: T.card, backdropFilter: "blur(10px)",
              borderBottom: `1px solid ${T.border}`,
            }}>
              <img
                src={selectedUser.imageUrl || "/assets/icons/profile-placeholder.svg"}
                className="w-10 h-10 rounded-full object-cover"
                style={{ border: `2px solid ${T.border}` }}
              />
              <div>
                <p style={{ color: T.text, fontWeight: 700 }}>{selectedUser.name}</p>
                <p style={{ color: T.muted, fontSize: 12 }}>@{selectedUser.username}</p>
              </div>
            </div>

            {/* Messages */}
            <div style={{ flex: 1, padding: 16, overflowY: "auto" }}>
              {isLoadingMessages ? (
                <div className="flex-center h-full"><Loader /></div>
              ) : (
                messages.map((msg) => {
                  const isMe = msg.senderId === currentUser.$id;
                  return (
                    <div key={msg.$id} style={{
                      display: "flex", justifyContent: isMe ? "flex-end" : "flex-start", marginBottom: 10,
                    }}>
                      <div style={{
                        background: isMe
                          ? "linear-gradient(135deg, #4f9f75, #7bbf9a)"
                          : (darkMode ? DARK.soft : "#ffffff"),
                        color: isMe ? "#fff" : T.text,
                        padding: "10px 14px", borderRadius: 18, maxWidth: 260,
                        border: !isMe ? `1px solid ${T.border}` : "none",
                        boxShadow: isMe ? "0 6px 14px rgba(79,159,117,0.25)" : "none",
                      }}>
                        {msg.text}
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={bottomRef} />
            </div>

            {/* Input */}
            <div style={{
              display: "flex", gap: 10, padding: 14,
              background: T.card, backdropFilter: "blur(10px)",
              borderTop: `1px solid ${T.border}`,
            }}>
              <input
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSend()}
                placeholder="Type a message..."
                style={{
                  flex: 1, padding: "10px 14px", borderRadius: 999,
                  border: `1px solid ${T.border}`, outline: "none",
                  background: darkMode ? DARK.soft : "#ffffff",
                  color: T.text,
                }}
              />
              <button
                onClick={handleSend}
                disabled={!inputText.trim() || isSending}
                style={{
                  background: "linear-gradient(135deg, #4f9f75, #7bbf9a)",
                  color: "#fff", borderRadius: 999, width: 42, height: 42,
                  border: "none", cursor: "pointer",
                  opacity: !inputText.trim() || isSending ? 0.5 : 1,
                }}
              >
                ➤
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Chat;