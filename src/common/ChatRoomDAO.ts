import {UserModel, UserRef} from "../model/User";
import {FirebaseDBModel} from "../model/Firebase";
import ChatRoom, {ChatRoomModel} from "../model/ChatRoom";
import FirebaseDatabase from "./FirebaseDatabase";

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
}