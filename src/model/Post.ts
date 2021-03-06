import mongoose, { Types } from 'mongoose'
import User, { Gender, isUserModel, UserModel, UserRef } from './User'
import categories, { Category } from './Categories'
import { isNullOrUndefined, isString } from "util";
import { CommentModel, CommentRef } from './Comment'
import { toEnumArray } from "../utils/enum";

const Schema = mongoose.Schema

export enum PostType {
    TEXT = 'text',
    LINK = 'link',
    IMAGE = 'image'
}

export type PostContentInfo = {
    detail1: string;
    detail2?: string;
    detail3?: string;
    detail4?: string;
    imgUrl1?: string;
    imgUrl2?: string;
    imgUrl3?: string;
    imgUrl4?: string;
}

export enum Reaction {
    like = 'like',
    none = 'none'
}

export function isPostModel(post: PostRef): post is PostModel {
    return !isNullOrUndefined((post as PostModel)._id)
}

export interface AuthInfo {
    canDelete: boolean
    canEdit: boolean
    canSeeProfile: boolean
}

export interface PostModel extends mongoose.Document {
    post: any;
    _id: mongoose.Types.ObjectId
    title: string
    category: string
    type: PostType
    content: PostContentInfo
    creator: UserRef
    likeInfo: {
        like: UserRef[]
        isLiked?: boolean
        count?: number
    }
    commentInfo: {
        comments: CommentRef[]
        count?: number
    }
    authInfo?: AuthInfo

    setInteractor: (user: UserRef) => void
    checkAuth: (user: UserRef) => AuthInfo
    setReaction: (this: PostModel, interactor: UserModel, reaction: Reaction) => void
}

const Post = new Schema({
    title: {
        type: String,
        required: true,
    },
    category: {
        type: String,
        required: true,
        index: true
    },
    type: {
        type: String,
        enum: toEnumArray(PostType),
        required: true,
        default: PostType.TEXT
    },
    content: {
        detail1: {
            type: String,
            required: true
        },
        detail2: {
            type: String
        },
        detail3: {
            type: String
        },
        detail4: {
            type: String
        },
        imgUrl1: {
            type: String
        },
        imgUrl2: {
            type: String
        },
        imgUrl3: {
            type: String
        },
        imgUrl4: {
            type: String
        },
    },
    creator: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    likeInfo: {
        like: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User'
            }
        ],
        count: {
            type: Number
        }
    },
    commentInfo: {
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
    timestamps: true,
    toObject: {
        virtuals: true
    },
    toJSON: {
        virtuals: true
    },
})

Post.virtual('likeInfo.isLiked')

Post.virtual('authInfo.canDelete')
Post.virtual('authInfo.canEdit')
Post.virtual('authInfo.canSeeProfile')

Post.index({ category: 1, _id: -1, 'likeInfo.count': -1 })
Post.index({ _id: -1, 'likeInfo.count': -1 })

Post.index({ createdAt: -1, _id: -1 })
Post.index({ category: 1, createdAt: -1, _id: -1 })
Post.index({ title: 1, createdAt: -1, _id: -1 })

Post.pre('save', function (this: PostModel) {
    if (this.isModified('likeInfo') || this.isNew) {
        this.likeInfo.count = this.likeInfo.like.length
    }

    if (this.isModified('commentInfo') || this.isNew) {
        this.commentInfo.count = this.commentInfo.comments.length
    }
})

Post.methods.setInteractor = function (this: PostModel, interactor: UserRef) {
    const interactorId = isUserModel(interactor) ? interactor._id : interactor

    this.likeInfo.isLiked = !isNullOrUndefined(this.likeInfo.like.find((liker) => {
        const likerId = liker as mongoose.Types.ObjectId
        return likerId.equals(interactorId)
    }))

    const authInfo = this.checkAuth(interactor)
    this.authInfo!.canDelete = authInfo.canDelete
    this.authInfo!.canEdit = authInfo.canEdit
    this.authInfo!.canSeeProfile = authInfo.canSeeProfile
}

Post.methods.checkAuth = function (this: PostModel, interactor: UserRef): AuthInfo {
    const interactorId = isUserModel(interactor) ? interactor._id : interactor
    const creatorId = (isUserModel(this.creator) ? this.creator._id : this.creator) as mongoose.Types.ObjectId
    return {
        canDelete: creatorId.equals(interactorId),
        canEdit: creatorId.equals(interactorId),
        canSeeProfile: creatorId.equals(interactorId)
    }
}

export class PostReactionError extends Error {

    static UserAlreadyLiked = new PostReactionError('User already liked')
    static UserDidNotLikePost = new PostReactionError('User did not like the post')

}

Post.methods.setReaction = function (this: PostModel, interactor: UserModel, reaction: Reaction) {
    this.setInteractor(interactor)

    switch (reaction) {
        case Reaction.like:
            if (this.likeInfo.isLiked) {
                throw PostReactionError.UserAlreadyLiked
            }

            this.likeInfo.like.push(interactor)
            break
        case Reaction.none:
            if (!this.likeInfo.isLiked) {
                throw PostReactionError.UserDidNotLikePost
            }

            this.likeInfo.like = this.likeInfo.like.filter((liker) => {
                return !(liker as mongoose.Types.ObjectId).equals(interactor._id)
            })
            break
    }

    this.setInteractor(interactor)
}

export type PostRef = PostModel | mongoose.Types.ObjectId | string

export default mongoose.model<PostModel>('Post', Post)