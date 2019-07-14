const express = require('express')
const authenticate = require('@middleware/authenticate')
const Post = require('@model/Post')
const { Response } = require('@model/HTTPResponse')

const router = express.Router()

/**
 * @api {POST} /post/create Create Post
 * @apiDescription Create post. Dont know what to more than this.
 * @apiGroup Post
 * @apiPermission loggedIn
 *
 * @apiHeader {String} Authorization Token string from Firebase
 *
 * @apiParam {String} content Content of the post
 *
 * @apiSuccess {Post} post Post model
 *
 * */
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