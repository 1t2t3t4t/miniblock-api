import mongoose from 'mongoose'
import {UserRef} from './User'
import categories from './Categories'

const Schema = mongoose.Schema

export type PostType = 'text' | 'url'

const postTypeValidator = (str: string) => {
    return str === 'text' || str === 'url'
}

const categoryValidator = (id: number): boolean => {
    return categories.find((cat) => cat.id == id) != undefined
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
        required: true,
        validate: {
            validator: categoryValidator,
            msg: 'we dont have categoryId {VALUE}.'
        }
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