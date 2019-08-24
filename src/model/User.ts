import mongoose, {Model} from 'mongoose'
import {isNullOrUndefined} from "util";
import {toEnumArray} from "../utils/enum";
import {Category} from "./Categories";
import Location, {LocationInfo} from "./Location";
import {anonymousDisplayName} from "../utils/userHelper";
import {CurrentFeeling} from "./CurrentFeeling";

const Schema = mongoose.Schema

const validator = require('validator')

interface UserModelHelper extends Model<UserModel> {
    findByUID(uid: string): UserModel
}

export interface DisplayImageInfo {
    image: string
}

export interface UserPreferencesInfo {
    showInDiscovery: boolean
}

export interface DiscoveryInfo {
    currentLocation?: LocationInfo
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
    displayImageInfo?: DisplayImageInfo
    userPrefInfo: UserPreferencesInfo
    gender: Gender
    currentFeeling: CurrentFeeling[]
    discoveryInfo: DiscoveryInfo,
    anonymousInfo: AnonymousInfo
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
    discoveryInfo: {
        currentLocation: {
            type: Location,
            default: null
        }
    },
    userPrefInfo: {
        showInDiscovery: {
            type: Boolean,
            default: false
        }
    },
    anonymousInfo: {
        displayName: {
            type: String
        }
    }
})

User.pre('save', function (this: UserModel)  {
    if (this.isModified('displayName') && this.displayName) {
        this.anonymousInfo = {
            displayName: anonymousDisplayName(this.displayName)
        }
    }
})

User.index({ currentFeeling: 1, 'userPrefInfo.showInDiscovery': 1, 'discoveryInfo.currentLocation': '2dsphere' },
    { name: "discovery_index" })

User.statics.findByUID = async function(this: Model<UserModel, UserModelHelper>, uid: string) {
    if (!uid) throw Error('uid is missing')

    return this.findOne({ uid })
}

export function isUserModel(user: UserRef): user is UserModel {
    return !isNullOrUndefined((user as UserModel)._id)
}

export type UserRef = UserModel | mongoose.Types.ObjectId | string

export default mongoose.model<UserModel, UserModelHelper>('User', User)