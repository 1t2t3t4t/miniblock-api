import {GET, RouterController} from "../../framework/annotation-restapi"
import express from "express"
import Post from '../../model/Post'

const HTTPResponse = require('../../model/HTTPResponse');

@RouterController('/')
export default class FeedRouterController {

    /**
     * @api {GET} v1/feed/all Get All Feed
     * @apiDescription Fetch all posts
     * @apiGroup Feed
     *
     * @apiSuccess {[Post]} posts Array of
     * @apiSuccessExample example
     * posts: [
     *     {
     *         like: [User]
     *         dislike: [User]
     *         creator: {
     *             email: String
     *             displayName: String
     *             uid: String
     *         }
     *         content: {
     *             text | link | image: String
     *         }
     *         type: String
     *         title: String
     *         categoryId: Int
     *         createdAt: Date
     *         updatedAt: Date
     *     }
     * ]
     * */
    @GET('/all')
    all(req: express.Request, res: express.Response, next: express.NextFunction) {
        Post.find({}).populate('creator').then((posts) => {
            res.status(200).send(new HTTPResponse.Response({ posts }))
        }).catch((e) => {
            res.status(500)
            next(e)
        })
    }
}