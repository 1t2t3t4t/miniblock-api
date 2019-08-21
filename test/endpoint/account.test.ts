import AppTestManager from '../AppTestManager'
import User, {Gender, UserModel} from "../../src/model/User";
import assert from 'assert'
import {Category} from "../../src/model/Categories";
const DBManager = require('../DBManager')

describe('get user profile', () => {
    const dbManager = new DBManager()
    const manager = new AppTestManager()

    before((next) => {
        dbManager.start().then(() => {
            next()
        }).catch((e: Error) => {
            console.log(e)
        })
    })

    after(() => {
        dbManager.stop()
    })

    const validHeaderToken = { 'authorization': 'Bearer admin'}

    it('get correct user profile if token valid', (done) => {
        const path = '/v1/account/profile'
        manager.agent
            .get(path)
            .set(validHeaderToken)
            .expect(200)
            .expect((res: Response) => {
                assert.notDeepEqual(res.body, undefined)
                const body: any = res.body!
                assert.notDeepEqual(body.body.user, undefined)
                const user: UserModel = body.body.user
                assert.deepEqual(user.email, 'test@email.com')
                assert.deepEqual(user.displayName, 'username')
                assert.deepEqual(user.uid, '1')
                assert.deepEqual(user.displayImageInfo, undefined)
                assert.deepEqual(user.userPrefInfo.showInDiscovery, false)
                assert.deepEqual(user.gender, Gender.UNSPECIFIED)
                assert.deepEqual(user.currentFeeling, undefined)
            }).end(done)
    })

    it('error if token invalid', (done) => {
        const path = '/v1/account/profile'
        manager.agent
            .get(path)
            .set({ authorization: 'Bearer randomtoken'})
            .expect(401)
            .expect((res: Response) => {
                assert.notDeepEqual(res.body, undefined)
                const body: any = res.body!
                assert.deepEqual(body.status, 'error')
            }).end(done)
    })
})

describe('save user profile', () => {
    const dbManager = new DBManager()
    const manager = new AppTestManager()

    before((next) => {
        dbManager.start().then(() => {
            next()
        }).catch((e: Error) => {
            console.log(e)
        })
    })

    after(() => {
        dbManager.stop()
    })

    const validHeaderToken = { 'authorization': 'Bearer admin'}

    it('save empty body should not mutate existing profile', (done) => {
        const path = '/v1/account/profile'
        manager.agent
            .patch(path)
            .set(validHeaderToken)
            .send({})
            .expect(200)
            .expect((res: Response) => {
                assert.notDeepEqual(res.body, undefined)
                const body: any = res.body!
                assert.notDeepEqual(body.body.user, undefined)
                const user: UserModel = body.body.user
                assert.deepEqual(user.email, 'test@email.com')
                assert.deepEqual(user.displayName, 'username')
                assert.deepEqual(user.anonymousInfo.displayName, 'uxxxe')
                assert.deepEqual(user.uid, '1')
                assert.deepEqual(user.displayImageInfo, undefined)
                assert.deepEqual(user.userPrefInfo.showInDiscovery, false)
            }).end(done)
    })

    it('save name profile', (done) => {
        const path = '/v1/account/profile'
        manager.agent
            .patch(path)
            .set(validHeaderToken)
            .send({ displayName: 'myNewName'})
            .expect(200)
            .expect((res: Response) => {
                assert.notDeepEqual(res.body, undefined)
                const body: any = res.body!
                assert.notDeepEqual(body.body.user, undefined)
                const user: UserModel = body.body.user
                assert.deepEqual(user.email, 'test@email.com')
                assert.deepEqual(user.displayName, 'myNewName')
                assert.deepEqual(user.anonymousInfo.displayName, 'mxxxe')
                assert.deepEqual(user.uid, '1')
                assert.deepEqual(user.displayImageInfo, undefined)
                assert.deepEqual(user.userPrefInfo.showInDiscovery, false)
            }).end(done)
    })

    it('save image profile', (done) => {
        const path = '/v1/account/profile'
        manager.agent
            .patch(path)
            .set(validHeaderToken)
            .send({ image: 'https://somepic.jpg'})
            .expect(200)
            .expect((res: Response) => {
                assert.notDeepEqual(res.body, undefined)
                const body: any = res.body!
                assert.notDeepEqual(body.body.user, undefined)
                const user: UserModel = body.body.user
                assert.deepEqual(user.email, 'test@email.com')
                assert.deepEqual(user.displayName, 'myNewName')
                assert.deepEqual(user.uid, '1')
                assert.notDeepEqual(user.displayImageInfo, undefined)
                assert.deepEqual(user.displayImageInfo!.image, 'https://somepic.jpg')
                assert.deepEqual(user.userPrefInfo.showInDiscovery, false)
            }).end(done)
    })

    it('save show in discovery', (done) => {
        const path = '/v1/account/profile'
        manager.agent
            .patch(path)
            .set(validHeaderToken)
            .send({ showInDiscovery: true })
            .expect(200)
            .expect((res: Response) => {
                assert.notDeepEqual(res.body, undefined)
                const body: any = res.body!
                assert.notDeepEqual(body.body.user, undefined)
                const user: UserModel = body.body.user
                assert.deepEqual(user.email, 'test@email.com')
                assert.deepEqual(user.displayName, 'myNewName')
                assert.deepEqual(user.uid, '1')
                assert.notDeepEqual(user.displayImageInfo, undefined)
                assert.deepEqual(user.displayImageInfo!.image, 'https://somepic.jpg')
                assert.deepEqual(user.userPrefInfo.showInDiscovery, true)
            }).end(done)
    })

    it('save gender and currentFeelings in discovery', (done) => {
        const path = '/v1/account/profile'
        manager.agent
            .patch(path)
            .set(validHeaderToken)
            .send({
                gender: Gender.FEMALE,
                currentFeeling: Category.Relationships
            })
            .expect(200)
            .expect((res: Response) => {
                assert.notDeepEqual(res.body, undefined)
                const body: any = res.body!
                assert.notDeepEqual(body.body.user, undefined)
                const user: UserModel = body.body.user
                assert.deepEqual(user.email, 'test@email.com')
                assert.deepEqual(user.displayName, 'myNewName')
                assert.deepEqual(user.uid, '1')
                assert.notDeepEqual(user.displayImageInfo, undefined)
                assert.deepEqual(user.displayImageInfo!.image, 'https://somepic.jpg')
                assert.deepEqual(user.userPrefInfo.showInDiscovery, true)
                assert.deepEqual(user.gender, Gender.FEMALE)
                assert.deepEqual(user.currentFeeling, Category.Relationships)
            }).end(done)
    })

    it('error if token invalid', (done) => {
        const path = '/v1/account/profile'
        manager.agent
            .patch(path)
            .set({ authorization: 'Bearer randomtoken'})
            .expect(401)
            .expect((res: Response) => {
                assert.notDeepEqual(res.body, undefined)
                const body: any = res.body!
                assert.deepEqual(body.status, 'error')
            }).end(done)
    })
})