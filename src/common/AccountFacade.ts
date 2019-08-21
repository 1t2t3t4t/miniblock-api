import User, {UserModel} from "../model/User"
import {MongoError} from "mongodb";
import FriendRequest, {FriendRequestModel, FriendRequestStatus} from "../model/FriendRequest";
import ChatRoomDAO from "./ChatRoomDAO";

export namespace FriendRequestError {
    export class RequestNotFound extends Error {
        message = 'There is no request for this user'
    }
}

class AccountFacade {

    private chatRoomDAO = new ChatRoomDAO()

    async register(email: string, displayName: string, uid: string): Promise<UserModel>  {
        let user = new User({ email, displayName, uid })
        return user.save()
    }

    async friendRequest(fromUser: UserModel,
                        toUserId: string): Promise<FriendRequestModel> {
        const request = new FriendRequest({
            user: fromUser,
            requestedUser: toUserId
        })

        return request.save()
    }

    async friendRequestDecline(fromUser: UserModel,
                                toUserId: string) {
        const request = await FriendRequest.findOne({ user: fromUser, requestedUser: toUserId })
        if (!request) throw new FriendRequestError.RequestNotFound()

        request.status = FriendRequestStatus.Decline

        return request.remove()
    }

    async friendRequestAccept(fromUser: UserModel,
                              toUserId: string) {
        const request = await FriendRequest.findOne({ user: fromUser, requestedUser: toUserId })
        if (!request) throw new FriendRequestError.RequestNotFound()

        request.status = FriendRequestStatus.Accept

        const chatRoom = await this.chatRoomDAO.create([fromUser, toUserId])

        await chatRoom.save()
        await request.remove()

        return chatRoom
    }
}

export default AccountFacade