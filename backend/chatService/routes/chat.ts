import express from "express"
import {isAuth} from "../middlewares/isAuth"
import {headerAuth} from "../middlewares/headerAuth"
import {createNewChat,getAllChats,getMessagesByChat,sendMessage,markMessagesSeen,deliverPendingMessages} from "../controllers/chat"


const router=express.Router();

router.post("/message",isAuth,sendMessage);
router.post("/chat/new",isAuth,createNewChat);
router.get("/chat/all",isAuth,getAllChats);
router.get("/chat/:chatId",isAuth,getMessagesByChat);

router.post("/message/seen", isAuth, markMessagesSeen);


router.post("/deliverPending",headerAuth,deliverPendingMessages);


export default router;