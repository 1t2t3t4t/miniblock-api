import request from 'supertest'
import server = require('../../server')
import assert from 'assert'

describe('test RouterController', () => {
    it('should get successful to RouterController', (done) => {
        request(server)
            .get('/test/endpoint')
            .expect(200)
            .expect((res) => {
                assert.deepEqual('TestRouterController', res.body.name)
            }).end(done)
    })

    it('should post successful to RouterController', (done) => {
        const body = {
            name: 'body',
            something: {
                hi: 1
            }
        }
        request(server)
            .post('/test/endpoint')
            .send(body)
            .expect(200)
            .expect((res) => {
                assert.deepEqual('TestRouterController', res.body.name)
                assert.deepEqual(body, res.body.body)
            }).end(done)
    })
})

describe('test SubRouterController endpoint', () => {
    it('should get successful to SubRouterController', (done) => {
        request(server)
            .get('/test/1stsubroute/endpoint')
            .expect(200)
            .expect((res) => {
                assert.deepEqual('TestSubRouterController', res.body.name)
            }).end(done)
    })

    it('should post successful to SubRouterController', (done) => {
        const body = {
            name: 'body',
            something: {
                hi: 1
            }
        }
        request(server)
            .post('/test/1stsubroute/endpoint')
            .send(body)
            .expect(200)
            .expect((res) => {
                assert.deepEqual('TestSubRouterController', res.body.name)
                assert.deepEqual(body, res.body.body)
            }).end(done)
    })
})

describe('test SubOfSubRouterController', () => {
    it('should get successful to SubOfSubRouterController', (done) => {
        request(server)
            .get('/test/1stsubroute/2ndsubroute/endpoint')
            .expect(200)
            .expect((res) => {
                assert.deepEqual('TestSubOfSubRouterController', res.body.name)
            }).end(done)
    })

    it('should get successful endpoint with middleware', (done) => {
        request(server)
            .get('/test/1stsubroute/2ndsubroute/endpointMD')
            .expect(200)
            .expect((res) => {
                assert.deepEqual('TestSubOfSubRouterController', res.body.name)
                assert.deepEqual('MIDDLEWARE ADD SOMETHING', res.body.md)
            }).end(done)
    })

    it('should post successful to SubOfSubRouterController', (done) => {
        const body = {
            name: 'body',
            something: {
                hi: 1
            }
        }
        request(server)
            .post('/test/1stsubroute/2ndsubroute/endpoint')
            .send(body)
            .expect(200)
            .expect((res) => {
                assert.deepEqual('TestSubOfSubRouterController', res.body.name)
                assert.deepEqual(body, res.body.body)
            }).end(done)
    })
})