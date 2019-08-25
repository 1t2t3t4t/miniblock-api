import admin from 'firebase-admin'
import {FirebaseDBModel} from "../model/Firebase";

type Ref = admin.database.Reference;

enum DBRef {
    Chatroom = 'ChatRoom'
}

export default class FirebaseDatabase {

    getRef(ref: DBRef): Ref {
        return admin.database().ref(ref)
    }

    createChatRoom(): Promise<Ref> {
        const fbChatRoomModel = new FirebaseDBModel.ChatRoom()
        return this.getRef(DBRef.Chatroom).push(fbChatRoomModel)
    }

}