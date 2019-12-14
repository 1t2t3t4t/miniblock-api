import {GET, Middleware, RouterController} from "../../framework/annotation-restapi"
import express from "express"
import Post from '../../model/Post'
import FeedManager, {FeedSortType} from "../../common/FeedManager";
import {authenticate, EnsureAuthRequest} from "../../middleware";

const HTTPResponse = require('../../model/HTTPResponse');

export interface FeedQueryRequest extends EnsureAuthRequest {
    query: {
        limit?: number,
        page?: string,
        category?: string,
        sortType: FeedSortType
    }
}

export interface FeedSearchQueryRequest extends EnsureAuthRequest {
    query: {
        limit?: number,
        page?: string,
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
     * @apiHeader {String} [Authorization] Token string from Firebase to set like status
     *
     * @apiParam {string} [afterId] Add query to fetch feed that is after the input id
     * @apiParam {int} [limit] Set limit of fetching
     * @apiParam {int} [category] Set to filter for specific category
     * @apiParam {SortType} [sortType] Set sort type of feed whether by 'new' or 'top'
     *
     * @apiParamExample Querystring example
     * v1/feed/all?afterId=[ID]&limit=10&category=1&sortType=new
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
     *         category: Int
     *         createdAt: Date
     *         updatedAt: Date
     *     }
     * ]
     * */
    @GET('/all')
    @Middleware(authenticate)
    all(req: FeedQueryRequest, res: express.Response, next: express.NextFunction) {
        const { sortType, limit, page, category } = req.query
        
        this.feedManager.getAll(limit, Number(page), category, sortType, req.user)
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
     * @apiHeader {String} [Authorization] Token string from Firebase to set like status
     *
     * @apiParam {string} keyword Keyword used for searching the posts
     * @apiParam {string} [afterId] Add query to fetch feed that is after the input id
     * @apiParam {int} [limit] Set limit of fetching
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
     *         category: Int
     *         createdAt: Date
     *         updatedAt: Date
     *     }
     * ]
     * */
    @GET('/search')
    @Middleware(authenticate)
    async search(req: FeedSearchQueryRequest, res: express.Response, next: express.NextFunction) {
        const { limit, page, keyword } = req.query

        this.feedManager.search(keyword, limit, Number(page), req.user)
            .then((posts) => {
            res.status(200).send(new HTTPResponse.Response({ posts }))
        }).catch((e) => {
            res.status(500)
            next(e)
        })
    }

}