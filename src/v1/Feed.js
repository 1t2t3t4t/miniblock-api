const express = require('express')
const Post = require('@model/Post')
const { Response } = require('@model/HTTPResponse')

const router = express.Router()

/**
 * @api {GET} /feed/all Get All Feed
 * @apiDescription Fetch all posts
 * @apiGroup Feed
 *
 * @apiSuccess {[Post]} posts Array of post
 * */
router.get('/all', (req, res, next) => {
    Post.find({}).then((posts) => {
        res.status(200).send(new Response({ posts }))
    }).catch((e) => {
        res.status(500)
        next(e)
    })
})


module.exports = router