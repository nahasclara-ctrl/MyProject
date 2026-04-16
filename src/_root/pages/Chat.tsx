import { useState, useEffect, useRef } from "react";
import { useGetUsers } from "@/lib/react-query/queriesAndMutations";
import { useUserContext } from "@/context/AuthContext";
import Loader from "@/components/shared/Loader";
import { Link } from "react-router-dom";
import { databases, appwriteConfig, ID } from "@/lib/appwrite/config";
import { Query } from "appwrite";

/* ───────────────────────
   BONLDEY GREEN THEME 🌿
─────────────────────── */
const T = {
  bg: "#f6fbf8",
  card: "#ffffffcc",
  soft: "#eaf5ef",
  border: "#d6ebe0",
  primary: "#4f9f75",
  primarySoft: "#7bbf9a",
  text: "#2f6e4f",
  muted: "#7bbf9a",
};

type Message = {
  $id: string;
  senderId: string;
  receiverId: string;
  text: string;
  $createdAt: string;
};

async function fetchMessages(userId1: string, userId2: string): Promise<Message[]> {
  const res = await databases.listDocuments(
    appwriteConfig.databaseId,
    appwriteConfig.messagesCollectionId,
    [
      Query.or([
        Query.and([
          Query.equal("senderId", userId1),
          Query.equal("receiverId", userId2),
        ]),
        Query.and([
          Query.equal("senderId", userId2),
          Query.equal("receiverId", userId1),
        ]),
      ]),
      Query.orderAsc("$createdAt"),
      Query.limit(100),
    ]
  );
  return res.documents as unknown as Message[];
}

async function sendMessage(senderId: string, receiverId: string, text: string) {
  return await databases.createDocument(
    appwriteConfig.databaseId,
    appwriteConfig.messagesCollectionId,
    ID.unique(),
    { senderId, receiverId, text }
  );
}

