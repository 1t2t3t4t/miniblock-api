import {UserRef} from "../model/User";
import admin from 'firebase-admin'
import {FirebaseDBModel} from "../model/Firebase";
import ChatRoom, {ChatRoomModel} from "../model/ChatRoom";

export default class ChatRoomDAO {

    chatRoomFirebase: admin.database.Reference = admin.database().ref('ChatRoom')

    async create(users: UserRef[]) {
        const fbChatRoomModel = new FirebaseDBModel.ChatRoom()
        const fbChatRoom = await this.chatRoomFirebase.push(fbChatRoomModel)

        const chatRoom = new ChatRoom({
            users,
            chatRoomId: fbChatRoom.key
        } as ChatRoomModel)

        return chatRoom.save()
    }
}