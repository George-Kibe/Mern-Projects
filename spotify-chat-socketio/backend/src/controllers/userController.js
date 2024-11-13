import Message from "../models/MessageModel.js";
import User from "../models/UserModel.js";

export const getAllUsers = async (req, res, next) => {
	try {
		const currentUserId = req.auth.userId;
		const users = await User.find({ clerkId: { $ne: currentUserId } });
		res.status(200).json(users);
	} catch (error) {
		next(error);
	}
};


export const getMessages = async(req, res, next) => {
    try {
        const myId = req.auth.userId;
        const {userId} = req.params;

        const messages = await Message.find({
            $or: [
                { senderId: myId, receiverId: userId },
                { senderId: userId, receiverId: myId }
            ]
        }).sort({ createdAt: 1 });
        res.status(200).json(messages);
    } catch (error) {
        console.log("Message: ", error.message);
        next(error);
    }
}