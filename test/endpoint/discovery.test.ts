import AppTestManager from "../AppTestManager";
import assert from 'assert'
import {LocationInfo} from "../../src/model/Location";
import User, {Gender, UserModel} from "../../src/model/User";
import DiscoveryManager from "../../src/common/DiscoveryManager";
import {Category} from "../../src/model/Categories";
import {CurrentFeeling} from "../../src/model/CurrentFeeling";
import FriendRequest, {FriendRequestModel, FriendRequestStatus} from "../../src/model/FriendRequest";

const DBManager = require('../DBManager')

describe('Discovery endpoint', () => {

    describe('Update currentLocation', () => {

        const dbManager = new DBManager()
        const manager = new AppTestManager()
        const path = '/v1/discovery/currentLocation'

        before((done) => {
            dbManager.start().then((done))
        })

        after(() => {
            dbManager.stop()
        })

        it('update currentLocation', (done) => {
            const longitude = 69
            const latitude = 45

            manager.agent
                .put(path)
                .set(dbManager.authHeader)
                .send({
                    longitude, latitude
                })
                .expect(200)
                .expect((res) => {
                    const locationInfo: LocationInfo = res.body.body.updatedLocation
                    assert.notDeepEqual(locationInfo, undefined)
                    assert.deepEqual(locationInfo.coordinates, [longitude, latitude])
                })
                .end(done)
        })

        it('failed update currentLocation with invalid geo', (done) => {
            const longitude = 999
            const latitude = 999

            manager.agent
                .put(path)
                .set(dbManager.authHeader)
                .send({
                    longitude, latitude
                })
                .expect(500)
                .expect((res) => {
                    const message: string = res.body.body.message
                    assert(message.includes('Invalid coordinates values'), 'should get correct msg')
                })
                .end(done)
        })
    })

    describe('Get user from discover', () => {

        const dbManager = new DBManager()
        const manager = new AppTestManager()
        const path = '/v1/discovery'

        const users: UserModel[] = []

        before( async () => {
            await dbManager.start()
            users.push({
                uid: "2",
                email: "a@a.com",
                displayName: "2",
                age: 20,
                gender: Gender.MALE,
                currentFeeling: [CurrentFeeling.Relationships],
                discoveryInfo: {
                    currentLocation: {
                        coordinates: [69, 45]
                    },
                },
                userPrefInfo: {
                    showInDiscovery: true
                }
            } as UserModel)
            users.push({
                uid: "3",
                email: "a@b.com",
                age: 60,
                displayName: "3",
                gender: Gender.MALE,
                currentFeeling: [CurrentFeeling.Loneliness, CurrentFeeling.Relationships],
                discoveryInfo: {
                    currentLocation: {
                        coordinates: [69.5, 45.5]
                    }
                },
                userPrefInfo: {
                    showInDiscovery: true
                }
            } as UserModel)
            users.push({
                uid: "4",
                email: "a@c.com",
                displayName: "4",
                age: 20,
                gender: Gender.FEMALE,
                currentFeeling: [CurrentFeeling.Loneliness],
                discoveryInfo: {
                    currentLocation: {
                        coordinates: [180, 90]
                    }
                },
                userPrefInfo: {
                    showInDiscovery: true
                }
            } as UserModel)
            // Case user does not allow discovery
            users.push({
                uid: "5",
                email: "b@c.com",
                displayName: "5",
                age: 20,
                gender: Gender.OTHER,
                currentFeeling: [CurrentFeeling.Relationships],
                userPrefInfo: {
                    showInDiscovery: false
                }
            } as UserModel)
            // Case user allows discovery but has no location
            users.push({
                uid: "6",
                email: "a@def.com",
                displayName: '6',
                age: 20,
                gender: Gender.FEMALE,
                currentFeeling: [CurrentFeeling.Loneliness],
                userPrefInfo: {
                    showInDiscovery: true
                }
            } as UserModel)
            // Case user allows discovery but has location
            users.push({
                uid: "7",
                email: "b@cefs.com",
                displayName: "7",
                age: 20,
                gender: Gender.OTHER,
                currentFeeling: [CurrentFeeling.Relationships],
                discoveryInfo: {
                    currentLocation: {
                        coordinates: [69.5, 45.5]
                    }
                },
                userPrefInfo: {
                    showInDiscovery: false
                }
            } as UserModel)
            await User.insertMany(users)
        })

        after(() => {
            dbManager.stop()
        })

        it('get users with no location throw error', (done) => {
            manager.agent
                .get(path + '?currentFeeling=3')
                .set(dbManager.authHeader)
                .expect(500)
                .expect((res) => {
                    assert.deepEqual(res.body.body.message, 'User has no location')
                })
                .end(done)
        })

        it('get users with no currentFeeling', async () => {
            const dis = new DiscoveryManager()
            await dis.updateLocation(dbManager.defaultUser, 0, 0)
            await User.ensureIndexes()
            await manager.agent
                .get(path)
                .set(dbManager.authHeader)
                .expect(400)
                .expect((res) => {
                    const msg: string = res.body.body.message
                    assert.deepEqual(msg, 'Invalid or empty currentFeeling')
                })
        })

        it('get users with currentFeeling', async () => {
            const dis = new DiscoveryManager()
            await dis.updateLocation(dbManager.defaultUser, 0, 0)
            await User.ensureIndexes()
            await manager.agent
                .get(path + '?currentFeeling=' + Category.Relationships)
                .set(dbManager.authHeader)
                .expect(200)
                .expect((res) => {
                    const u: UserModel[] = res.body.body.users
                    assert.deepEqual(u.length, 2)
                    assert(u[0].currentFeeling.includes(CurrentFeeling.Relationships))
                    assert.deepEqual(u[0].uid, "2")

                    assert(u[1].currentFeeling.includes(CurrentFeeling.Relationships))
                    assert.deepEqual(u[1].uid, "3")
                })
        })

        it('get users with currentFeeling and max distance', async () => {
            const dis = new DiscoveryManager()
            await dis.updateLocation(dbManager.defaultUser, 0, 0)
            await User.ensureIndexes()
            await manager.agent
                .get(path + '?currentFeeling=' + Category.Relationships + '&maxDistance=8400')
                .set(dbManager.authHeader)
                .expect(200)
                .expect((res) => {
                    const u: UserModel[] = res.body.body.users
                    assert.deepEqual(u.length, 1)
                    assert(u[0].currentFeeling.includes(CurrentFeeling.Relationships))
                    assert.deepEqual(u[0].uid, "2")
                })
        })

        it('get users with gender filters', async () => {
            const dis = new DiscoveryManager()
            await dis.updateLocation(dbManager.defaultUser, 0, 0)
            await User.ensureIndexes()
            await manager.agent
                .get(path + '?currentFeeling=' + Category.Loneliness + '&gender=female')
                .set(dbManager.authHeader)
                .expect(200)
                .expect((res) => {
                    const u: UserModel[] = res.body.body.users
                    assert.deepEqual(u.length, 1)
                    assert(u[0].currentFeeling.includes(CurrentFeeling.Loneliness))
                    assert.deepEqual(u[0].gender, Gender.FEMALE)
                    assert.deepEqual(u[0].uid, "4")
                })
        })

        it('get users with minAge', async () => {
            const dis = new DiscoveryManager()
            await dis.updateLocation(dbManager.defaultUser, 0, 0)
            await User.ensureIndexes()
            await manager.agent
                .get(path + '?currentFeeling=' + Category.Relationships + '&minAge=50')
                .set(dbManager.authHeader)
                .expect(200)
                .expect((res) => {
                    const u: UserModel[] = res.body.body.users
                    assert.deepEqual(u.length, 1)
                    assert(u[0].currentFeeling.includes(CurrentFeeling.Relationships))
                    assert.deepEqual(u[0].uid, "3")
                })
        })

        it('get users with maxAge', async () => {
            const dis = new DiscoveryManager()
            await dis.updateLocation(dbManager.defaultUser, 0, 0)
            await User.ensureIndexes()
            await manager.agent
                .get(path + '?currentFeeling=' + Category.Relationships + '&maxAge=24')
                .set(dbManager.authHeader)
                .expect(200)
                .expect((res) => {
                    const u: UserModel[] = res.body.body.users
                    assert.deepEqual(u.length, 1)
                    assert(u[0].currentFeeling.includes(CurrentFeeling.Relationships))
                    assert.deepEqual(u[0].uid, "2")
                })
        })
    })

    describe('Like user', () => {

        const dbManager = new DBManager()
        const manager = new AppTestManager()

        let user: UserModel

        before( async () => {
            await dbManager.start()
            user = {
                uid: "2",
                email: "a@a.com",
                displayName: "2",
                gender: Gender.MALE,
                currentFeeling: [CurrentFeeling.Relationships],
                discoveryInfo: {
                    currentLocation: {
                        coordinates: [69, 45]
                    },
                },
                userPrefInfo: {
                    showInDiscovery: true
                }
            } as UserModel
            user = await new User(user).save()

            await FriendRequest.ensureIndexes()
        })

        after(() => {
            dbManager.stop()
        })

        it('can like user', async () => {
            const path = `/v1/discovery/${user._id.toHexString()}/like`
            await manager.agent
                .post(path)
                .set(dbManager.authHeader)
                .expect(200)
                .expect((res) => {
                    const friendRequest: FriendRequestModel = res.body.body.friendRequest
                    assert.deepEqual(friendRequest.status, FriendRequestStatus.Pending)
                    assert.deepEqual(friendRequest.requestedUser, user._id.toHexString())
                    assert.deepEqual((friendRequest.user as UserModel)._id, dbManager.defaultUser._id.toHexString())
                })
        })

        it('cannot like dup request', async () => {
            const path = `/v1/discovery/${user._id.toHexString()}/like`
            await manager.agent
                .post(path)
                .set(dbManager.authHeader)
                .expect(500)
                .expect((res) => {
                    const message = res.body.body.message as string
                    assert(message.includes('duplicate key error dup key'), 'Get dup message')
                })
        })
    })
})
