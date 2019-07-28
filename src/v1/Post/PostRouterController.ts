import express, {Router} from 'express'
import {UserModel} from '../../model/User'
import Post, {PostContentInfo, PostType} from '../../model/Post'
import {ensureAuthenticate, EnsureAuthRequest} from '../../middleware'
import {GET, Middleware, POST, RouterController} from "../../framework/annotation-restapi";
import * as mongoose from "mongoose";

const HTTPResponse = require('../../model/HTTPResponse');

interface PostRequest extends EnsureAuthRequest {
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
        const creator = req.user!
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

    @POST('/:id/like')
    @Middleware(ensureAuthenticate)
    async like(req: PostRequest, res: express.Response, next: express.NextFunction) {
        const interactor = req.user!
        try {
            const post = await Post.findById(req.params.id)
            if (!post) throw('Post does not exists')

            const likes = post.likeInfo.like
            const userInLike = likes.find((like) => (like as mongoose.Types.ObjectId).equals(interactor._id))

            if(userInLike) {
                res.status(500).send(new HTTPResponse.Response({ message: 'User already liked' }))
                return
            }

            likes.push(interactor)
            post.likeInfo.like = likes
            const savedPost = await post.save()
            res.status(200).send(new HTTPResponse.Response({ post: savedPost }))
        } catch (e) {
            res.status(500)
            next(e)
        }
    }

}