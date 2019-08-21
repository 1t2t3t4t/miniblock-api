import admin from 'firebase-admin'

type Ref = admin.database.Reference;

export default class FirebaseDatabase {

    chatRoom(): Ref {
        return admin.database().ref('ChatRoom')
    }

}