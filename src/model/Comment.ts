import mongoose, {Document} from "mongoose";
import {UserRef} from "./User";
import {PostRef} from "./Post";

export interface CommentContentInfo {
    text: string
}

export interface CommentModel extends Document {
    post: PostRef
    parent?: CommentRef,
    creator: UserRef,
    content: CommentContentInfo,
    createdAt: Date
}

export type CommentRef = CommentModel | mongoose.Types.ObjectId | string

const Comment = new mongoose.Schema({
    post: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Post',
        required: true
    },
    parent: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Comment'
    },
    creator: {
        type: mongoose.Schema.Types.ObjectId,
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

Comment.index({ post: -1, parent: 1, createdAt: -1, _id: -1 })
Comment.index({ post: -1, createdAt: -1, _id: -1 })

export default mongoose.model<CommentModel>('Comment', Comment)