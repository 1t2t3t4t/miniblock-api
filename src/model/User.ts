import mongoose, {Model} from 'mongoose'
import {isNullOrUndefined} from "util";
import {toEnumArray} from "../utils/enum";
import {Category} from "./Categories";
import {anonymousDisplayName} from "../utils/userHelper";
import {CurrentFeeling} from "./CurrentFeeling";
import FriendRequest, {FriendRequestModel} from "./FriendRequest";

const Schema = mongoose.Schema

const validator = require('validator')

interface UserModelHelper extends Model<UserModel> {
    findByUID(uid: string): UserModel
}

export interface DisplayImageInfo {
    image: string
}

export interface AnonymousInfo {
    displayName: string
}

export interface UserModel extends mongoose.Document {
    _id: mongoose.Types.ObjectId
    uid: string
    email: string
    displayName?: string
    age: number
    description: string
    displayImageInfo?: DisplayImageInfo 
    gender: Gender
    currentFeeling: CurrentFeeling[]
    anonymousInfo: AnonymousInfo
    isFriend?: boolean

    setInteractor: (interactor: UserModel) => Promise<boolean>
}

export enum Gender {
    MALE = 'male',
    FEMALE = 'female',
    OTHER = 'other',
    UNSPECIFIED = 'unspecified'
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
            msg: '{VALUE} is not a valid email.'
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
    age: {
        type: Number,
        default: 0
    },
    description: {
        type: String,
        maxlength: 256,
        default: ""
    },
    gender: {
        type: String,
        enum: toEnumArray(Gender),
        default: Gender.UNSPECIFIED
    },
    currentFeeling: [
        {
            type: Number,
            enum: toEnumArray(CurrentFeeling)
        }
    ],
    anonymousInfo: {
        displayName: {
            type: String
        }
    }
})

User.virtual('isFriend')

User.pre('save', function (this: UserModel)  {
    if (this.isModified('displayName') && this.displayName) {
        this.anonymousInfo = {
            displayName: anonymousDisplayName(this.displayName)
        }
    }
})

User.statics.findByUID = async function(this: Model<UserModel, UserModelHelper>, uid: string) {
    if (!uid) throw Error('uid is missing')

    return this.findOne({uid})
}

User.methods.setInteractor = async function(this: UserModel, interactor: UserModel) {
    const isFriendRequest = !isNullOrUndefined(await FriendRequest.find({ user: interactor, requestedUser: this }))

    this.isFriend = isFriendRequest
}

export function isUserModel(user: UserRef): user is UserModel {
    return !isNullOrUndefined((user as UserModel)._id)
}

export type UserRef = UserModel | mongoose.Types.ObjectId | string

export default mongoose.model<UserModel, UserModelHelper>('User', User)