import {GET, RouterController} from "../../framework/annotation-restapi"
import express from "express"
import Post from '../../model/Post'

const HTTPResponse = require('../../model/HTTPResponse');

export interface FeedQueryRequest extends express.Request {
    query: {
        limit?: number,
        afterId?: string
    }
}

@RouterController('/')
export default class FeedRouterController {

    /**
     * @api {GET} v1/feed/all Get All Feed
     * @apiDescription Fetch all posts
     * @apiGroup Feed
     *
     * @apiParam {string} [afterId] Add query to fetch feed that is after the input id
     * @apiParam {int} [limit] Set limit of fetching ** default value is 10
     *
     * @apiSuccess {[Post]} posts Array of post
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
    all(req: FeedQueryRequest, res: express.Response, next: express.NextFunction) {
        const limit = req.query.limit || 10
        const afterId = req.query.afterId

        if (afterId) {
            console.log(afterId)
            Post.find({ _id: { $gt: afterId } }).limit(limit).populate('creator').then((posts) => {
                res.status(200).send(new HTTPResponse.Response({ posts }))
            }).catch((e) => {
                res.status(500)
                next(e)
            })
        } else {
            Post.find({}).populate('creator').then((posts) => {
                res.status(200).send(new HTTPResponse.Response({ posts }))
            }).catch((e) => {
                res.status(500)
                next(e)
            })
        }
    }
}