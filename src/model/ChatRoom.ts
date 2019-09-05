import mongoose from 'mongoose'
import {MessageModel, MessageSchema} from "./Message";

export interface ChatRoomModel extends mongoose.Document {
    users: mongoose.Types.ObjectId[],
    chatRoomId: string,
    latestMessageInfo: MessageModel
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
        type: MessageSchema
    }
})

ChatRoom.index({ users: 1 })

ChatRoom.index({ users: 1, 'latestMessageInfo.createdAt': -1 })

export default mongoose.model<ChatRoomModel>('ChatRoom', ChatRoom)