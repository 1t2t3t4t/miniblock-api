import express, {Router} from 'express'
import {UserModel} from '../../model/User'
import Post, {PostType} from '../../model/Post'

const HTTPResponse = require('../../model/HTTPResponse');
const auth = require('../../middleware/authenticate')

interface PostRequest extends express.Request {
    user?: UserModel
    body: {
        content: string,
        title: string,
        categoryId: number,
        type: PostType
    }
}

export default class PostRouterController {

    router: Router

    constructor(router: Router) {
        this.router = router
        this.registerRoute()
    }

    private registerRoute() {
        this.router.post('/', auth.authenticate, this.post.bind(this))
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
    post(req: PostRequest, res: express.Response, next: express.NextFunction) {
        const creator = req.user
        const { content, title, type, categoryId } = req.body

        const post = new Post({
            creator,
            content,
            type,
            title,
            categoryId
        })

        post.save().then(() => {
            res.status(200).send(new HTTPResponse.Response({ post }))
        }).catch((e) => {
            res.status(500)
            next(e)
        })
    }

}