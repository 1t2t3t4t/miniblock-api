import AppTestManager from "../AppTestManager";
import assert from 'assert'
import {LocationInfo} from "../../src/model/Location";
import User, {Gender, UserModel} from "../../src/model/User";
import DiscoveryManager from "../../src/common/DiscoveryManager";
import {Category} from "../../src/model/Categories";
import {CurrentFeeling} from "../../src/model/CurrentFeeling";
import FriendRequest, {FriendRequestModel, FriendRequestStatus} from "../../src/model/FriendRequest";
import AccountFacade from "../../src/common/AccountFacade";
import ChatRoom, {ChatRoomModel} from "../../src/model/ChatRoom";

const DBManager = require('../DBManager')

describe('Friend Request endpoint', () => {

    describe('Get friend request list', () => {

        const dbManager = new DBManager()
        const manager = new AppTestManager()
        const path = '/v1/friendRequests'

        const users: UserModel[] = []

        before( async () => {
            const facade = new AccountFacade()
            await dbManager.start()
            users.push(await facade.register('a@a.com', 'a', 'a'))
            users.push(await facade.register('b@b.com', 'b', 'b'))

            for (let user of users) {
                await facade.createFriendRequest(user, dbManager.defaultUser._id.toString())
            }
        })

        after(() => {
            dbManager.stop()
        })

        it('get correct requests list', (done) => {
            manager.agent
                .get(path)
                .set(dbManager.authHeader)
                .expect(200)
                .expect((res) => {
                    const requests = res.body.body.requests as FriendRequestModel[]
                    assert.deepEqual(requests[0].user, users[0]._id.toString())
                    assert.deepEqual(requests[0].requestedUser, dbManager.defaultUser._id.toString())

                    assert.deepEqual(requests[1].user, users[1]._id.toString())
                    assert.deepEqual(requests[1].requestedUser, dbManager.defaultUser._id.toString())
                })
                .end(done)
        })
    })

    describe('Accept friend request', () => {

        const dbManager = new DBManager()
        const manager = new AppTestManager()
        const facade = new AccountFacade()
        const path = '/v1/friendRequests'

        let user: UserModel
        let friendRequest: FriendRequestModel

        before( async () => {
            await dbManager.start()
        })

        after(() => {
            dbManager.stop()
        })

        it('correctly accept request', async () => {
            user = await facade.register('a@a.com', 'a', 'a')
            friendRequest = await facade.createFriendRequest(user, dbManager.defaultUser._id.toString())

            return manager.agent
                .put(path)
                .set(dbManager.authHeader)
                .send({
                    id: friendRequest._id.toString(),
                    action: FriendRequestStatus.Accept
                })
                .expect(200)
                .expect((res) => {
                    const chatRoom = res.body.body.chatRoom as ChatRoomModel
                    const users = chatRoom.users.map((user) => user.toString())
                    assert(users.includes(user._id.toString()))
                    assert(users.includes(dbManager.defaultUser._id.toString()))
                    assert.notDeepEqual(chatRoom.chatRoomId, undefined)
                })
        })

        it('correctly decline request', async () => {
            user = await facade.register('a@a.com', 'a', 'a')
            friendRequest = await facade.createFriendRequest(user, dbManager.defaultUser._id.toString())

            await manager.agent
                .put(path)
                .set(dbManager.authHeader)
                .send({
                    id: friendRequest._id.toString(),
                    action: FriendRequestStatus.Decline
                })
                .expect(200)
                .expect(async (res) => {
                    const message = res.body.body.message as string
                    assert.deepEqual(message, 'Declined user')
                })
            const requests = await FriendRequest.find({})
            assert.deepEqual(requests.length, 0)
        })
    })

})
