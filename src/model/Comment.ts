import mongoose, {Document} from "mongoose";
import {UserRef} from "./User";
import Post, {PostRef, PostType} from "./Post";
import {isNullOrUndefined} from "util";

export interface CommentContentInfo {
    text: string
}

export interface SubCommentInfo {
    comments: CommentRef[]
    count: number
}

export interface CommentModel extends Document {
    post: PostRef
    parent?: CommentRef,
    creator: UserRef,
    content: CommentContentInfo,
    createdAt: Date,
    subCommentInfo: SubCommentInfo
}

export type CommentRef = CommentModel | mongoose.Types.ObjectId | string

async function validatePost(postId: string): Promise<boolean> {
    const post = await Post.findById(postId)
    return !isNullOrUndefined(post)
}

const Comment = new mongoose.Schema({
    post: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Post',
        required: true,
        validate: {
            isAsync: true,
            validator: validatePost,
            msg: 'PostId {VALUE} does not exist'
        }
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
    },
    subCommentInfo: {
        comments: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Comment'
            }
        ],
        count: {
            type: Number
        }
    }
}, {
    timestamps: true
})

Comment.pre('save', function(this: CommentModel) {
    if (this.isModified('subCommentInfo') || this.isNew) {
        this.subCommentInfo.count = this.subCommentInfo.comments.length
    }
})

Comment.index({ post: -1, parent: 1, createdAt: -1, _id: -1 })
Comment.index({ post: -1, createdAt: -1, _id: -1 })

export default mongoose.model<CommentModel>('Comment', Comment)