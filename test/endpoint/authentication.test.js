import User from '../../src/model/User'
const assert = require('assert')
const request = require('supertest')
const app = require('../../server')

const DBManager = require('../DBManager')

const dbManager = new DBManager()

describe('POST v1/account/register', () => {

    before((next) => {
        dbManager.start().then(() => {
            next()
        }).catch((e) => {
            console.log(e)
        })
    })

    after(() => {
        dbManager.stop()
    })
    
    const path = '/v1/account/register'
    it('should return 200 and token if register successfully', (done) => {
        request(app)
            .post(path)
            .send({
                'email': 'test@test.com',
                'displayName': 'tester',
                'uid': '2'
            })
            .expect(200)
            .expect((res) => {
                assert(res.body.body !== undefined)
                assert(res.body.body.user !== undefined)
                assert(res.body.body.user.discoveryInfo.currentLocation === null)
                assert.deepEqual(res.body.body.user.anonymousInfo.displayName, 'txxxr')
            })
            .end(done)
    })

    it('should return 200 if user already exist', (done) => {
        request(app)
            .post(path)
            .send({
                'email': 'test@email.com',
                'displayName': 'tester',
                'uid': '3'
            })
            .expect(200)
            .expect((res) => {
                assert(res.body.body !== undefined)
            })
            .end(done)
    })

    it('should return 400 if user field is not mathch requirements', (done) => {
        request(app)
            .post(path)
            .send({
                'email': 'test@email.com',
                'displayName': 'tester',
            })
            .expect(400)
            .expect((res) => {
                assert(res.body.body.message === 'User validation failed: uid: Path `uid` is required.')
            })
            .end(done)
    })
})
