import express from "express"

import {profileNotification} from "../controllers/profileNotification"
import {headerAuth} from "../middlewares/headerAuth"
const router=express.Router();

router.post("/profilePicUpdated",headerAuth,profileNotification);



export default router;