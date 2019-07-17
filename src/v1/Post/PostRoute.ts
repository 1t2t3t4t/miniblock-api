import express, {Router} from 'express'
import {UserModel} from '../../model/User'
import Post from '../../model/Post'

const HTTPResponse = require('../../model/HTTPResponse');
const auth = require('../../middleware/authenticate')

interface AuthenticatedRequest extends express.Request {
    user?: UserModel
}

export default class PostRouterController {

    router: Router

    constructor(router: Router) {
        this.router = router
        this.registerRoute()
    }

    private registerRoute() {
        this.router.post('/post', auth.authenticate, this.post.bind(this))
    }

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
    post(req: AuthenticatedRequest, res: express.Response, next: express.NextFunction) {
        const user = req.user
        const content = req.body.content

        const post = new Post({
            creator: user,
            content: content
        })

        post.save().then(() => {
            res.status(200).send(new HTTPResponse.Response({ post }))
        }).catch((e) => {
            res.status(500)
            next(e)
        })
    }

}