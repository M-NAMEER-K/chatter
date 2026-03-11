import express from "express";
import { newMessageNotification ,messageSeen,messageDelivered,bulkDelivered,checkUserOnline} from "../controllers/newMessageNotification";
import { headerAuth } from "../middlewares/headerAuth";

const router = express.Router();

router.post("/newMessage", headerAuth, newMessageNotification);
router.post("/chatSeen",headerAuth,messageSeen);
router.post("/checkUserOnline", headerAuth, checkUserOnline);
router.post("/messageDelivered",headerAuth,messageDelivered);
router.post("/bulkDelivered",headerAuth,bulkDelivered);

export default router;
