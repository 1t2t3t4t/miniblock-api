const express = require('express')
const User = require('../model/User')

const route = express.Router()

route.post('/login', (req, res) => {
    const email = req.body.email
    const password = req.body.password

    User.findByEmailPassword(email, password).then((user) => {
        if (!user) { return res.status(400).send('User not found.') }
        return user.generateAuthToken()
    }).then((token) => {
        res.header({ 'Authorization' : `Bearer ${token}` }).send('Successfully login')
    }).catch((e) => {
        res.status(400).send(e)
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
        res.header({ 'Authorization' : `Bearer ${token}` }).send(user)
    }).catch((e) => {
        res.status(400).send(e)
    })
})

module.exports = route