import User from '../../src/model/User'
const assert = require('assert')
const request = require('supertest')
const app = require('../../server')

const DBManager = require('../DBManager')

const dbManager = new DBManager()

describe('POST v1/account/register', () => {

    before((next) => {
        dbManager.start().then(() => {
            const stubUser = new User({
                email: 'test@email.com',
                displayName: 'username',
                uid: "1"
            })
            stubUser.save().then(() => {
                return User.ensureIndexes()
            }).then(() => {
                next()
            }).catch((e) => {
                console.log(e)
            })
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
