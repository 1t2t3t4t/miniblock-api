import User, {UserModel, UserRef} from "../model/User";
import {FirebaseDBModel} from "../model/Firebase";
import ChatRoom, {ChatRoomModel} from "../model/ChatRoom";
import FirebaseDatabase from "./FirebaseDatabase";
import Message, {MessageInfo, MessageModel, MessageType} from "../model/Message";
import {isNullOrUndefined} from "util";

export namespace ChatRoomError {
    export class NotInChatRoom extends Error {
        message = 'User is not in the chat room'
    }
    export class ChatRoomNotFound extends Error {
        message = 'Chat room does not exist'
    }
}

interface MessageParams {
    type: MessageType
    content: string
}

export default class ChatRoomDAO {

    firebaseDB = new FirebaseDatabase()

    async create(users: UserRef[]): Promise<ChatRoomModel> {
        const fbChatRoom = await this.firebaseDB.createChatRoom()

        const chatRoom = new ChatRoom({
            users,
            chatRoomId: fbChatRoom.key
        } as ChatRoomModel)

        await chatRoom.save()
        return ChatRoom.populate(chatRoom, {path: 'users'})
    }

    async get(user: UserModel): Promise<ChatRoomModel[]> {
        return ChatRoom.find({ users: user._id }).populate('users')
    }

    async postMessage(user: UserModel, chatRoomId: string, messageParams: MessageParams): Promise<MessageModel> {
        const chatRoom = await ChatRoom.findOne({ _id: chatRoomId })
        if (!chatRoom) throw new ChatRoomError.ChatRoomNotFound()
        if (!await this.isInChatRoom(user, chatRoom)) throw new ChatRoomError.NotInChatRoom()

        let message = new Message({
            chatRoom: chatRoom._id,
            messageInfo: {
                content: messageParams.content,
                sender: user,
                type: messageParams.type
            }
        } as MessageModel)

        message = await message.save()
        chatRoom.latestMessageInfo = message
        await chatRoom.save()

        return message
    }

    private async isInChatRoom(user: UserModel, chatRoom: ChatRoomModel): Promise<boolean> {
        return !isNullOrUndefined(await chatRoom.users.find((u) => u.equals(user._id)))
    }
}