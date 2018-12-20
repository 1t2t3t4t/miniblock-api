const express = require('express')
const bodyParser = require('body-parser')
const mongoose = require('./src/db/mongoose')

const Authentication = require('./src/router/Authentication')
const authenticate = require('./src/middleware/authenticate')

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