import { useEffect, useState } from "react";
import { getAllChatsAPI } from "../../services/operations/chatOps";
import { CgProfile } from "react-icons/cg";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { type RootState } from "../../reducer/store";
import { formatTime } from "../Utils/formatTime";
import { socket } from "../../services/socket/socket";

const ChatsTab = () => {

  const [chats, setChats] = useState<any[]>([]);
  const navigate = useNavigate();

  const searchQuery = useSelector((state: RootState) => state.search.query);
 
   
   
  // Fetch chats initially
  useEffect(() => {

    const fetchChats = async () => {

      try {
        const res = await getAllChatsAPI();
        console.log(res);
        setChats(res.data.data);
      }
      catch (err) {
        console.log(err);
      }

    };

    fetchChats();

  }, []);
useEffect(() => {

 const handleNewMessage = (message: any) => {
  setChats(prev =>
    prev.map(chat => {
      if (chat.chat._id !== message.chatId) return chat;

      return {
        ...chat,
        chat: {
          ...chat.chat,
          latestMessage: {
            text: message.text,
            sender: message.sender,
            createdAt: message.createdAt
          },
          updatedAt: message.createdAt,
          unseenCount: chat.chat.unseenCount + 1
        }
      };
    })
  );
};

  socket.on("chatListUpdate", handleNewMessage);
  return () => {socket.off("chatListUpdate", handleNewMessage);}

}, []);
  // Listen chatSeen event
  useEffect(() => {

    const handleChatSeen = ({ chatId }: any) => {

      setChats(prev =>
        prev.map(chat =>
          chat.chat._id === chatId
            ? {
                ...chat,
                chat: {
                  ...chat.chat,
                  unseenCount: 0
                }
              }
            : chat
        )
      );

    };

    socket.on("chatSeen", handleChatSeen);

    return () => {socket.off("chatSeen", handleChatSeen);}

  }, []);



  const filteredChats = chats
    .filter(chat =>
      chat.user?.name
        ?.toLowerCase()
        .includes(searchQuery.toLowerCase())
    )
    .sort(
      (a, b) =>
        new Date(b.chat.updatedAt).getTime() -
        new Date(a.chat.updatedAt).getTime()
    );



  const handleClick = (chatId: string) => {
    navigate(`/chat/${chatId}`);
  };



  return (

    <div className="h-full w-screen overflow-y-auto">

      {filteredChats.length === 0 ? (

        <p className="text-center mt-5">No chats yet</p>

      ) : (

        filteredChats.map(chat => {

          const unseen = chat.chat.unseenCount;
          const lastMessage = chat.chat.latestMessage;

          return (

            <div
              key={chat.chat._id}
              onClick={() => handleClick(chat.chat._id)}
              className="border border-x-0 border-t-0 p-3 hover:bg-gray-200 cursor-pointer flex items-center"
            >

              {/* Profile */}
              <div className="px-3">

                {chat.user?.profileImage?.url ? (

                  <img
                    src={chat.user?.profileImage.url}
                    className="w-[45px] h-[45px] rounded-full object-cover"
                  />

                ) : (

                  <CgProfile size={45} />

                )}

              </div>


              {/* Chat Info */}
              <div className="flex flex-col w-full">

                <div className="font-semibold">
                  {chat.user?.name}
                </div>


                <div className="flex justify-between items-center text-sm">

                  {/* CASE 1: MORE THAN 1 UNREAD */}
                  {unseen > 1 ? (

                    <div className="text-yellow-500 font-semibold">
                      {unseen} new messages
                    </div>

                  )

                  /* CASE 2: SINGLE UNREAD */
                  : unseen === 1 ? (

                    <>
                      <div className="truncate font-medium text-yellow-500 max-w-[60%]">
  {lastMessage?.text}
</div>

                      
                    </>

                  )

                  /* CASE 3: NO UNREAD */
                  : (

                    <>
                      <div className="truncate font-medium text-gray-300 max-w-[60%]">
  {lastMessage?.text}
</div>

                      <div className="text-xs text-yellow-500">
                        {lastMessage
                          ? formatTime(chat.chat.updatedAt)
                          : ""}
                      </div>
                    </>

                  )}

                </div>

              </div>


              {/* Badge */}
              {unseen > 0 && (

                <div className="ml-2 bg-yellow-500 text-white text-xs px-2 py-1 rounded-full">
                  {unseen}
                </div>

              )}

            </div>

          );

        })

      )}

    </div>

  );

};

export default ChatsTab;
