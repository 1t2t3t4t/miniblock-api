import AppTestManager from "../AppTestManager";
import AccountFacade from "../../src/common/AccountFacade";
import {UserModel} from "../../src/model/User";
import ChatRoom, {ChatRoomModel} from "../../src/model/ChatRoom";
import assert from "assert";
import FriendRequestDAO from "../../src/common/FriendRequestDAO";
import {ObjectID} from "bson";
import ChatRoomDAO, {ChatRoomError} from "../../src/common/ChatRoomDAO";
import Message, {MessageModel, MessageType} from "../../src/model/Message";

const DBManager = require('../DBManager')


describe('Chat endpoints', () => {
    describe('Accept friend request', () => {

        const dbManager = new DBManager()
        const manager = new AppTestManager()
        const account = new AccountFacade()
        const chatRoomDAO = new ChatRoomDAO()
        const path = '/v1/chats'

        let user: UserModel
        let chat: ChatRoomModel

        let userB: UserModel
        let chatB: ChatRoomModel

        before( async () => {
            await dbManager.start()
            user = await account.register('a@a.com', 'a', 'a')
            chat = await chatRoomDAO.create([user, dbManager.defaultUser])
            userB = await account.register('b@b.com', 'b', 'b')
            chatB = await chatRoomDAO.create([userB, dbManager.defaultUser])
        })

        after(() => {
            dbManager.stop()
        })

        it('correctly query chatRoom', async () => {
            return manager.agent
                .get(path)
                .set(dbManager.authHeader)
                .expect(200)
                .expect((res) => {
                    const chatRooms = res.body.body.chatRooms as ChatRoomModel[]
                    assert.deepEqual(chatRooms.length, 2)
                    assert.deepEqual(chatRooms[0]._id, chat._id.toString())
                    assert.deepEqual(chatRooms[1]._id, chatB._id.toString())
                    assert.deepEqual(chatRooms[0].users.length, 2)
                    const users = res.body.body.chatRooms[0].users as UserModel[]
                    const userIds = users.map((user) => user._id.toString())
                    assert(userIds.includes(dbManager.defaultUser._id.toString()), 'Contains user 1')
                    assert(userIds.includes(user._id.toString()), 'Contains user 2')
                })
        })

        it('sort chatRoom by latestMessage', async () => {
            const messageParams = {
                content: 'content',
                type: MessageType.TEXT
            }

            await manager.agent
                .get(path)
                .set(dbManager.authHeader)
                .expect(200)
                .expect((res) => {
                    const chatRooms = res.body.body.chatRooms as ChatRoomModel[]
                    assert.deepEqual(chatRooms.length, 2)
                    assert.deepEqual(chatRooms[0]._id, chat._id.toString())
                    assert.deepEqual(chatRooms[1]._id, chatB._id.toString())
                })

            await chatRoomDAO.postMessage(dbManager.defaultUser, chatB._id.toString(), messageParams)

            await manager.agent
                .get(path)
                .set(dbManager.authHeader)
                .expect(200)
                .expect((res) => {
                    const chatRooms = res.body.body.chatRooms as ChatRoomModel[]
                    assert.deepEqual(chatRooms.length, 2)
                    assert.deepEqual(chatRooms[0]._id, chatB._id.toString())
                    assert.deepEqual(chatRooms[0].latestMessageInfo.messageInfo.type, MessageType.TEXT)
                    assert.deepEqual(chatRooms[0].latestMessageInfo.messageInfo.content, 'content')
                    assert.deepEqual(chatRooms[1]._id, chat._id.toString())
                })
        })
    })

    describe('Post message', () => {

        const dbManager = new DBManager()
        const manager = new AppTestManager()
        const account = new AccountFacade()
        const chatRoomDAO = new ChatRoomDAO()
        const path = '/v1/chats/message'

        let user: UserModel
        let chat: ChatRoomModel

        before( async () => {
            await dbManager.start()
            user = await account.register('a@a.com', 'a', 'a')
            chat = await chatRoomDAO.create([user, dbManager.defaultUser])
        })

        after(() => {
            dbManager.stop()
        })

        it('error if chatRoom does not exists', async () => {
            const randomChatRoomId = new ObjectID()
            return manager.agent
                .post(path)
                .set(dbManager.authHeader)
                .send({
                    chatRoomId: randomChatRoomId.toHexString(),
                    type: MessageType.TEXT,
                    content: 'content'
                })
                .expect(500)
                .expect((res) => {
                    const message = res.body.body.message as string
                    assert.deepEqual(message, new ChatRoomError.ChatRoomNotFound().message)
                })
        })

        it('error if user is not in the chatroom', async () => {
            const randomChatRoom = new ChatRoom({
                users: [new ObjectID(), new ObjectID()],
                chatRoomId: "1234"
            } as ChatRoomModel)
            await randomChatRoom.save()

            return manager.agent
                .post(path)
                .set(dbManager.authHeader)
                .send({
                    chatRoomId: randomChatRoom._id.toHexString(),
                    type: MessageType.TEXT,
                    content: 'content'
                })
                .expect(500)
                .expect((res) => {
                    const message = res.body.body.message as string
                    assert.deepEqual(message, new ChatRoomError.NotInChatRoom().message)
                })
        })

        it('can post message if valid', async () => {
            let messageId!: string
            await manager.agent
                .post(path)
                .set(dbManager.authHeader)
                .send({
                    chatRoomId: chat._id.toHexString(),
                    type: MessageType.TEXT,
                    content: 'content'
                })
                .expect(200)
                .expect((res) => {
                    const chatRoom = res.body.body.chatRoom as ChatRoomModel
                    assert.deepEqual(chatRoom._id, chat._id.toString())
                    assert.deepEqual(chatRoom.latestMessageInfo.messageInfo.type, MessageType.TEXT)
                    assert.deepEqual(chatRoom.latestMessageInfo.messageInfo.content, 'content')
                    assert.deepEqual((chatRoom.latestMessageInfo.messageInfo.sender as UserModel)._id, dbManager.defaultUser._id.toString())
                    messageId = chatRoom.latestMessageInfo._id.toString()
                })
            const message = await Message.findById(messageId)
            assert.notDeepEqual(message, undefined)
            assert.deepEqual(message!.messageInfo.type, MessageType.TEXT)
            assert.deepEqual(message!.messageInfo.content, 'content')
            assert.deepEqual((message!.messageInfo.sender as UserModel)._id.toHexString(), dbManager.defaultUser._id.toString())
        })
    })
})