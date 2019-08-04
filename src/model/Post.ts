import mongoose, {Types} from 'mongoose'
import User, {isUserModel, UserModel, UserRef} from './User'
import categories from './Categories'
import {isNullOrUndefined, isString} from "util";
import {CommentModel, CommentRef} from './Comment'

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

export function isPostModel(post: PostRef): post is PostModel {
    return !isNullOrUndefined((post as PostModel)._id)
}

export interface AuthInfo {
    canDelete: boolean
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

Post.pre('save', function(this: PostModel) {
    if (this.isModified('likeInfo') || this.isNew) {
        this.likeInfo.count = this.likeInfo.like.length
    }

    if (this.isModified('commentInfo') || this.isNew) {
        this.commentInfo.count = this.commentInfo.comments.length
    }
})

Post.methods.setInteractor = function(this: PostModel, interactor: UserRef) {
    const interactorId = isUserModel(interactor) ? interactor._id : interactor

    this.likeInfo.isLiked = !isNullOrUndefined(this.likeInfo.like.find((liker) => {
        const likerId = liker as mongoose.Types.ObjectId
        return likerId.equals(interactorId)
    }))

    const creatorId = (isUserModel(this.creator) ? this.creator._id : this.creator) as mongoose.Types.ObjectId
    this.authInfo!.canDelete = creatorId.equals(interactorId)
}

Post.methods.checkAuth = function(this: PostModel, interactor: UserRef): AuthInfo {
    const interactorId = isUserModel(interactor) ? interactor._id : interactor
    const creatorId = (isUserModel(this.creator) ? this.creator._id : this.creator) as mongoose.Types.ObjectId
    return {
        canDelete: creatorId.equals(interactorId)
    }
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
Post.virtual('authInfo.canDelete')

Post.index({  categoryId: 1, _id: -1,'likeInfo.count': -1 })
Post.index({  _id: -1,'likeInfo.count': -1 })

Post.index({  createdAt: -1, _id: -1 })
Post.index({  categoryId: 1, createdAt: -1 , _id: -1 })
Post.index({ title: 1, createdAt: -1, _id: -1 })

export type PostRef = PostModel | mongoose.Types.ObjectId | string

export default mongoose.model<PostModel>('Post', Post)