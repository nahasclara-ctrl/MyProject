import { useState } from "react";
import { useGetUsers } from "@/lib/react-query/queriesAndMutations";
import { useUserContext } from "@/context/AuthContext";
import Loader from "@/components/shared/Loader";
import { Link } from "react-router-dom";

// NOTE: This is a UI-only chat page.
// To make messages persist, add a "messages" collection in Appwrite
// with fields: senderId, receiverId, text, createdAt

type Message = {
  senderId: string;
  text: string;
  createdAt: string;
};

const Chat = () => {
  const { user: currentUser } = useUserContext();
  const { data: allUsers, isLoading } = useGetUsers();
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [messages, setMessages] = useState<Record<string, Message[]>>({});
  const [inputText, setInputText] = useState("");

  if (isLoading) {
    return (
      <div className="flex-center w-full h-full">
        <Loader />
      </div>
    );
  }

  // Filter out self
  const otherUsers =
    allUsers?.documents?.filter((u: any) => u.$id !== currentUser.$id) ?? [];

  const conversation = selectedUser ? messages[selectedUser.$id] ?? [] : [];

  const handleSend = () => {
    if (!inputText.trim() || !selectedUser) return;

    const newMsg: Message = {
      senderId: currentUser.$id,
      text: inputText.trim(),
      createdAt: new Date().toISOString(),
    };

    setMessages((prev) => ({
      ...prev,
      [selectedUser.$id]: [...(prev[selectedUser.$id] ?? []), newMsg],
    }));
    setInputText("");
  };

  return (
    <div className="flex flex-1 h-full w-full max-w-5xl mx-auto overflow-hidden">
      {/* Sidebar - User List */}
      <div className="w-72 flex-shrink-0 border-r border-dark-4 flex flex-col bg-dark-2">
        <div className="px-5 py-5 border-b border-dark-4">
          <h2 className="h3-bold">Messages</h2>
        </div>

        <ul className="flex flex-col overflow-y-auto flex-1">
          {otherUsers.length === 0 ? (
            <p className="text-light-4 text-sm text-center p-6">
              No users to message yet.
            </p>
          ) : (
            otherUsers.map((person: any) => {
              const isSelected = selectedUser?.$id === person.$id;
              const convo = messages[person.$id] ?? [];
              const lastMsg = convo[convo.length - 1];

              return (
                <li
                  key={person.$id}
                  onClick={() => setSelectedUser(person)}
                  className={`flex items-center gap-3 px-4 py-3 cursor-pointer transition-colors hover:bg-dark-3 ${
                    isSelected ? "bg-dark-3" : ""
                  }`}
                >
                  <img
                    src={person.imageUrl || "/assets/icons/profile-placeholder.svg"}
                    alt={person.name}
                    className="w-11 h-11 rounded-full object-cover flex-shrink-0"
                  />
                  <div className="flex flex-col min-w-0 flex-1">
                    <p className="text-light-1 small-semibold truncate">{person.name}</p>
                    <p className="text-light-4 tiny-medium truncate">
                      {lastMsg ? lastMsg.text : `@${person.username}`}
                    </p>
                  </div>
                </li>
              );
            })
          )}
        </ul>
      </div>

      {/* Chat Area */}
      <div className="flex flex-col flex-1 bg-dark-1">
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
            {/* Chat Header */}
            <div className="flex items-center gap-3 px-6 py-4 border-b border-dark-4 bg-dark-2">
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
              {conversation.length === 0 ? (
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
                conversation.map((msg, i) => {
                  const isMe = msg.senderId === currentUser.$id;
                  return (
                    <div
                      key={i}
                      className={`flex ${isMe ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className={`max-w-xs lg:max-w-md px-4 py-2 rounded-2xl text-sm ${
                          isMe
                            ? "bg-primary-500 text-white rounded-br-sm"
                            : "bg-dark-3 text-light-1 rounded-bl-sm"
                        }`}
                      >
                        {msg.text}
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Input */}
            <div className="flex items-center gap-3 px-6 py-4 border-t border-dark-4 bg-dark-2">
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
                disabled={!inputText.trim()}
                className="bg-primary-500 hover:bg-primary-600 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-full w-10 h-10 flex-center transition-colors flex-shrink-0"
              >
                <img
                  src="/assets/icons/send.svg"
                  alt="send"
                  width={18}
                  height={18}
                  className="invert"
                  onError={(e) => {
                    (e.target as HTMLImageElement).outerHTML = "➤";
                  }}
                />
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Chat;