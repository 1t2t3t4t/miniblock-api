import mongoose, {Document} from "mongoose";
import {toEnumArray} from "../utils/enum";
import {UserRef} from "./User";

export interface FriendRequestModel extends Document {
    user: UserRef,
    requestedUser: UserRef,
    status: FriendRequestStatus
}

export enum FriendRequestStatus {
    Pending = 'pending',
    Decline = 'decline',
    Accept = 'accept'
}

const FriendRequest = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    requestedUser: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        index: true,
        ref: 'User'
    },
    status: {
        type: String,
        enum: toEnumArray(FriendRequestStatus),
        default: FriendRequestStatus.Pending
    }
}, {
    timestamps: true
})

FriendRequest.index({ user: 1, createdAt: -1 })
FriendRequest.index({ user: 1, requestedUser: 1 }, { unique: true , dropDups: true})

export default mongoose.model<FriendRequestModel>('FriendRequest', FriendRequest)