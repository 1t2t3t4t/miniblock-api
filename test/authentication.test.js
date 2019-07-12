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
            password: 'password',
            username: 'username'
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

describe('POST /auth/login', () => {
    it('should return 400 if email or password is undefined', (done) => {
        request(app)
            .post('/auth/login')
            .expect(400)
            .expect((res) => {
                assert(res.body.status == 'error')
                assert(res.body.body.message == 'Invalid email or password.')
            })
            .end(done)
    })

    it('should return 400 if email or password is invalid', (done) => {
        request(app)
            .post('/auth/login')
            .send({
                'email': 'notexisted@email.com',
                'password': 'randompassword'
            })
            .expect(400)
            .expect((res) => {
                assert(res.body.status == 'error')
                assert(res.body.body.message == 'Invalid email or password.')
            })
            .end(done)
    })
})

describe('POST /auth/register', () => {
    it('should return 200 and token if register successfully', (done) => {
        request(app)
            .post('/auth/register')
            .send({
                'email': 'test@test.com',
                'username': 'tester',
                'password': '123456'
            })
            .expect(200)
            .expect((res) => {
                assert(res.body.body.token !== undefined)
            })
            .end(done)
    })

    it('should return 400 if user already exist', (done) => {
        request(app)
            .post('/auth/register')
            .send({
                'email': 'test@email.com',
                'username': 'tester',
                'password': '123456'
            })
            .expect(400)
            .expect((res) => {
                assert(res.body.status == 'error')
                assert(res.body.body.message.includes('duplicate key'))
            })
            .end(done)
    })
})