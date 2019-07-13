const User = require('../model/User')
const admin = require('firebase-admin')
const {ErrorResponse} = require('../model/HTTPResponse')


const authenticate = (req, res, next) => {
    const token = req.headers.authorization

    if (!token) throw Error('Require Authorization.')

    admin.auth().verifyIdToken(token)
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

module.exports = authenticate