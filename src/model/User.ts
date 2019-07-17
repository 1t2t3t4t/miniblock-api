import mongoose, {Model} from 'mongoose'
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
        required: true,
        minlength: 1
    }
})

User.statics.findByUID = async function(uid: string): Promise<UserModel> {
    if (!uid) throw Error('uid is missing')

    return this.findOne({ uid })
}

interface UserModelHelper extends Model<UserModel> {
    findByUID(uid: string): UserModel
}

export interface UserModel extends mongoose.Document {
    uid: string
    email: string
    displayName?: string
}

export type UserRef = UserModel | string

export default mongoose.model<UserModel, UserModelHelper>('User', User)