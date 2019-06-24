const User = require('../model/User')
const { ErrorResponse } = require('../model/HTTPResponse')

const authenticate = (req, res, next) => {
    const token = req.headers.authorization
    User.findByAuthToken(token).then((user) => {
        if (!user) {
            return Promise.reject('User is null or not found.')
        }

        req.user = user
        req.token = token
        next()
    }).catch((e) => {
        res.status(401)
        next(e)
    })
}

module.exports = authenticate