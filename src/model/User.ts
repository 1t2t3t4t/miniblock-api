import mongoose, {Model} from 'mongoose'
const Schema = mongoose.Schema

const validator = require('validator')

interface UserModelHelper extends Model<UserModel> {
    findByUID(uid: string): UserModel
}

export interface DisplayImageInfo {
    image?: string
}

export interface UserModel extends mongoose.Document {
    _id: mongoose.Types.ObjectId
    uid: string
    email: string
    displayName?: string
    displayImageInfo: DisplayImageInfo
}

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
        required: true,
        minlength: 1
    },
    displayImageInfo: {
        image: {
            type: String
        }
    }
})

User.statics.findByUID = async function(this: Model<UserModel, UserModelHelper>, uid: string) {
    if (!uid) throw Error('uid is missing')

    return this.findOne({ uid })
}

export type UserRef = UserModel | mongoose.Types.ObjectId | string

export default mongoose.model<UserModel, UserModelHelper>('User', User)