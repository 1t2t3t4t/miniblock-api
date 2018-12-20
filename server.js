const express = require('express')
const bodyParser = require('body-parser')
const mongoose = require('./db/mongoose')

const Authentication = require('./router/Authentication')
const authenticate = require('./middleware/authenticate')
const User = require('./model/User')

const port = process.env.PORT || 3000

let app = express()

app.use(bodyParser.json())

app.get('/', authenticate, (req, res) => {
    res.send(`Hello World ${req.user.username}`)
});

app.use('/auth', Authentication)

module.exports = app.listen(port, () => {
    console.log('Server started on port', port)
})