import AppTestManager from '../AppTestManager'
import User, {UserModel} from "../../src/model/User";
import assert from 'assert'
const DBManager = require('../DBManager')

const dbManager = new DBManager()
const manager = new AppTestManager()

describe('get user profile', () => {
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