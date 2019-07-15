import mongoose from 'mongoose'
const Schema = mongoose.Schema

const validator = require('validator')

const User = new Schema({
    uid: {
        type: String,
        required: true,
        unique: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        validate: {
            validator: validator.isEmail,
            msg: '{VALUE is not a valid email.}'
        }
    },
    displayName: {
        type: String,
        minlength: 1
    },
    username: {
        type: String,
        required: true,
        unique: true,
        validate: {
            validator: validator.isAlphanumeric,
            msg: '{VALUE} should not contain special character'
        },
        minlength: 1
    }
})

User.statics.findByUID = async function(uid: string) {
    if (!uid) throw Error('uid is missing')

    return this.findOne({ uid })
}

export interface UserModel extends mongoose.Document {
    uid: string
    email: string
    displayName?: string
    username: string
}

export default mongoose.model<UserModel>('User', User)