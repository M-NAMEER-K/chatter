import { useState, useEffect, useRef, useLayoutEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { personalChatAPI, sendMessageAPI, messageSeenAPI, } from "../../services/operations/chatOps";
import {removeFriendAPI} from "../../services/operations/requestOps"
import { IoIosSend } from "react-icons/io";
import { CgProfile } from "react-icons/cg";
import { socket } from "../../services/socket/socket";
import { useSelector } from "react-redux";
import { type RootState } from "../../reducer/store";
import { IoArrowBackSharp } from "react-icons/io5";
import { IoCheckmarkDoneOutline, IoCheckmarkOutline } from "react-icons/io5";
import { FaAngleDown } from "react-icons/fa6";

import { HiDotsVertical } from "react-icons/hi";


interface IUser {
  _id?: string;
  name?: string;
  profileImage?: {
    url?: string;
    publicId?: string;
  };
  lastSeen: Date;
}

const PersonelChat = () => {
  const navigate = useNavigate();
  const { chatid } = useParams();
  const loggedInUserId = useSelector((state: RootState) => state.auth.user?._id);
  const onlineUserIds = useSelector(
  (state:RootState)=>state.presence.onlineUserIds
)
  const containerRef = useRef<HTMLDivElement | null>(null);
  const bottomRef = useRef<HTMLDivElement | null>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const hasLoadedRef = useRef(false);
    
   const [isFriend,setIsFriend] = useState(true)
  const [user, setUser] = useState<IUser | null>(null);
  const [chats, setChats] = useState<any[]>([]);
  const [message, setMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [isOnline, setIsOnline] = useState(false);
  
  const [unreadCount, setUnreadCount] = useState(0);
  const [isAtBottom, setIsAtBottom] = useState(true);
  
  const [visible,setVisible]=useState<String>("hidden");
  const [showConfirm,setShowConfirm] = useState(false)
  // -------------------------
  // SOCKET PRESENCE HANDLING
  //
  
 

useEffect(()=>{

  if(!user?._id) return

  const online = onlineUserIds.includes(user._id)

  setIsOnline(online)

},[onlineUserIds,user])
  // -------------------------
  // TYPING HANDLING
  // -------------------------
  useEffect(() => {
    const handleStartTyping = ({ chatId }: any) => {
      if (chatId === chatid) setIsTyping(true);
    };

    const handleStopTyping = ({ chatId }: any) => {
      if (chatId === chatid) setIsTyping(false);
    };

    socket.on("typing", handleStartTyping);
    socket.on("stopTyping", handleStopTyping);

    return () => {
      socket.off("typing", handleStartTyping);
      socket.off("stopTyping", handleStopTyping);
    };
  }, [chatid]);

  // -------------------------
  // JOIN CHAT
  // -------------------------
  useEffect(() => {
    if (!chatid) return;
    socket.emit("joinChat", chatid);

    return () => {socket.emit("leaveChat", chatid);}
  }, [chatid]);

  // -------------------------
  // FETCH CHAT MESSAGES
  // -------------------------
  useEffect(() => {
    if (!chatid) return;

    const fetchChats = async () => {
      const result = await personalChatAPI(chatid);
      console.log(result);
      const fetchedUser = result.data.user.data;
      setUser(fetchedUser);

       setIsFriend(result.data.user.data.isFriend)

     
      if (result.data.messages) setChats(result.data.messages);
    };

    fetchChats();
  }, [chatid]);

  // -------------------------
  // SCROLL TO BOTTOM
  // -------------------------
  useLayoutEffect(() => {
    if (!hasLoadedRef.current && chats.length > 0) {
      scrollToBottom(false);
      hasLoadedRef.current = true;
    }
  }, [chats]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleScroll = () => {
      const threshold = 50;
      const atBottom =
        container.scrollHeight - container.scrollTop - container.clientHeight < threshold;

      setIsAtBottom(atBottom);
      if (atBottom) setUnreadCount(0);
    };

    container.addEventListener("scroll", handleScroll);
    return () => container.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToBottom = (smooth = true) => {
    if (!bottomRef.current) return;
    bottomRef.current.scrollIntoView({ behavior: smooth ? "smooth" : "auto" });
    setUnreadCount(0);
  };

  // -------------------------
  // SEND MESSAGE
  // -------------------------
  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
     if(!isFriend) return;
    if (!message.trim() || !chatid) return;
    
    await sendMessageAPI(chatid, message);
    setMessage("");
    scrollToBottom();
  };
 const removeFriend = async ()=>{
   if(!user?._id) return;


   await removeFriendAPI(user._id);
     setShowConfirm(false)
  setVisible("hidden")
}
   useEffect(()=>{

 const handleFriendAdded = ({userId,friendId}:any)=>{

   if(user?._id === friendId || user?._id === userId){
      setIsFriend(true)
   }

 }

 socket.on("friendAdded",handleFriendAdded)

 return ()=>{socket.off("friendAdded",handleFriendAdded)}

},[user])

  useEffect(()=>{

 const handleFriendRemoved = ({userId,friendId}:any)=>{

   if(user?._id === friendId || user?._id === userId){
      setIsFriend(false)
   }

 }

 socket.on("friendRemoved",handleFriendRemoved)

 return ()=>{socket.off("friendRemoved",handleFriendRemoved)}

},[user])

  const handleTyping = (value: string) => {
    setMessage(value);
    if (!chatid) return;

    socket.emit("typing", { chatId: chatid });

    clearTimeout((window as any).typingTimeout);
    (window as any).typingTimeout = setTimeout(() => {
      socket.emit("stopTyping", { chatId: chatid });
    }, 1200);
  };

  // -------------------------
  // NEW MESSAGE HANDLER
  // -------------------------
  const handleNewMessage = (newMessage: any) => {
  if (newMessage.chatId !== chatid) return;

  setChats(prev => {
    
    if (prev.some(msg => msg._id === newMessage._id)) {
      return prev;
    }

    const updated = [...prev, newMessage];

    const isMine = newMessage.sender === loggedInUserId;

    if (isMine || isAtBottom) {
      scrollToBottom(true);
    } else {
      setUnreadCount(prev => prev + 1);
    }

    return updated;
  });
};

  useEffect(() => {
    if (!chatid) return;
    socket.on("newMessage", handleNewMessage);
    return () => {socket.off("newMessage", handleNewMessage);}
  }, [chatid, isAtBottom, loggedInUserId]);

  // -------------------------
  // MESSAGE DELIVERY UPDATES
  // -------------------------
  useEffect(() => {
    socket.on("messageDelivered", ({ messageId }) => {
      setChats(prev =>
        prev.map(msg =>
          msg._id.toString() === messageId.toString() && !msg.delivered
            ? { ...msg, delivered: true }
            : msg
        )
      );
    });
    return () => {socket.off("messageDelivered");}
  }, []);

  useEffect(() => {
    const handleBulkDelivered = ({ messageIds }: any) => {
      setChats(prev =>
        prev.map(msg =>
          messageIds.includes(msg._id.toString()) && !msg.delivered
            ? { ...msg, delivered: true }
            : msg
        )
      );
    };
    socket.on("bulkDelivered", handleBulkDelivered);
    return () => {socket.off("bulkDelivered", handleBulkDelivered);}
  }, []);

  // -------------------------
  // MESSAGE SEEN HANDLING
  // -------------------------
  const markMessageSeen = async (messageId: string) => {
    if (!chatid) return;
    await messageSeenAPI(chatid, messageId);
    setUnreadCount(prev => Math.max(prev - 1, 0));
  };

  useEffect(() => {
    const handleChatSeen = ({ chatId: seenChatId, seenMessageIds }: any) => {
      if (seenChatId !== chatid) return;

      setChats(prev =>
        prev.map(msg =>
          seenMessageIds.includes(msg._id)
            ? { ...msg, seen: true }
            : msg
        )
      );
    };
    socket.on("chatSeen", handleChatSeen);
    return () => {socket.off("chatSeen", handleChatSeen);}
  }, [chatid]);

  useEffect(() => {
    observerRef.current = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const messageId = entry.target.getAttribute("data-id");
            if (messageId) markMessageSeen(messageId);
          }
        });
      },
      { threshold: 0.6 }
    );
    return () => observerRef.current?.disconnect();
  }, []);

  // -------------------------
  // BACK BUTTON
  // -------------------------
  const backButton = () => navigate("/chat");
   
  
  // -------------------------
  // RENDER
  // -------------------------
  return (
    <div className="h-screen w-screen bg-gray-700 flex flex-col relative">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-gray-300   p-2 font-semibold flex items-center">
        <div className="mx-2" onClick={backButton}>
          <IoArrowBackSharp size={20} />
        </div>

        <div className="mr-4   ">
          {user?.profileImage?.url ? (
            <img
              src={user.profileImage.url}
              alt={user?.name || "User"}
              className="w-20 h-15 md:w-10 md:h-10 rounded-full object-cover"
            />
          ) : (
            <div className="w-20 h-15 md:w-10 md:h-10 rounded-full object-cover bg-gray-700 flex items-center justify-center">
              <CgProfile className="text-white" size={40} />
            </div>
          )}
        </div>

        <div className="w-full ">
          <div className="font-medium text-xl">{user?.name}</div>
          <div className="text-sm h-5">
{isTyping ? (
  <span className="text-green-600">Typing...</span>
) : isOnline ? (
  <span className="text-green-600">Online</span>
) : (
  <span className="text-red-600">Offline</span>
)}
          </div>
        </div>
           <div   onClick={()=>{ visible==="hidden"?setVisible("visible"):setVisible("hidden")}}><HiDotsVertical size={30}/>
              {isFriend && <div className={`absolute right-[1%] bg-white hover:bg-gray-200 p-2 rounded-lg ${visible}`}
                onClick={()=>setShowConfirm(true)} >
                Remove Friend
                </div> } 
                </div>
      </div>

      {/* Chat Messages */}
      <div className="w-full flex flex-col flex-1 p-1 text-white overflow-hidden">
        <div
          ref={containerRef}
          className="flex-1 w-full overflow-y-auto scrollbar scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-700"
        >
          {chats.length === 0 ? (
            <p className="text-center mt-5">
              You have not started any chat with {user?.name}
            </p>
          ) : (
            chats.map((chat, index) => {
              const currentDate = new Date(chat.createdAt).toDateString();
              const prevDate =
                index > 0
                  ? new Date(chats[index - 1].createdAt).toDateString()
                  : null;
              const showDateDivider = currentDate !== prevDate;

              return (
                <div key={chat._id}>
                  {showDateDivider && (
                    <div className="text-center my-3">
                      <span className="bg-blue-600 text-white text-xs p-2 rounded-full">
                        {new Date(chat.createdAt).toLocaleDateString("en-GB")}
                      </span>
                    </div>
                  )}

                  <div
                    data-id={chat._id}
                    ref={el => {
                      if (
                        el &&
                        observerRef.current &&
                        chat.sender !== loggedInUserId &&
                        !chat.seen
                      )
                        observerRef.current.observe(el);
                    }}
                    className={`p-2 px-3 mx-2 rounded-[25px] w-fit max-w-[60%] break-words ${
                      chat.sender === loggedInUserId
                        ? "bg-green-400 text-white ml-auto my-3"
                        : "bg-white text-black mr-auto my-3"
                    }`}
                  >
                    {chat.text}

                    <div className="flex text-sm items-center gap-x-1 text-black justify-end">
                      <div>
                        {new Date(chat.createdAt).toLocaleTimeString("en-IN", {
                          hour: "2-digit",
                          minute: "2-digit",
                          hour12: true,
                        })}
                      </div>

                      {chat.sender === loggedInUserId && (
                        <>
                          {!chat.delivered && (
                            <IoCheckmarkOutline size={18} className="text-gray-400" />
                          )}

                          {chat.delivered && !chat.seen && (
                            <IoCheckmarkDoneOutline size={18} className="text-gray-400" />
                          )}

                          {chat.delivered && chat.seen && (
                            <IoCheckmarkDoneOutline size={18} className="text-blue-500" />
                          )}
                        </>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}

          {unreadCount > 0 && (
            <div className="fixed bottom-20 right-5 z-50">
              <button
                onClick={() => scrollToBottom(true)}
                className="bg-green-500 text-white p-2 rounded-full shadow-lg hover:bg-green-600 flex items-center gap-x-1"
              >
                <FaAngleDown />
                <div className="text-sm">{unreadCount}</div>
              </button>
            </div>
          )}
          <div ref={bottomRef}></div>
        </div>

        {/* Input */}
        {isFriend && <div className="w-full sticky top-0 z-50 py-1">
          <form
            className="w-[95%] h-12 flex gap-x-2 rounded-full mx-auto bg-white"
            onSubmit={handleSend}
          >
            <input
              type="text"
              placeholder="Type your message here"
              value={message}
              onChange={e => handleTyping(e.target.value)}
              className="w-full text-black outline-0 p-2 rounded-full"
            />
            {message.trim() !== "" && (
              <button
                type="submit"
                className="rounded-full border hover:text-yellow-300 text-black p-2 flex justify-center items-center"
              >
                <IoIosSend size={30} />
              </button>
            )}
          </form>
        </div>}
        
      </div>
      {showConfirm && (
  <div className="absolute bg-white w-[20%] left-[40%] top-[50%] flex items-center rounded-lg justify-center">
    
    <div className="bg-white p-5 rounded-lg w-[280px] text-center">
      
      <div className="text-lg font-semibold mb-4">
        Remove this friend?
      </div>

      <div className="flex justify-center gap-4">
        
        <button
          className="bg-gray-300 px-4 py-2 rounded hover:bg-gray-400"
          onClick={()=>setShowConfirm(false)}
        >
          No
        </button>

        <button
          className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
          onClick={removeFriend}
        >
          Yes
        </button>

      </div>

    </div>

  </div>
)}
    </div>
  );
};

export default PersonelChat;
