import mongoose, {Model} from 'mongoose'
import {isNullOrUndefined} from "util";
import {toEnumArray} from "../utils/enum";
import {Category} from "./Categories";
import UserPreferences from "./UserPreferences";
const Schema = mongoose.Schema

const validator = require('validator')

interface UserModelHelper extends Model<UserModel> {
    findByUID(uid: string): UserModel
}

export interface DisplayImageInfo {
    image: string
}

export interface UserModel extends mongoose.Document {
    _id: mongoose.Types.ObjectId
    uid: string
    email: string
    displayName?: string
    displayImageInfo?: DisplayImageInfo
}

export enum Gender {
    MALE = 'male',
    FEMALE = 'female',
    OTHER = 'other'
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
    },
    gender: {
        type: String,
        enum: toEnumArray(Gender)
    },
    currentFeeling: {
        type: Number,
        enum: toEnumArray(Category)
    }
})

User.statics.findByUID = async function(this: Model<UserModel, UserModelHelper>, uid: string) {
    if (!uid) throw Error('uid is missing')

    return this.findOne({ uid })
}

User.pre("save", async function(this: UserModel, next) {
    if (this.isNew) {
        const userPref = new UserPreferences({ userId: this._id })
        await userPref.save()
    }

    next()
})

export function isUserModel(user: UserRef): user is UserModel {
    return !isNullOrUndefined((user as UserModel)._id)
}

export type UserRef = UserModel | mongoose.Types.ObjectId | string

export default mongoose.model<UserModel, UserModelHelper>('User', User)