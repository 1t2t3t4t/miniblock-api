import mongoose, {Model} from 'mongoose'
import {isNullOrUndefined} from "util";
import {toEnumArray} from "../utils/enum";
import {Category} from "./Categories";

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

export type Longitude = number
export type Latitude = number
export type Coordinates = [Longitude, Latitude]

export interface LocationInfo {
    coordinates: Coordinates
}

export interface DiscoveryInfo {
    currentLocation?: LocationInfo
}

export enum LocationType {
    POINT = 'Point'
}

export interface UserModel extends mongoose.Document {
    _id: mongoose.Types.ObjectId
    uid: string
    email: string
    displayName?: string
    displayImageInfo?: DisplayImageInfo
    userPrefInfo: UserPreferencesInfo
    gender: Gender
    currentFeeling: Category
    discoveryInfo: DiscoveryInfo
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
        enum: toEnumArray(Gender),
        default: Gender.UNSPECIFIED
    },
    currentFeeling: {
        type: Number,
        enum: toEnumArray(Category)
    },
    discoveryInfo: {
        currentLocation: {
            type: {
                type: String,
                enum: toEnumArray(LocationType),
                default: LocationType.POINT
            },
            coordinates: {
                type: [Number] // [longitude, latitude]
            }
        }
    },
    userPrefInfo: {
        showInDiscovery: {
            type: Boolean,
            default: true
        }
    }
})

User.statics.findByUID = async function(this: Model<UserModel, UserModelHelper>, uid: string) {
    if (!uid) throw Error('uid is missing')

    return this.findOne({ uid })
}

export function isUserModel(user: UserRef): user is UserModel {
    return !isNullOrUndefined((user as UserModel)._id)
}

export type UserRef = UserModel | mongoose.Types.ObjectId | string

export default mongoose.model<UserModel, UserModelHelper>('User', User)