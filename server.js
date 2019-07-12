const express = require('express')
const bodyParser = require('body-parser')
const mongoose = require('./src/db/mongoose')

const { ErrorResponse } = require('@model/HTTPResponse')

const Authentication = require('@router/Authentication')
const Member = require('@router/Member')
const Post = require('@router/Post')
const authenticate = require('@middleware/authenticate')

const port = process.env.PORT || 3000

let app = express()

app.use(bodyParser.json())

app.get('/', authenticate, (req, res) => {
    res.send(`Hello World ${req.user.username}`)
});

app.use('/auth', Authentication)
app.use('/member', Member)
app.use('/post', Post)

app.use(function (err, req, res, next) {
	console.log('---ERROR---')
	console.log(err)
  	const error = new ErrorResponse(err.message)
  	res.send(error)
})

module.exports = app.listen(port, () => {
    console.log('Server started on port', port)
})