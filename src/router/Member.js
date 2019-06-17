const express = require('express')
const authenticate = require('@middleware/authenticate')
const User = require('@model/User')
const Message = require('@model/Message')
const { Response } = require('@model/HTTPResponse')

const route = express.Router()

route.get('/getUserDetails', authenticate, (req, res) => {
	res.status(200).send(new Response(req.user))
})

route.post('/saveMessage', authenticate, async (req, res, next) => {
	const user = req.user
	const message = req.body.message
	const ownerID = req.user._id
	const messageModel = await Message.create({ message, ownerID }) 
	let messageList = req.user.messageList
	if (!messageList) {
		messageList = []
	}

	messageList.push(messageModel._id)
	user.messageList = messageList
	req.user.save().then(() => {
		res.status(200).send(new Response({ user }))
	}).catch((e) => {
		res.status(500)
		next(e)
	})
})

route.post('/getMessageList', authenticate, async (req, res, next) => {
	const user = req.user
	User.findOne({ _id: user._id })
	.select('messageList')
	.populate('messageList')
	.then((messageList) => {
		res.status(200).send(new Response(messageList))
	})
})

module.exports = route