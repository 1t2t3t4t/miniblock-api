import mongoose, {Document} from 'mongoose'
import {toEnumArray} from "../utils/enum";

const Schema = mongoose.Schema

enum MessageType {
    TEXT = 'text'
}

export interface MessageInfo {
    chatRoom: mongoose.Types.ObjectId
    type: MessageType
    content: string
}

export interface MessageModel extends Document {
    messageInfo: MessageInfo
}

const Message = new Schema({
    chatRoom: {
        type: Schema.Types.ObjectId,
        ref: 'ChatRoom',
        required: true
    },
    messageInfo: {
        type: {
            type: String,
            required: true,
            enum: toEnumArray(MessageType)
        },
        content: {
            type: String,
            required: true
        }
    }
}, {
    timestamps: true
})

export default mongoose.model<MessageModel>("Message", Message)