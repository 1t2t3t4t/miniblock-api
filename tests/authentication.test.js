const assert = require('assert')
const request = require('supertest')
const app = require('../server')

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