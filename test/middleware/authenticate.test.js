import User from '../../src/model/User'
import {authenticate, ensureAuthenticate} from '../../src/middleware'

const assert = require('assert')
const request = require('supertest')
const utils = require('../../src/utils/VerifyIdToken')

const DBManager = require('../DBManager')

const dbManager = new DBManager()

const CORRECT_TOKEN = 'validtoken'

const oriVerifyIdToken = utils.verifyIdToken

describe('The middleware ensures that request has a valid token before perform action', () => {
    
    before((next) => {
        /**
         * Stub verifyIdToken
         */
        utils.verifyIdToken = async (token) => {
            if (token === CORRECT_TOKEN) {
                return {
                    uid: '1'
                }
            } else {
                throw Error('Whatever error returned from actual firebase-admin')
            }
        }
        dbManager.start().then(() => {
            next()
        })
    })

    after(() => {
        dbManager.stop()
        utils.verifyIdToken = oriVerifyIdToken
    })

    it('should add user to request if success', (done) => {
        const req = {
            headers: {
                authorization: 'Bearer ' + CORRECT_TOKEN
            }
        }
        const res = {
            status: (code) => {
                console.log(code)
            }
        }

        const next = (error) => {
            if (error) {
                throw Error('does not expect error')
            }

            assert.notDeepEqual(req.user, undefined)
            done()
        }

        ensureAuthenticate(req, res, next)
    })

    it('should add user to request if success for optional auth', (done) => {
        const req = {
            headers: {
                authorization: 'Bearer ' + CORRECT_TOKEN
            }
        }
        const res = {
            status: (code) => {
                console.log(code)
            }
        }

        const next = (error) => {
            if (error) {
                throw Error('does not expect error')
            }

            assert.notDeepEqual(req.user, undefined)
            done()
        }

        authenticate(req, res, next)
    })

    it('should allow pass if no headers for optional auth', (done) => {
        const req = {

        }

        const res = {
            status: (code) => {
                console.log(code)
            }
        }

        const next = (error) => {
            if (error) {
                throw Error('does not expect error')
            }

            assert.deepEqual(req.user, undefined)
            done()
        }

        authenticate(req, res, next)
    })

    it('should allow pass no auth headers for optional auth', (done) => {
        const req = {
            headers: {

            }
        }

        const res = {
            status: (code) => {
                console.log(code)
            }
        }

        const next = (error) => {
            if (error) {
                throw Error('does not expect error')
            }

            assert.deepEqual(req.user, undefined)
            done()
        }

        authenticate(req, res, next)
    })

    it('should error if invalid token for optional auth', (done) => {
        const req = {
            headers: {
                authorization: 'Bearer ' + 'superinvalidtoken'
            }
        }
        const res = {
            status: (code) => {
                assert.deepEqual(code, 401)
            }
        }

        const next = (error) => {
            if (error) {
                assert.deepEqual(req.user, undefined)
                assert.deepEqual(error.message, 'Whatever error returned from actual firebase-admin')
                done()
                return
            }

            throw Error('expect error')
        }
        authenticate(req, res, next)
    })

    it('should check correct token format for optional auth', (done) => {
        const req = {
            headers: {
                authorization: CORRECT_TOKEN
            }
        }
        const res = {
            status: (code) => {
                assert.deepEqual(code, 401)
            }
        }

        const next = (error) => {
            if (error) {
                assert.deepEqual(req.user, undefined)
                assert.deepEqual(error.message, 'Invalid Auth Header.')
                done()
                return
            }

            throw Error('expect error')
        }
        authenticate(req, res, next)
    })

    it('should error if invalid token', (done) => {
        const req = {
            headers: {
                authorization: 'Bearer ' + 'superinvalidtoken'
            }
        }
        const res = {
            status: (code) => {
                assert.deepEqual(code, 401)
            }
        }

        const next = (error) => {
            if (error) {
                assert.deepEqual(req.user, undefined)
                assert.deepEqual(error.message, 'Whatever error returned from actual firebase-admin')
                done()
                return
            }

            throw Error('expect error')
        }
        ensureAuthenticate(req, res, next)
    })

    it('should check correct token format', (done) => {
        const req = {
            headers: {
                authorization: CORRECT_TOKEN
            }
        }
        const res = {
            status: (code) => {
                assert.deepEqual(code, 401)
            }
        }

        const next = (error) => {
            if (error) {
                assert.deepEqual(req.user, undefined)
                assert.deepEqual(error.message, 'Invalid Auth Header.')
                done()
                return
            }

            throw Error('expect error')
        }
        ensureAuthenticate(req, res, next)
    })

    it('should check for empty auth', (done) => {
        const req = {
            headers: {}
        }
        const res = {
            status: (code) => {
                assert.deepEqual(code, 401)
            }
        }

        const next = (error) => {
            if (error) {
                assert.deepEqual(req.user, undefined)
                assert.deepEqual(error.message, 'Require Authorization.')
                done()
                return
            }

            throw Error('expect error')
        }
        ensureAuthenticate(req, res, next)
    })
})

