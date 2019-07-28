import express, {Router} from 'express'
import {UserModel} from '../../model/User'
import Post, {PostContentInfo, PostType} from '../../model/Post'
import {ensureAuthenticate} from '../../middleware'
import {Middleware, POST, RouterController} from "../../framework/annotation-restapi";

const HTTPResponse = require('../../model/HTTPResponse');

interface PostRequest extends express.Request {
    user?: UserModel
    body: {
        content: PostContentInfo,
        title: string,
        categoryId: number,
        type: PostType
    }
}

@RouterController('/')
export default class PostRouterController {

    /**
     * @api {POST} /post Create Post
     * @apiDescription Create post. client has to send content that relates to type
     * @apiGroup Post
     * @apiPermission loggedIn
     *
     * @apiHeader {String} Authorization Token string from Firebase
     *
     * @apiParamExample
     * body: {
     *     content: {
     *          link | text | image: string
     *     },
     *     title: string,
     *     type: string ("link" | "text" | "image")
     *     categoryId: int
     * }
     *
     * @apiSuccess {Post} post Post model
     *
     * */
    @POST('/')
    @Middleware(ensureAuthenticate)
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