const express = require('express')
const authenticate = require('@middleware/authenticate')
const Post = require('@model/Post')
const { Response } = require('@model/HTTPResponse')

const router = express.Router()

router.post('/create', authenticate, (req, res, next) => {
    const user = req.user
    const content = req.body.content

    const post = new Post({
        creator: user,
        content: content
    })

    post.save().then(() => {
        res.status(200).send(new Response({ post }))
    }).catch((e) => {
        res.status(500)
        next(e)
    })
})

module.exports = router