import {UserModel} from "../model/User";
import FriendRequest, {FriendRequestModel, FriendRequestStatus} from "../model/FriendRequest";

export namespace FriendRequestError {
    export class RequestNotFound extends Error {
        message = 'There is no request for this user'
    }

    export class AlreadyAdded extends Error {
        message = 'User already added'
    }
}
export default class FriendRequestDAO { 

    async friendRequests(user: UserModel) {
        const requests = await FriendRequest
            .find({ requestedUser: user })
            .populate('requestedUser')
            .populate('user')
        return requests
    }

    async createFriendRequest(fromUser: UserModel,
                              toUserId: string): Promise<FriendRequestModel> {
        const request = FriendRequest.create({
            user: fromUser,
            requestedUser: toUserId
        })

        return request
    }

    async friendRequestDecline(requestId: string) {
        const request = await FriendRequest.findOne({ _id: requestId })
        if (!request) throw new FriendRequestError.RequestNotFound()

        request.status = FriendRequestStatus.Decline

        return request.remove()
    }

    async friendRequestAccept(requestId: string) {
        const request = await FriendRequest.findOne({ _id: requestId })
        if (!request) throw new FriendRequestError.RequestNotFound()

        request.status = FriendRequestStatus.Accept

        await request.remove()

        return request
    }

}