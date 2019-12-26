import {
	register
} from './src/framework/annotation-restapi'
import HelperRouterController from "./src/v1/Helper";
import TestRouterController from './src/framework/annotation-restapi/test-endpoint'
import Analytics from "./src/analytics/Analytics"

const express = require('express')
const bodyParser = require('body-parser')
const mongoose = require('./src/db/mongoose')
const admin = require('firebase-admin')

const v1 = require('./src/v1')

const env = process.env.ENV

const {
	ErrorResponse
} = require('./src/model/HTTPResponse')

const port = process.env.PORT || 3000

let app = express()

const serviceAccount = require("./mini-block-firebase-adminsdk-hearq-8812b8f42b.json")

admin.initializeApp({
	credential: admin.credential.cert(serviceAccount),
	databaseURL: "https://mini-block.firebaseio.com"
})

if (env != "test") {
	app.use(Analytics.shared.logTimeMiddleware.bind(Analytics.shared))
}

app.use(bodyParser.json())
app.use((req, res, next) => {
	res.setHeader('Access-Control-Allow-Origin', '*')
	res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE')
	res.setHeader('Access-Control-Allow-Headers', '*')
	res.setHeader('Access-Control-Allow-Credentials', "true")
	next()
})

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
	app._router.stack.forEach(print.bind(null, []))
	console.log('Server started on port', port)
})

function print(path, layer) {
	if (layer.route) {
		layer.route.stack.forEach(print.bind(null, path.concat(split(layer.route.path))))
	} else if (layer.name === 'router' && layer.handle.stack) {
		layer.handle.stack.forEach(print.bind(null, path.concat(split(layer.regexp))))
	} else if (layer.method) {
		console.log('%s \t\t /%s',
		layer.method.toUpperCase(),
		path.concat(split(layer.regexp)).filter(Boolean).join('/'))
	}
}

function split(thing) {
	if (typeof thing === 'string') {
		return thing.split('/')
	} else if (thing.fast_slash) {
		return ''
	} else {
		var match = thing.toString()
			.replace('\\/?', '')
			.replace('(?=\\/|$)', '$')
			.match(/^\/\^((?:\\[.*+?^${}()|[\]\\\/]|[^.*+?^${}()|[\]\\\/])*)\$\//)
		return match ?
			match[1].replace(/\\(.)/g, '$1').split('/') :
			'<complex:' + thing.toString() + '>'
	}
}