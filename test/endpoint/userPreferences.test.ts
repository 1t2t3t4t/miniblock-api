import AppTestManager from "../AppTestManager";
import assert from "assert";
import {UserModel} from "../../src/model/User";
import {UserPreferencesModel} from "../../src/model/UserPreferences";

const DBManager = require('../DBManager')

describe('UserPreferences Path', () => {
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

    it('update userPreferences', (done) => {
        const path = '/v1/account/userPreferences'
        manager.agent
            .put(path)
            .set(validHeaderToken)
            .send({
                showInDiscovery: false
            })
            .expect(200)
            .expect((res: Response) => {
                assert.notDeepEqual(res.body, undefined)
                const body: any = res.body!
                assert.notDeepEqual(body.body.userPref, undefined)
                const userPref: UserPreferencesModel = body.body.userPref
                assert.deepEqual(userPref.showInDiscovery, false)
                assert.deepEqual(userPref.userId, dbManager.defaultUser._id.toString())
            }).end(done)
    })

    it('get default userPreferences', (done) => {
        const path = '/v1/account/userPreferences'
        manager.agent
            .get(path)
            .set(validHeaderToken)
            .expect(200)
            .expect((res: Response) => {
                assert.notDeepEqual(res.body, undefined)
                const body: any = res.body!
                assert.notDeepEqual(body.body.userPref, undefined)
                const userPref: UserPreferencesModel = body.body.userPref
                assert.deepEqual(userPref.showInDiscovery, false)
                assert.deepEqual(userPref.userId, dbManager.defaultUser._id.toString())
            }).end(done)
    })
})