import AppTestManager from "../AppTestManager";
import assert from 'assert'
import {LocationInfo} from "../../src/model/Location";
import User, {Gender, UserModel} from "../../src/model/User";
import DiscoveryManager from "../../src/common/DiscoveryManager";
import {Category} from "../../src/model/Categories";

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
                gender: Gender.MALE,
                currentFeeling: Category.Relationships,
                discoveryInfo: {
                    currentLocation: {
                        coordinates: [69, 45]
                    }
                }
            } as UserModel)
            users.push({
                uid: "3",
                email: "a@b.com",
                displayName: "3",
                gender: Gender.MALE,
                currentFeeling: Category.Loneliness,
                discoveryInfo: {
                    currentLocation: {
                        coordinates: [69.5, 45.5]
                    }
                }
            } as UserModel)
            users.push({
                uid: "4",
                email: "a@c.com",
                displayName: "4",
                gender: Gender.FEMALE,
                currentFeeling: Category.Relationships,
                discoveryInfo: {
                    currentLocation: {
                        coordinates: [180, 90]
                    }
                }
            } as UserModel)
            users.push({
                uid: "5",
                email: "b@c.com",
                displayName: "5",
                gender: Gender.OTHER,
                currentFeeling: Category.Relationships,
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
            await dis.updateLocation(dbManager.defaultUser, [0, 0])
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
            await dis.updateLocation(dbManager.defaultUser, [0, 0])
            await User.ensureIndexes()
            await manager.agent
                .get(path + '?currentFeeling=' + Category.Relationships)
                .set(dbManager.authHeader)
                .expect(200)
                .expect((res) => {
                    const u: UserModel[] = res.body.body.users
                    assert.deepEqual(u.length, 2)
                    assert.deepEqual(u[0].currentFeeling, Category.Relationships)
                    assert.deepEqual(u[0].uid, "2")

                    assert.deepEqual(u[1].currentFeeling, Category.Relationships)
                    assert.deepEqual(u[1].uid, "4")
                })
        })

        it('get users with gender filters', async () => {
            const dis = new DiscoveryManager()
            await dis.updateLocation(dbManager.defaultUser, [0, 0])
            await User.ensureIndexes()
            await manager.agent
                .get(path + '?currentFeeling=' + Category.Relationships + '&gender=male')
                .set(dbManager.authHeader)
                .expect(200)
                .expect((res) => {
                    const u: UserModel[] = res.body.body.users
                    assert.deepEqual(u.length, 1)
                    assert.deepEqual(u[0].currentFeeling, Category.Relationships)
                })
        })
    })
})