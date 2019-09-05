import mongoose from 'mongoose'
import Message from "./Message";

export interface ChatRoomModel extends mongoose.Document {
    users: mongoose.Types.ObjectId[],
    chatRoomId: string
}

const ChatRoom = new mongoose.Schema({
    users: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        }
    ],
    chatRoomId: {
        type: String,
        required: true,
        index: true
    },
    latestMessageInfo: {
        type: Message
    }
})

ChatRoom.index({ users: 1 })

export default mongoose.model<ChatRoomModel>('ChatRoom', ChatRoom)