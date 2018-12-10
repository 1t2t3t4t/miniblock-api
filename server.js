const express = require('express')
const bodyParser = require('body-parser')
const mongoose = require('./db/mongoose')

const authentication = require('./router/authentication')
const User = require('./model/User')

const port = process.env.PORT || 3000

let app = express()

app.use(bodyParser.json())

app.get('/', async (req, res) => {
    try {
        const user = await User.findByAuthToken(req.headers.authorization)
        res.send(`Hello World ${user.username}`)
    } catch(e) {
        console.log(e)
        res.status(403).send(e)
    }
});

app.use('/auth', authentication)

app.listen(port, () => {
    console.log('Server started on port', port)
})
