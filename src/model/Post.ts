import mongoose from 'mongoose'
import {UserRef} from './User'

const Schema = mongoose.Schema

export interface PostModel extends mongoose.Document {
    content: string,
    creator: UserRef,
    like?: [UserRef],
    dislike?: [UserRef]
}

const Post = new Schema({
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