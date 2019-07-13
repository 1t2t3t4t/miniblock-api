const express = require('express')
const User = require('@model/User')
const { ErrorResponse, Response } = require('@model/HTTPResponse')

const route = express.Router()

/**
 * @api {POST} /auth/login Login
 * @apiDeprecated Dont really know if we need this or not so keep it just in case.
 * @apiName Register
 * @apiGroup Authentication
 *
 * @apiParam {String} uid           Users unique ID.
 * @apiParam {String} email         Users email.
 * @apiParam {String} username      Username.
 *
 * @apiSuccess {String} message     Successfully message.
 * @apiSuccess {User}   User        User model.
 *
 * @apiError {Error} InternalError error with message
 */
route.post('/login', (req, res) => {
    const email = req.body.email
    const password = req.body.password

    User.findByEmailPassword(email, password).then((user) => {
        if (!user) { throw new Error('Invalid email or password.') }
        return user.generateAuthToken()
    }).then((token) => {
        return res.send(new Response({'token': token}))
    }).catch((e) => {
        res.status(400).send(new ErrorResponse(e.message))
    })
})

/**
 * @api {POST} /auth/register Register
 * @apiDescription Register user from Firebase to the database **Must be called**
 * @apiName Register
 * @apiGroup Authentication
 *
 * @apiParam {String} uid           Users unique ID.
 * @apiParam {String} email         Users email.
 * @apiParam {String} username      Username.
 *
 * @apiSuccess {String} message     Successfully message.
 * @apiSuccess {User}   User        User model.
 *
 * @apiError {Error} InternalError error with message
 */
route.post('/register', async (req, res) => {
    const { email, username, uid } = req.body

    let user = new User({ email, username, uid })

    user.save().then(async (token) => {
        res.send(new Response({'message': 'Register successfully', user}))
    }).catch((e) => {
        res.status(400).send(new ErrorResponse(e.message))
    })
})

module.exports = route