const Chat = () => {
  const { user: currentUser } = useUserContext();
  const { data: allUsers, isLoading } = useGetUsers();

  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);

  const bottomRef = useRef<HTMLDivElement>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (!selectedUser) return;

    const load = async () => {
      setIsLoadingMessages(true);
      const msgs = await fetchMessages(currentUser.$id, selectedUser.$id);
      setMessages(msgs);
      setIsLoadingMessages(false);
    };

    load();

    pollRef.current = setInterval(async () => {
      const msgs = await fetchMessages(currentUser.$id, selectedUser.$id);
      setMessages(msgs);
    }, 3000);

    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, [selectedUser, currentUser.$id]);

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
    };

    setMessages((prev) => [...prev, optimistic]);

    try {
      await sendMessage(currentUser.$id, selectedUser.$id, text);
      const msgs = await fetchMessages(currentUser.$id, selectedUser.$id);
      setMessages(msgs);
    } finally {
      setIsSending(false);
    }
  };

  if (isLoading) {
    return (
      <div style={{ background: T.bg }} className="flex-center w-full h-full">
        <Loader />
      </div>
    );
  }

  const otherUsers =
    allUsers?.documents?.filter((u: any) => u.$id !== currentUser.$id) ?? [];

  return (
    <div
      className="flex flex-1 h-full w-full max-w-5xl mx-auto overflow-hidden rounded-2xl shadow-md"
      style={{ background: T.bg }}
    >
      {/* LEFT SIDEBAR */}
      <div
        className="w-72 flex flex-col"
        style={{
          background: T.card,
          backdropFilter: "blur(10px)",
          borderRight: `1px solid ${T.border}`,
        }}
      >
        <div style={{ padding: 20, borderBottom: `1px solid ${T.border}` }}>
          <h2 style={{ color: T.primary, fontWeight: 800 }}>Messages</h2>
        </div>

        <ul className="flex flex-col overflow-y-auto flex-1">
          {otherUsers.map((person: any) => {
            const isSelected = selectedUser?.$id === person.$id;

            return (
              <li
                key={person.$id}
                onClick={() => setSelectedUser(person)}
                className="transition-all duration-200"
                style={{
                  display: "flex",
                  gap: 12,
                  padding: 12,
                  cursor: "pointer",
                  background: isSelected ? T.soft : "transparent",
                  borderLeft: isSelected
                    ? `3px solid ${T.primary}`
                    : "3px solid transparent",
                }}
              >
                <img
                  src={person.imageUrl || "/assets/icons/profile-placeholder.svg"}
                  className="w-11 h-11 rounded-full object-cover"
                  style={{
                    border: "2px solid #b7dcc8",
                  }}
                />

                <div>
                  <p style={{ color: T.text, fontWeight: 600 }}>
                    {person.name}
                  </p>
                  <p style={{ color: T.muted, fontSize: 12 }}>
                    @{person.username}
                  </p>
                </div>
              </li>
            );
          })}
        </ul>
      </div>

      {/* CHAT AREA */}
      <div className="flex flex-col flex-1" style={{ background: T.bg }}>
        {!selectedUser ? (
          <div className="flex-center flex-col gap-4 h-full">
            <p style={{ fontSize: 42 }}>💬</p>
            <p style={{ color: T.text }}>Select a conversation</p>
          </div>
        ) : (
          <>
            {/* HEADER */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                padding: 16,
                background: T.card,
                backdropFilter: "blur(10px)",
                borderBottom: `1px solid ${T.border}`,
              }}
            >
              <img
                src={selectedUser.imageUrl}
                className="w-10 h-10 rounded-full object-cover"
                style={{ border: "2px solid #b7dcc8" }}
              />
              <div>
                <p style={{ color: T.text, fontWeight: 700 }}>
                  {selectedUser.name}
                </p>
                <p style={{ color: T.muted, fontSize: 12 }}>
                  @{selectedUser.username}
                </p>
              </div>
            </div>

            {/* MESSAGES */}
            <div style={{ flex: 1, padding: 16, overflowY: "auto" }}>
              {messages.map((msg) => {
                const isMe = msg.senderId === currentUser.$id;

                return (
                  <div
                    key={msg.$id}
                    style={{
                      display: "flex",
                      justifyContent: isMe ? "flex-end" : "flex-start",
                      marginBottom: 10,
                    }}
                  >
                    <div
                      style={{
                        background: isMe
                          ? "linear-gradient(135deg, #4f9f75, #7bbf9a)"
                          : "#ffffff",
                        color: isMe ? "#fff" : T.text,
                        padding: "10px 14px",
                        borderRadius: 18,
                        maxWidth: 260,
                        border: !isMe ? `1px solid ${T.border}` : "none",
                        boxShadow: isMe
                          ? "0 6px 14px rgba(79,159,117,0.25)"
                          : "none",
                      }}
                    >
                      {msg.text}
                    </div>
                  </div>
                );
              })}
              <div ref={bottomRef} />
            </div>

            {/* INPUT */}
            <div
              style={{
                display: "flex",
                gap: 10,
                padding: 14,
                background: T.card,
                backdropFilter: "blur(10px)",
                borderTop: `1px solid ${T.border}`,
              }}
            >
              <input
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSend()}
                placeholder="Type a message..."
                style={{
                  flex: 1,
                  padding: "10px 14px",
                  borderRadius: 999,
                  border: `1px solid ${T.border}`,
                  outline: "none",
                  background: "#ffffff",
                }}
              />

              <button
                onClick={handleSend}
                disabled={!inputText.trim()}
                style={{
                  background: "linear-gradient(135deg, #4f9f75, #7bbf9a)",
                  color: "#fff",
                  borderRadius: 999,
                  width: 42,
                  height: 42,
                  border: "none",
                  cursor: "pointer",
                  opacity: !inputText.trim() ? 0.5 : 1,
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