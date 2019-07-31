import mongoose, {Types} from 'mongoose'
import User, {UserModel, UserRef} from './User'
import categories from './Categories'
import {isNullOrUndefined, isString} from "util";

const Schema = mongoose.Schema

export enum PostType {
    TEXT = 'text',
    LINK = 'link',
    IMAGE = 'image'
}

export type PostContentInfo = {
    link?: string,
    text?: string,
    imageInfo?: {
        image: string,
        width: number,
        height: number
    }
}

export enum Reaction {
    like = 'like',
    none = 'none'
}

const postTypeValidator = (str: string) => {
    return str === PostType.LINK || str === PostType.TEXT || str === PostType.IMAGE
}

const categoryValidator = (id: number): boolean => {
    return categories.find((cat) => cat.id == id) != undefined
}

const contentValidator = function (this: PostModel, content: PostContentInfo): boolean {
    switch (this.type) {
        case PostType.IMAGE:
            return !isNullOrUndefined(content.imageInfo)
        case PostType.TEXT:
            return !isNullOrUndefined(content.text)
        case PostType.LINK:
            return !isNullOrUndefined(content.link)
    }
    return false
}

export interface PostModel extends mongoose.Document {
    post: any;
    _id: mongoose.Types.ObjectId
    title: string
    categoryId: number
    type: PostType
    content: PostContentInfo
    creator: UserRef
    likeInfo: {
        like: UserRef[]
        isLiked?: boolean
        count?: number
    }

    setInteractor: (user: UserModel) => void
    setReaction: (this: PostModel, interactor: UserModel, reaction: Reaction) => void
}

const Post = new Schema({
    title: {
        type: String,
        required: true,
    },
    categoryId: {
        type: Number,
        required: true,
        validate: {
            validator: categoryValidator,
            msg: 'we dont have categoryId {VALUE}.'
        },
        index: true
    },
    type: {
        type: String,
        required: true,
        validate: {
            validator: postTypeValidator,
            msg: 'we have no type {VALUE}.'
        }
    },
    content: {
        type: {
            text: {
                type: String
            },
            link: {
                type: String
            },
            imageInfo: {
                image: {
                    required: true,
                    type: String
                },
                width: {
                    type: Number
                },
                height: {
                    type: Number
                }
            }
        },
        required: true,
        validate: {
            validator: contentValidator,
            msg: 'content does not conform to type'
        }
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
                ref: 'User',
                unique: true
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

Post.pre('save', function(this: PostModel) {
    if (this.isModified('likeInfo') || this.isNew) {
        this.likeInfo.count = this.likeInfo.like.length
    }
})

Post.methods.setInteractor = function(this: PostModel, user: UserModel) {
    this.likeInfo.isLiked = !isNullOrUndefined(this.likeInfo.like.find((liker) => {
        const likerId = liker as mongoose.Types.ObjectId
        return likerId.equals(user._id)
    }))
}

export class PostReactionError extends Error {

    static UserAlreadyLiked = new PostReactionError('User already liked')
    static UserDidNotLikePost = new PostReactionError('User did not like the post')

}

Post.methods.setReaction = function(this: PostModel, interactor: UserModel, reaction: Reaction) {
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

Post.virtual('likeInfo.isLiked')

Post.index({  categoryId: 1, _id: -1,'likeInfo.count': -1 })
Post.index({  _id: -1,'likeInfo.count': -1 })

Post.index({  createdAt: -1, _id: -1 })
Post.index({  categoryId: 1, createdAt: -1 , _id: -1 })
Post.index({ title: 1, createdAt: -1, _id: -1 })

export default mongoose.model<PostModel>('Post', Post)