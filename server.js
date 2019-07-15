const express = require('express')
const bodyParser = require('body-parser')
const mongoose = require('./src/db/mongoose')
const admin = require('firebase-admin')

const v1 = require('./src/v1')

const { ErrorResponse } = require('./src/model/HTTPResponse')

const port = process.env.PORT || 3000

let app = express()

const serviceAccount = require("./lovesick-react-firebase-adminsdk-vndcv-1c91db8e2f.json");

admin.initializeApp({
	credential: admin.credential.cert(serviceAccount),
	databaseURL: "https://lovesick-react.firebaseio.com"
});

app.use(bodyParser.json())
app.use((req, res, next) => {
	console.log('path', req.url, req.method)
	console.log('body', req.body)
	console.log('headers', req.headers)
	next()
})

app.use('/v1', v1)

app.use(function (err, req, res, next) {
	console.log('---ERROR---')
	console.log(err)
  	const error = new ErrorResponse(err.message)
  	res.send(error)
})

app.use('/pg', require('./playground/Firebase'))

module.exports = app.listen(port, () => {
    console.log('Server started on port', port)
})