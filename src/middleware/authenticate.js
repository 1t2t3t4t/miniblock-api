const User = require('../model/User')
const admin = require('firebase-admin')
const utils = require('../utils/VerifyIdToken')
const {ErrorResponse} = require('../model/HTTPResponse')

/**
 * @apiDefine loggedIn Logged In user
 * Every logged in user has to send auth token
 * */

/**
 * @api {GET} / Authenticate
 * @apiDescription This one is for every request that require authentication. Could be for any HTTP verb
 * @apiGroup How to authenticate
 *
 * @apiHeader {String} Authorization Token string from Firebase
 * @apiHeaderExample {json} Header-Example:
 *     {
 *       "Authorization": "Bearer SOME_VALID_TOKEN"
 *     }
 *
 * @apiError MissingAuthToken Error with message Require Authorization.
 * @apiError InvalidAuthHeader Error with message Invalid Auth Header.
 * @apiError InvalidAuthToken Error indicates token could be expired or invalid token.
 *
 * */
const authenticate = (req, res, next) => {
    const authToken = req.headers.authorization

    if (!authToken) next(Error('Require Authorization.'))
    const slicedAuthToken = authToken.split(' ')
    if (slicedAuthToken[0] !== 'Bearer' || !slicedAuthToken[1]) {
        next(Error('Invalid Auth Header.'))
    }
    const token = slicedAuthToken[1]

    utils.verifyIdToken(token)
        .then((decodedToken) => User.findByUID(decodedToken.uid))
        .then((user) => {
            if (!user) {
                throw Error('User is null or not found.')
            }

            req.user = user
            req.token = token
            next()
        })
        .catch((e) => {
            res.status(401)
            next(e)
        })
}

module.exports = {
    authenticate
}