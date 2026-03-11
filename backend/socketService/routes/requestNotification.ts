import express from "express"
import {requestNotification,requestRemovedNotification,friendRemoved, friendAdded} from "../controllers/requestNotification"
import {headerAuth} from "../middlewares/headerAuth"
const router=express.Router();

router.post("/notify",headerAuth,requestNotification);
router.post("/request-removed", headerAuth, requestRemovedNotification);
router.post("/friendRemoved",headerAuth,friendRemoved);
router.post("/friendAdded",headerAuth,friendAdded);

export default router;