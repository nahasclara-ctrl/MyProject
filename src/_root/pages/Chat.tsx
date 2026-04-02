import { useState, useEffect, useRef } from "react";
import { useGetUsers } from "@/lib/react-query/queriesAndMutations";
import { useUserContext } from "@/context/AuthContext";
import Loader from "@/components/shared/Loader";
import { Link } from "react-router-dom";
import { databases, appwriteConfig, ID } from "@/lib/appwrite/config";
import { Query } from "appwrite";

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
    appwriteConfig.messagesCollectionID,
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
    appwriteConfig.messagesCollectionID,
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
      try {
        const msgs = await fetchMessages(currentUser.$id, selectedUser.$id);
        setMessages(msgs);
      } catch (e) {
        console.error("Failed to load messages:", e);
      } finally {
        setIsLoadingMessages(false);
      }
    };

    load();

    // Poll every 3 seconds for new messages
    pollRef.current = setInterval(async () => {
      try {
        const msgs = await fetchMessages(currentUser.$id, selectedUser.$id);
        setMessages(msgs);
      } catch (e) {
        console.error("Polling failed:", e);
      }
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

    // Optimistic update
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
    } catch (e) {
      console.error("Failed to send message:", e);
      setMessages((prev) => prev.filter((m) => m.$id !== optimistic.$id));
      setInputText(text);
    } finally {
      setIsSending(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex-center w-full h-full">
        <Loader />
      </div>
    );
  }

  const otherUsers =
    allUsers?.documents?.filter((u: any) => u.$id !== currentUser.$id) ?? [];

  return (
    <div className="flex flex-1 h-full w-full max-w-5xl mx-auto overflow-hidden">
      {/* Sidebar */}
      <div className="w-72 flex-shrink-0 border-r border-dark-4 flex flex-col bg-dark-2">
        <div className="px-5 py-5 border-b border-dark-4">
          <h2 className="h3-bold">Messages</h2>
        </div>
        <ul className="flex flex-col overflow-y-auto flex-1">
          {otherUsers.length === 0 ? (
            <p className="text-light-4 text-sm text-center p-6">No users yet.</p>
          ) : (
            otherUsers.map((person: any) => {
              const isSelected = selectedUser?.$id === person.$id;
              return (
                <li
                  key={person.$id}
                  onClick={() => setSelectedUser(person)}
                  className={`flex items-center gap-3 px-4 py-3 cursor-pointer transition-colors hover:bg-dark-3 ${
                    isSelected ? "bg-dark-3 border-l-2 border-primary-500" : ""
                  }`}
                >
                  <img
                    src={person.imageUrl || "/assets/icons/profile-placeholder.svg"}
                    alt={person.name}
                    className="w-11 h-11 rounded-full object-cover flex-shrink-0"
                  />
                  <div className="flex flex-col min-w-0 flex-1">
                    <p className="text-light-1 small-semibold truncate">{person.name}</p>
                    <p className="text-light-4 tiny-medium truncate">@{person.username}</p>
                  </div>
                </li>
              );
            })
          )}
        </ul>
      </div>

      {/* Chat area */}
      <div className="flex flex-col flex-1 bg-dark-1 overflow-hidden">
        {!selectedUser ? (
          <div className="flex-center flex-col gap-4 h-full">
            <p className="text-5xl">💬</p>
            <p className="text-light-3 body-medium">Select a conversation</p>
            <p className="text-light-4 small-regular">
              Choose someone from the list to start chatting
            </p>
          </div>
        ) : (
          <>
            {/* Header */}
            <div className="flex items-center gap-3 px-6 py-4 border-b border-dark-4 bg-dark-2 flex-shrink-0">
              <Link to={`/profile/${selectedUser.$id}`}>
                <img
                  src={selectedUser.imageUrl || "/assets/icons/profile-placeholder.svg"}
                  alt={selectedUser.name}
                  className="w-10 h-10 rounded-full object-cover"
                />
              </Link>
              <div>
                <p className="text-light-1 base-semibold">{selectedUser.name}</p>
                <p className="text-light-4 tiny-medium">@{selectedUser.username}</p>
              </div>
            </div>

            {/* Messages */}
            <div className="flex flex-col flex-1 overflow-y-auto px-6 py-4 gap-3">
              {isLoadingMessages ? (
                <div className="flex-center h-full">
                  <Loader />
                </div>
              ) : messages.length === 0 ? (
                <div className="flex-center flex-col gap-3 h-full">
                  <img
                    src={selectedUser.imageUrl || "/assets/icons/profile-placeholder.svg"}
                    alt={selectedUser.name}
                    className="w-16 h-16 rounded-full object-cover"
                  />
                  <p className="text-light-3 small-medium">
                    Start a conversation with {selectedUser.name}
                  </p>
                </div>
              ) : (
                messages.map((msg) => {
                  const isMe = msg.senderId === currentUser.$id;
                  return (
                    <div key={msg.$id} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
                      {!isMe && (
                        <img
                          src={selectedUser.imageUrl || "/assets/icons/profile-placeholder.svg"}
                          alt={selectedUser.name}
                          className="w-7 h-7 rounded-full object-cover mr-2 self-end flex-shrink-0"
                        />
                      )}
                      <div
                        className={`max-w-xs lg:max-w-md px-4 py-2 rounded-2xl text-sm ${
                          isMe
                            ? "bg-primary-500 text-white rounded-br-sm"
                            : "bg-dark-3 text-light-1 rounded-bl-sm"
                        }`}
                      >
                        {msg.text}
                      </div>
                      {isMe && (
                        <img
                          src={currentUser.imageUrl || "/assets/icons/profile-placeholder.svg"}
                          alt="me"
                          className="w-7 h-7 rounded-full object-cover ml-2 self-end flex-shrink-0"
                        />
                      )}
                    </div>
                  );
                })
              )}
              <div ref={bottomRef} />
            </div>

            {/* Input */}
            <div className="flex items-center gap-3 px-6 py-4 border-t border-dark-4 bg-dark-2 flex-shrink-0">
              <img
                src={currentUser.imageUrl || "/assets/icons/profile-placeholder.svg"}
                alt="me"
                className="w-8 h-8 rounded-full object-cover flex-shrink-0"
              />
              <input
                type="text"
                placeholder={`Message ${selectedUser.name}...`}
                className="flex-1 bg-dark-3 text-light-1 rounded-full px-5 py-2.5 text-sm outline-none placeholder:text-light-4 border border-dark-4 focus:border-primary-500 transition-colors"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSend()}
              />
              <button
                onClick={handleSend}
                disabled={!inputText.trim() || isSending}
                className="bg-primary-500 hover:bg-primary-600 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-full w-10 h-10 flex items-center justify-center transition-colors flex-shrink-0 text-lg"
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