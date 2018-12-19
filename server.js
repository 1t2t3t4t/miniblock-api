const express = require('express')
const bodyParser = require('body-parser')
const mongoose = require('./db/mongoose')

const Authentication = require('./router/Authentication')
const authentication = require('./middleware/authentication')
const User = require('./model/User')

const port = process.env.PORT || 3000

let app = express()

app.use(bodyParser.json())

app.get('/', authentication, (req, res) => {
    res.send(`Hello World ${req.user.username}`)
});

app.use('/auth', Authentication)

app.listen(port, () => {
    console.log('Server started on port', port)
})
