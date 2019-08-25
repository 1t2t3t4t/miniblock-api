import {UserRef} from "../model/User";
import {FirebaseDBModel} from "../model/Firebase";
import ChatRoom, {ChatRoomModel} from "../model/ChatRoom";
import FirebaseDatabase from "./FirebaseDatabase";

export default class ChatRoomDAO {

    firebaseDB = new FirebaseDatabase()

    async create(users: UserRef[]) {
        const fbChatRoom = await this.firebaseDB.createChatRoom()

        const chatRoom = new ChatRoom({
            users,
            chatRoomId: fbChatRoom.key
        } as ChatRoomModel)

        return chatRoom.save()
    }
}