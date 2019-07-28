import {GET, Middleware, RouterController} from "../../framework/annotation-restapi"
import express from "express"
import Post, {PostModel, PostType} from '../../model/Post'
import {DocumentQuery} from "mongoose";
import User from "../../model/User";
import {Category} from "../../model/Categories";
import FeedManager from "../../common/FeedManager";
import {authenticate, EnsureAuthRequest} from "../../middleware";

const HTTPResponse = require('../../model/HTTPResponse');

export interface FeedQueryRequest extends EnsureAuthRequest {
    query: {
        limit?: number,
        afterId?: string,
        categoryId?: string
    }
}

export interface FeedSearchQueryRequest extends EnsureAuthRequest {
    query: {
        limit?: number,
        afterId?: string,
        keyword: string
    }
}

@RouterController('/')
export default class FeedRouterController {

    feedManager = new FeedManager(Post)

    /**
     * @api {GET} v1/feed/all Get All Feed
     * @apiDescription Fetch all posts
     * @apiGroup Feed
     *
     * @apiParam {string} [afterId] Add query to fetch feed that is after the input id
     * @apiParam {int} [limit] Set limit of fetching ** default value is 10
     * @apiParam {int} [categoryId] Set to filter for specific categoryId
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
    @Middleware(authenticate)
    all(req: FeedQueryRequest, res: express.Response, next: express.NextFunction) {
        const { limit, afterId, categoryId } = req.query
        if (categoryId && isNaN(Number(categoryId))) {
            console.log(categoryId, Number(categoryId))
            res.status(400)
            res.send( new HTTPResponse.ErrorResponse('invalid categoryId (should be number)') )
            return
        }

        const category = Number(categoryId)

        this.feedManager.getAll(limit, afterId, category, req.user)
            .then((posts) => {
                res.status(200).send(new HTTPResponse.Response({ posts }))
            }).catch((e) => {
                res.status(500)
                next(e)
            })
    }

    /**
     * @api {GET} v1/feed/search Search posts with title
     * @apiDescription Get posts that its title contains the keyword.
     * @apiGroup Search
     *
     * @apiParam {string} keyword Keyword used for searching the posts
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
    @GET('/search')
    @Middleware(authenticate)
    async search(req: FeedSearchQueryRequest, res: express.Response, next: express.NextFunction) {
        const { limit, afterId, keyword } = req.query

        this.feedManager.search(keyword, limit, afterId, req.user)
            .then((posts) => {
            res.status(200).send(new HTTPResponse.Response({ posts }))
        }).catch((e) => {
            res.status(500)
            next(e)
        })
    }

    async wait() {
        return new Promise((resolve, reject) => {
            setTimeout(resolve, 100)
        })
    }

    @GET('/stub')
    async stub(req: express.Request, res: express.Response, next: express.NextFunction) {
        const creator = await User.findByUID('1')

        for(let i=0;i<100;i++) {
            console.log('at', i)

            const post = new Post({
                creator,
                content: {
                    text: "test " + i
                },
                type: PostType.TEXT,
                title: "title" + i,
                categoryId: Category.Depression
            })
            await post.save()
        }

        res.status(200).send('DONE')
    }
}