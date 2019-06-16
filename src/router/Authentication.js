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

route.post('/register', (req, res) => {
    const email = req.body.email
    const username = req.body.username
    const password = req.body.password

    let user = new User({ email, username, password })

    user.save().then(() => {
        return user.generateAuthToken()
    }).then((token) => {
        res.send(new Response({'token': token}))
    }).catch((e) => {
        res.status(400).send(new ErrorResponse(e.message))
    })
})

module.exports = route