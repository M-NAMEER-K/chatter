import { useEffect, useState } from "react";
import { getMyFriendsAPI } from "../../services/operations/authOps";
import { createNewChatAPI } from "../../services/operations/chatOps";
import { useNavigate } from "react-router-dom";
import { CgProfile } from "react-icons/cg";
import { useSelector } from "react-redux";
import { type RootState } from "../../reducer/store";
import { socket } from "../../services/socket/socket";

const FriendsTab = () => {

  const [friends, setFriends] = useState<any[]>([]);
  const searchQuery = useSelector((state: RootState) => state.search.query);
  const navigate = useNavigate();

  const filteredFriends = friends.filter(friend =>
    friend.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // ✅ Fetch friends (accessible everywhere)
  const fetchFriends = async () => {
    try {
      const res = await getMyFriendsAPI();
      setFriends(res.data.data);
    } catch (err) {
      console.log(err);
    }
  };

  // initial load
  useEffect(() => {
    fetchFriends();
  }, []);

  // friend added realtime
  useEffect(() => {

    const handleFriendAdded = () => {
      fetchFriends();
    };

    socket.on("friendAdded", handleFriendAdded);

    return () => socket.off("friendAdded", handleFriendAdded);

  }, []);

  // friend removed realtime
  useEffect(() => {

    const handleFriendRemoved = ({ friendId }: any) => {
      setFriends(prev => prev.filter(f => f._id !== friendId));
    };

    socket.on("friendRemoved", handleFriendRemoved);

    return () => socket.off("friendRemoved", handleFriendRemoved);

  }, []);

  const handleClick = async (friendId: string) => {
    try {
      const res = await createNewChatAPI(friendId);
      navigate(`/chat/${res.data.chatId}`);
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <div className="h-full w-screen overflow-y-auto text-white">

      {filteredFriends.length === 0 ? (
        <p className="text-center mt-5">No friends yet</p>
      ) : (
        filteredFriends.map((friend) => (

          <div
            key={friend._id}
            onClick={() => handleClick(friend._id)}
            className="border border-x-0 border-t-0 p-2 hover:bg-gray-400 border-b-gray-500 flex items-center cursor-pointer"
          >

            <div className="px-4">
              {friend.profileImage?.url ? (
                <img
                  src={friend.profileImage.url}
                  alt={friend.name}
                  className="w-[40px] h-[40px] rounded-full object-cover"
                />
              ) : (
                <div className="w-[40px] h-[40px] rounded-full bg-gray-700 flex items-center justify-center">
                  <CgProfile size={40} />
                </div>
              )}
            </div>

            <div className="font-medium">{friend.name}</div>

          </div>

        ))
      )}

    </div>
  );
};

export default FriendsTab;