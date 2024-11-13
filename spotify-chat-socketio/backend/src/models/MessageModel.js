import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
	{
		senderId: { type: String, required: true },
		receiverId: { type: String, required: true },
		content: { type: String, required: true },
        isRead: { type: Boolean, default: false },
        image: { type: String, required: false },
        video: { type: String, required: false },
	},
	{ timestamps: true }
);

const Message = mongoose.models.Message || mongoose.model('Message', messageSchema);

export default Message