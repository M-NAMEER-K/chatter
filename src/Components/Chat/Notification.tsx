import { useEffect, useState } from "react";
import { type RootState } from "../../reducer/store";
import {
  getPendingRequestAPI,
  acceptRequestAPI,
  rejectRequestAPI,
} from "../../services/operations/requestOps";

import { useSelector, useDispatch } from "react-redux";
import { clearNotifications,removeNotificationBySenderId } from "../../slices/notificationSlice";
import { socket } from "../../services/socket/socket";

interface IRequest {
  _id: string;
  sender: {
    _id: string;
    name: string;
    email: string;
  };
}

const Notification = () => {

  const dispatch = useDispatch();

  const liveNotifications = useSelector(
    (state: RootState) => state.notification.liveNotifications
  );
  

  const [requests, setRequests] = useState<IRequest[]>([]);
  const searchQuery = useSelector((state: RootState) => state.search.query);

const filteredRequests = requests.filter(req =>
  req.sender.name.toLowerCase().includes(searchQuery.toLowerCase())
);
  const fetchRequests = async () => {
    try {
      const res = await getPendingRequestAPI();
      setRequests(res.data.data);
    } catch (err) {
      console.log(err);
    }
  };
 useEffect(() => {

  return () => {
    dispatch(clearNotifications());
  };

}, []);
  // INITIAL LOAD
  useEffect(() => {
    fetchRequests();
  }, []);

  // WHEN NEW REQUEST ARRIVES
 useEffect(() => {

  const handleNotification = (data:any) => {

    // fetch requests if friend request type
    if (data.type === "FRIEND_REQUEST") {
      fetchRequests();
    }

  };

  socket.on("notification", handleNotification);

  return () => {
    socket.off("notification", handleNotification);
  };

}, []);

  // WHEN REQUEST CANCELLED
  useEffect(() => {

    const handleRequestRemoved = (data: any) => {

      // remove request from UI
      setRequests(prev =>
        prev.filter(req => req.sender._id !== data.senderId)
      );

      // remove notification from redux
     
  dispatch(removeNotificationBySenderId(data.senderId));

    };

    socket.on("requestRemoved", handleRequestRemoved);

    return () => {
      socket.off("requestRemoved", handleRequestRemoved);
    };

  }, []);

  const handleAccept = async (id: string) => {
    await acceptRequestAPI(id);
    setRequests(prev => prev.filter(r => r._id !== id));
  };

  const handleReject = async (id: string) => {
    await rejectRequestAPI(id);
    setRequests(prev => prev.filter(r => r._id !== id));
  };

  return (
    <div className="h-screen w-screen text-white flex flex-col items-center relative overflow-y-auto">

      <h2 className="text-xl underline m-2">Notifications</h2>

     
{liveNotifications.length > 0 && (
  <div className="w-full ">
    <button
      onClick={() => dispatch(clearNotifications())}
      className="   bg-blue-500 px-4 py-1 rounded mb-2 absolute top-[15px] right-4 md:right-6"
    >
      Mark all as read
    </button>

    <div className="w-full flex flex-col items-center">
     {liveNotifications
    .filter((n: any) => n.message)
    .map((n: any, index: number) => (

      <div key={index} className="w-[95%] p-2 m-2 bg-gray-500 rounded-lg">
        {n.message}
      </div>

  ))}
    </div>
  </div>
)}

      {filteredRequests.length === 0 && (
  <p className="my-4 text-yellow-500">
    {searchQuery ? "No user found" : "No new requests"}
  </p>
)}

      {filteredRequests.map(req => (
        <div
          key={req._id}
          className="border rounded-lg w-[95%] flex justify-between px-5 items-center"
        >

          <div className="font-semibold">
            {req.sender.name}
          </div>

          <div className="flex gap-x-3 p-1">

            <button
              onClick={() => handleAccept(req._id)}
              className="bg-green-500 px-3 py-1 rounded"
            >
              Accept
            </button>

            <button
              onClick={() => handleReject(req._id)}
              className="bg-red-500 px-3 py-1 rounded"
            >
              Reject
            </button>

          </div>

        </div>
      ))}

    </div>
  );
};

export default Notification;
