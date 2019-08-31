import {register} from './src/framework/annotation-restapi'
import HelperRouterController from "./src/v1/Helper";
import TestRouterController from './src/framework/annotation-restapi/test-endpoint'
import Analytics from "./src/analytics/Analytics"

const express = require('express')
const bodyParser = require('body-parser')
const mongoose = require('./src/db/mongoose')
const admin = require('firebase-admin')

const v1 = require('./src/v1')

const env = process.env.ENV

const { ErrorResponse } = require('./src/model/HTTPResponse')

const port = process.env.PORT || 3000

let app = express()

const serviceAccount = require("./lovesick-react-firebase-adminsdk-vndcv-1c91db8e2f.json");

admin.initializeApp({
	credential: admin.credential.cert(serviceAccount),
	databaseURL: "https://lovesick-react.firebaseio.com"
})

app.use(Analytics.shared.logTimeMiddleware)

app.use(bodyParser.json())
app.use((req, res, next) => {
	if (env != "test") {
		console.log('path', req.url, req.method)
		console.log('body', req.body)
		console.log('headers', req.headers.authorization)
	}
	next()
})

if (env != 'production') {
	register(app, HelperRouterController)
}

if (env == 'test') {
	console.log('REGISTER TEST ROUTE')
	register(app, TestRouterController)
}

app.use('/v1', v1)

app.use(function (err, req, res, next) {
	if (env != 'test') {
		console.log('---ERROR---')
		console.log(err)
	}
	const error = new ErrorResponse(err.message)
  	res.send(error)
})

module.exports = app.listen(port, () => {
    console.log('Server started on port', port)
})