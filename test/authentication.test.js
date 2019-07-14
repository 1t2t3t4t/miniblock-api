const assert = require('assert')
const request = require('supertest')
const app = require('../server')

let User = null

const dbManager = require('./DBManager')

before((next) => {
    dbManager.start().then(() => {
        User = require('@model/User')
        const stubUser = new User({
            email: 'test@email.com',
            username: 'username',
            uid: "1"
        })
        stubUser.save().then(() => {
            return User.ensureIndexes()
        }).then(() => {
            next()
        })
    })
})

after(() => {
    dbManager.stop()
})

describe('POST v1/auth/register', () => {
    const path = '/v1/account/register'
    it('should return 200 and token if register successfully', (done) => {
        request(app)
            .post(path)
            .send({
                'email': 'test@test.com',
                'username': 'tester',
                'password': '123456',
                'uid': '2'
            })
            .expect(200)
            .expect((res) => {
                assert(res.body.body !== undefined)
            })
            .end(done)
    })

    it('should return 400 if user already exist', (done) => {
        request(app)
            .post(path)
            .send({
                'email': 'test@email.com',
                'username': 'tester',
                'password': '123456',
                'uid': '3'
            })
            .expect(400)
            .expect((res) => {
                assert(res.body.status == 'error')
                assert(res.body.body.message.includes('duplicate key'))
            })
            .end(done)
    })
})