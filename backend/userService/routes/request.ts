import express from "express"
import {sendFriendRequest,getPendingRequests,acceptRequest,rejectRequest,cancelFriendRequest,getSentRequests,removeFriend} from "../controllers/FriendRequest";
import{isAuth} from "../middlewares/isAuth"

const router=express.Router();


router.post("/send", isAuth, sendFriendRequest);
router.get("/pending", isAuth, getPendingRequests);
router.post("/accept/:requestId", isAuth, acceptRequest);
router.post("/reject/:requestId", isAuth, rejectRequest);
router.post("/cancel",isAuth,cancelFriendRequest);
router.get("/sent",isAuth,getSentRequests);
router.post( "/remove-friend/:friendId",isAuth,removeFriend);
export default router;