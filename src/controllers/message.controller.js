import User from "../models/user.model.js";
import Message from "../models/message.model.js";
import cloudinary from "../lib/cloudinary.js";
import { getReceiverSocketId, io } from "../lib/socket.js";
export const getUserForSidebar = async (req, res) => {
  try {
    const loggedInUserId = req.user._id;
    const filterUsers = await User.find({
      _id: { $ne: loggedInUserId },
    }).select("-password");

    res.status(200).json({
      success: true,
      message: "Users fetched successfully",
      users: filterUsers,
    });
  } catch (error) {
    console.error("Error fetching users for sidebar:", error);
  }
};

export const getMessages = async (req, res) => {
  try {
    const { id: userChatId } = req.params;
    const myId = req.user._id;
    const messages = await Message.find({
      $or: [
        { senderId: myId, receiverId: userChatId },
        { senderId: userChatId, receiverId: myId },
      ],
    });
    console.log("Messages fetched:", messages);

    res.status(200).json({
      success: true,
      messages,
    });
  } catch (error) {
    console.error("Error fetching messages:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const sendMessage = async (req, res) => {
  try {
    const { text, image } = req.body;
    const { id: receiverId } = req.params;
    const senderId = req.user._id;
    console.log("Sending message from:", senderId, "to:", receiverId);
    let imageUrl;
    if (image) {
      const uploadeResponse = await cloudinary.uploader.upload(image);
      imageUrl = uploadeResponse.secure_url;
    }

    const newMessage = await Message.create({
      text,
      image: imageUrl,
      senderId,
      receiverId,
    });
    const receiverSocketId = getReceiverSocketId(receiverId);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("newMessage", newMessage);
    }

    res.status(200).json({
      success: true,
      message: "Message sent successfully",
      newMessage: newMessage,
    });
  } catch (error) {
    console.error("Error sending message:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};
export const deleteFromEveryOneMessage = async (req, res) => {
  try {
    const { messageId } = req.params;
    console.log("Deleting message with ID:", messageId);
    const messageExists = await Message.findById(messageId);
    if (messageExists.senderId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "You can only delete your own messages",
      });
    }

    const message = await Message.findByIdAndDelete(messageId);
    io.emit("messageDeletedForEveryone", {
      messageId,
      senderId: message.senderId,
      receiverId: message.receiverId,
    });
    if (!message) {
      return res.status(404).json({
        success: false,
        message: "Message not found",
      });
    }
    // await Message.save();
    res.status(200).json({
      success: true,
      message: "Message deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting message:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
