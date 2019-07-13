const assert = require('assert')
const request = require('supertest')
const authenticate = require('@middleware/authenticate')
const utils = require('@utils/VerifyIdToken')

let User = null

const dbManager = require('../DBManager')

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

const CORRECT_TOKEN = 'validtoken'


/**
 * Stub verifyIdToke
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

describe('The middleware ensures that request has a valid token before perform action', () => {
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
                console.log(error)
                throw Error('does not expect error')
            }

            assert.notDeepEqual(req.user, undefined)
            assert.deepEqual(req.token, CORRECT_TOKEN)
            done()
        }
        authenticate(req, res, next)
    })

    it('should check correct token format', (done) => {
        const req = {
            headers: {
                authorization: CORRECT_TOKEN
            }
        }
        const res = {
            status: (code) => {
                console.log(code)
            }
        }

        const next = (error) => {
            if (error) {
                assert.deepEqual(req.user, undefined)
                assert.deepEqual(req.token, undefined)
                assert.deepEqual(error.message, 'Invalid Auth Header.')
                done()
            }

            throw Error('expect error')
        }
        authenticate(req, res, next)
    })

    it('should check for empty auth', (done) => {
        const req = {
            headers: {}
        }
        const res = {
            status: (code) => {
                console.log(code)
            }
        }

        const next = (error) => {
            if (error) {
                assert.deepEqual(req.user, undefined)
                assert.deepEqual(req.token, undefined)
                assert.deepEqual(error.message, 'Require Authorization.')
                done()
            }

            throw Error('expect error')
        }
        authenticate(req, res, next)
    })
})

