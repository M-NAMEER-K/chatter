import { useState } from "react";
import ChatsTab from "./ChatsTab";
import FriendsTab from "./FriendsTab";

const Chat = () => {
  const [activeTab, setActiveTab] = useState<"chats" | "friends">("chats");

  return (
    <div className="h-screen flex flex-col text-white bg-gray-800">

      {/* Tabs */}
      <div className=" w-full flex border-b border-gray-600">
        <button
          onClick={() => setActiveTab("chats")}
          className={`w-[50%] p-2 font-semibold 
            ${
              activeTab === "chats"
                ? "bg-blue-500 text-white"
                : "bg-gray-700 text-gray-300 hover:bg-gray-600"
            }
          `}
        >
          Chats
        </button>

        <button
          onClick={() => setActiveTab("friends")}
          className={`w-[50%] p-2 font-semibold 
            ${
              activeTab === "friends"
                ? "bg-blue-500 text-white"
                : "bg-gray-700 text-gray-300 hover:bg-gray-600"
            }
          `}
        >
          Friends
        </button>
      </div>

      {/* Content */}
   <div className="flex-1 overflow-y-auto">

  <div style={{ display: activeTab === "chats" ? "block" : "none" }}>
    <ChatsTab />
  </div>

  <div style={{ display: activeTab === "friends" ? "block" : "none" }}>
    <FriendsTab />
  </div>

</div>
    </div>
  );
};

export default Chat;
