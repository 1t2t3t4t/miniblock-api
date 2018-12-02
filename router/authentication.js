const express = require('express')

const route = express.Router()

route.get('/login', (req, res) => {
    res.send("You're  trying to login, yeah?")
})

route.get('/register', (req, res) => {
    res.json({
        message : 'Registered'
    })
})

module.exports = route