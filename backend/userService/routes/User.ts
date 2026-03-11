import express from "express"
import {sendOtp,registerUser,resendOtp,loginUser,logoutUser,forgotPassword,resetPassword,getMe} from "../controllers/User"
import {getAllUsers,getMyFriends,uploadProfilePicture,getProfileData,changeUsername,changePassword,updateLastSeen, checkFriendship} from "../controllers/ProfileDetails"
import{isAuth} from "../middlewares/isAuth"
import { upload } from "../utils/multer";


const router=express.Router();

router.post("/sendOtp",sendOtp);
router.post("/registerUser",registerUser);
router.post("/loginUser",loginUser);
router.post("/logoutUser",logoutUser);
router.post("/resendOtp",resendOtp);
router.post("/forgotPassword",forgotPassword);
router.post("/resetPassword/:token", resetPassword);


router.get("/getAllUsers",isAuth,getAllUsers);
router.get("/getMyFriends",isAuth,getMyFriends);
router.post("/profile-picture",isAuth,upload.single("image"),uploadProfilePicture);
router.get("/getProfileData/:id",isAuth,getProfileData);
router.post("/changePassword",isAuth,changePassword);
router.post("/changeUsername",isAuth,changeUsername);
router.put("/last-seen/:userId", updateLastSeen);
router.get("/checkFriendship/:otherUserId",isAuth,checkFriendship);
router.get("/me", isAuth, getMe);



export default router;