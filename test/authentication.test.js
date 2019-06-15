const assert = require('assert')
const request = require('supertest')
const mocha = require('mocha')
const app = require('../server')

const User = require('@model/User')

beforeEach((next) => {
    User.deleteMany({}).then(() => {
        next()
    }).catch((err) => {

    })
})

describe('POST /auth/login', () => {
    it('should return 400 if email or password is undefined', (done) => {
        request(app)
            .post('/auth/login')
            .expect(400)
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
                assert(res.body.token !== undefined)
            })
            .end(done)
    })
})

