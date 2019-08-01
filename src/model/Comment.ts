import mongoose, {Schema, Document} from "mongoose";
import {UserRef} from "./User";

export interface CommentContentInfo {
    text: string
}

export interface CommentModel extends Document {
    parent?: CommentRef,
    creator: UserRef,
    content: CommentContentInfo,
    createdAt: Date
}

export type CommentRef = CommentModel | mongoose.Types.ObjectId | string

const Comment = new Schema({
    parent: {
        type: Schema.Types.ObjectId,
        ref: 'Comment'
    },
    creator: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    content: {
        text: {
            type: String,
            required: true
        }
    }
}, {
    timestamps: true
})

Comment.index({ parent: 1, createdAt: -1, _id: -1 })
Comment.index({ createdAt: -1, _id: -1 })

export default mongoose.model<CommentModel>('Comment', Comment)