import mongoose from 'mongoose'
import {UserRef} from './User'

const Schema = mongoose.Schema

export type PostType = 'text' | 'url'

const postTypeValidator = (str: string) => {
    return str === 'text' || str === 'url'
}

export interface PostModel extends mongoose.Document {
    title: string,
    categoryId: number,
    type: PostType,
    content: string,
    creator: UserRef,
    like?: [UserRef],
    dislike?: [UserRef],
}

const Post = new Schema({
    title: {
        type: String,
        required: true,
    },
    categoryId: {
        type: Number,
        required: true
    },
    type: {
        type: String,
        required: true,
        validate: {
            validator: postTypeValidator,
            msg: 'type can only be "text" or "url" but got {VALUE}.'
        }
    },
    content: {
        type: String,
        required: true
    },
    creator: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
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

export default mongoose.model<PostModel>('Post', Post)