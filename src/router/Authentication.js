const express = require('express')
const User = require('@model/User')
const { ErrorResponse, Response } = require('@model/HTTPResponse')

const route = express.Router()

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

route.post('/register', async (req, res) => {
    const { email, username, password, uid } = req.body

    let user = new User({ email, username, password, uid })

    user.save().then(async (token) => {
        res.send(new Response({'message': 'Register successfully', user}))
    }).catch((e) => {
        res.status(400).send(new ErrorResponse(e.message))
    })
})

module.exports = route