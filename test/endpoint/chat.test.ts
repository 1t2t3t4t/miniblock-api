import AppTestManager from "../AppTestManager";
import AccountFacade from "../../src/common/AccountFacade";
import {UserModel} from "../../src/model/User";
import {ChatRoomModel} from "../../src/model/ChatRoom";
import assert from "assert";

const DBManager = require('../DBManager')


describe('Chat endpoints', () => {
    describe('Accept friend request', () => {

        const dbManager = new DBManager()
        const manager = new AppTestManager()
        const facade = new AccountFacade()
        const path = '/v1/chats'

        let user: UserModel
        let chat: ChatRoomModel

        before( async () => {
            await dbManager.start()
            user = await facade.register('a@a.com', 'a', 'a')
            const friendRequest = await facade.createFriendRequest(user, dbManager.defaultUser._id.toString())
            chat = await facade.friendRequestAccept(friendRequest._id.toString())
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
                    assert.deepEqual(chatRooms.length, 1)
                    assert.deepEqual(chatRooms[0].users.length, 2)
                    const users = res.body.body.chatRooms[0].users as UserModel[]
                    const userIds = users.map((user) => user._id.toString())
                    assert(userIds.includes(dbManager.defaultUser._id.toString()), 'Contains user 1')
                    assert(userIds.includes(user._id.toString()), 'Contains user 2')
                })
        })
    })
})