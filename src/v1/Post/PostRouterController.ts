import express, {Router} from 'express'
import {UserModel, UserRef} from '../../model/User'
import Post, {PostContentInfo, PostType, Reaction} from '../../model/Post'
import {ensureAuthenticate, EnsureAuthRequest} from '../../middleware'
import {GET, Middleware, POST, PUT, RouterController} from "../../framework/annotation-restapi";
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

interface ReactionRequest extends EnsureAuthRequest {
    body: {
        reaction: Reaction
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

    /**
     * @api {POST} /post/:id/like Like post
     * @apiDescription Like the post with the given id
     * @apiGroup Post
     * @apiPermission loggedIn
     *
     * @apiHeader {String} Authorization Token string from Firebase
     *
     * @apiSuccess {Post} post Post model
     *
     * */
    @PUT('/:id/reaction')
    @Middleware(ensureAuthenticate)
    async reaction(req: ReactionRequest, res: express.Response, next: express.NextFunction) {
        const interactor = req.user!
        const reaction = req.body.reaction

        try {
            const post = await Post.findById(req.params.id)
            if (!post) throw('Post does not exists')
            post.setInteractor(interactor)

            switch (reaction) {
                case Reaction.like:
                    if (post.likeInfo.isLiked) {
                        res.status(200).send(new HTTPResponse.Response({ message: 'User already liked' }))
                        return
                    }

                    post.likeInfo.like.push(interactor)
                    break
                case Reaction.none:
                    if (!post.likeInfo.isLiked) {
                        res.status(200).send(new HTTPResponse.Response({ message: 'User did not like the post' }))
                        return
                    }

                    post.likeInfo.like = post.likeInfo.like.filter((liker) => {
                        return !(liker as mongoose.Types.ObjectId).equals(interactor._id)
                    })
                    break
            }

            const savedPost = await post.save()
            res.status(200).send(new HTTPResponse.Response({ post: savedPost }))
        } catch (e) {
            res.status(500)
            next(e)
        }
    }

}