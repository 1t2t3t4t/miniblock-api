import mongoose, {Document} from 'mongoose'
import {toEnumArray} from "../utils/enum";
import {UserRef} from "./User";

const Schema = mongoose.Schema

enum MessageType {
    TEXT = 'text'
}

export interface MessageInfo {
    sender: UserRef
    type: MessageType
    content: string
}

export interface MessageModel extends Document {
    chatRoom: mongoose.Types.ObjectId
    messageInfo: MessageInfo
}

const Message = new Schema({
    chatRoom: {
        type: Schema.Types.ObjectId,
        ref: 'ChatRoom',
        required: true
    },
    messageInfo: {
        sender: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        type: {
            type: String,
            required: true,
            enum: toEnumArray<string>(MessageType)
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