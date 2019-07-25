import mongoose from 'mongoose'
import {UserRef} from './User'
import categories from './Categories'
import {isNullOrUndefined} from "util";

const Schema = mongoose.Schema

export enum PostType {
    TEXT = 'text',
    LINK = 'link',
    IMAGE = 'image'
}

export type PostContentInfo = {
    link?: string,
    text?: string,
    image?: string
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
            return !isNullOrUndefined(content.image)
        case PostType.TEXT:
            return !isNullOrUndefined(content.text)
        case PostType.LINK:
            return !isNullOrUndefined(content.link)
    }
    return false
}

export interface PostModel extends mongoose.Document {
    title: string
    categoryId: number
    type: PostType
    content: PostContentInfo
    creator: UserRef
    like?: [UserRef]
    dislike?: [UserRef]
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
            image: {
                type: String
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
    like: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
        }
    ],
    dislike: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
        }
    ]
}, {
    timestamps: true
})

Post.index({  createdAt: -1, _id: -1 })
Post.index({  categoryId: 1, createdAt: -1 , _id: -1 })
Post.index({ title: 1, createdAt: -1, _id: -1 })

export default mongoose.model<PostModel>('Post', Post)