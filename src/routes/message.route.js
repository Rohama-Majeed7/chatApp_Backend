import express from 'express';
import { protectRoute } from "../middlewares/auth.middleware.js";
import { getUserForSidebar ,getMessages,sendMessage,deleteFromEveryOneMessage} from "../controllers/message.controller.js";  
const router = express.Router();

router.get("/users",protectRoute, getUserForSidebar);
router.get("/:id", protectRoute, getMessages);
router.post("/send/:id",protectRoute,sendMessage); 
router.delete("/deleteMessageFromEveryOne/:messageId", protectRoute,deleteFromEveryOneMessage); // Assuming deleteMessage is defined in the controller

export default router;