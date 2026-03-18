import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import type { RootState } from "../../reducer/store";
import { allUsersAPI } from "../../services/operations/authOps";
import{getMyFriendsAPI} from "../../services/operations/authOps"
import {sendFriendRequestAPI,cancelFriendRequestAPI,sentRequestAPI,getPendingRequestAPI} from "../../services/operations/requestOps";
import Toast from "react-hot-toast";
import {socket} from "../../services/socket/socket"


export interface IUser {
  _id: string;
  name: string;
  email: string;
}



const AddUsers = () => {
  const [allUsers, setAllUsers] = useState<IUser[]>([]);
  const [requestedUsers, setRequestedUsers] = useState<Set<string>>(new Set());
  const [receivedRequests, setReceivedRequests] = useState<Set<string>>(new Set());

 
  const [loading, setLoading] = useState(false);
   
  const loggedInUserId = useSelector((state: RootState) => state.auth.user?._id);

  const searchQuery = useSelector((state: RootState) => state.search.query);

const filteredUsers = allUsers.filter(user =>
  user.name.toLowerCase().includes(searchQuery.toLowerCase())
);

const fetchAllUsers = async () => {

  if (!loggedInUserId) return;

  try {

    const usersRes = await allUsersAPI();

    const sentReqRes = await sentRequestAPI();

    const receivedReqRes = await getPendingRequestAPI(); // NEW

    const friendsRes = await getMyFriendsAPI();

    const friendIds = new Set<string>(
      friendsRes.data.data.map((u: IUser) => u._id)
    );

    // extract sender ids from pending requests
    const receivedIds = new Set<string>(
      receivedReqRes.data.data.map((req: any) => req.sender._id)
    );
      
    

    setReceivedRequests(receivedIds); // NEW

    setRequestedUsers(
      new Set<string>(sentReqRes.data.data)
    );

    const filteredUsers = usersRes.data.data.filter(
      (user: IUser) =>
        user._id !== loggedInUserId &&
        !friendIds.has(user._id)
    );

    setAllUsers(filteredUsers);

  } catch {
    Toast.error("Failed to fetch users");
  }
};


  /* ================= INITIAL LOAD ================= */

  useEffect(() => {
    fetchAllUsers();
  }, [loggedInUserId]);

  /* ================= SOCKET LISTENER ================= */

  useEffect(() => {

    const handler = () => {
      fetchAllUsers();
    };

    socket.on("notification", handler);

    return () => {
      socket.off("notification", handler);
    };

  }, [loggedInUserId]);


  /* ================= SEND / CANCEL REQUEST ================= */

  const handleRequestToggle = async (receiverId: string) => {
    try {
      setLoading(true);

      if (requestedUsers.has(receiverId)) {
        const res = await cancelFriendRequestAPI(receiverId);

        if (res.data.success) {
          setRequestedUsers(prev => {
            const updated = new Set(prev);
            updated.delete(receiverId);
            return updated;
          });
          Toast.success("Friend request cancelled");
        }
      } else {
        console.log("Sending request to:", receiverId);
        const res = await sendFriendRequestAPI(receiverId);

        if (res.data.success) {
          setRequestedUsers(prev => new Set(prev).add(receiverId));
          Toast.success("Friend request sent");
        }
      }
    } catch (error: any) {
      Toast.error(error?.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  

  /* ================= UI ================= */

  return (
    <div className="h-screen w-screen bg-gray-700 flex items-center flex-col p-4 overflow-y-auto">
      <h1 className="text-white text-2xl mb-4">Add Users</h1>

      {filteredUsers.length === 0 && (
  <p className="text-white">
    {searchQuery ? "No user found" : "No users available"}
  </p>
)}

      {filteredUsers.map(user => {
       const isSent = requestedUsers.has(user._id);
const isReceived = receivedRequests.has(user._id);


        return (
          <div
            key={user._id}
            className="w-[98%] md:w-[75%] bg-gray-300 rounded-lg p-3 m-1 flex justify-between items-center"
          >
            <div className="w-[50%] font-medium">{user.name}</div>

            <button
  disabled={loading || isReceived}
  onClick={() => handleRequestToggle(user._id)}
  className={ `w-[50%] md:w-[30%] rounded-lg p-1 text-white ${
    isReceived
      ? "bg-green-500 cursor-not-allowed"
      : isSent
      ? "bg-red-500 hover:bg-red-400"
      : "bg-blue-500 hover:bg-blue-400"
  }`}
>
  {isReceived
    ? "Pending Request"
    : isSent
    ? "Cancel Request"
    : "Add"}
</button>

          </div>
        );
      })}
    </div>
  );
};

export default AddUsers;
