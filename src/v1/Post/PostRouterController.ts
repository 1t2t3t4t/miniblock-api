import express from 'express'
import Post, {PostContentInfo, PostType, Reaction} from '../../model/Post'
import {authenticate, ensureAuthenticate, EnsureAuthRequest} from '../../middleware'
import {
    DELETE,
    GET,
    Middleware,
    POST,
    PUT,
    RouterController,
    SubRouterControllers
} from "../../framework/annotation-restapi";
import CommentRouterController from '../Comment/CommentRouterController'
import PostDAO from "../../common/PostDAO";

const HTTPResponse = require('../../model/HTTPResponse');

interface PostRequest extends EnsureAuthRequest {
    body: {
        content: PostContentInfo,
        title: string,
        categoryId: number,
        type: PostType
    }
}

interface GetPostRequest extends EnsureAuthRequest {
    params: {
        postId: string
    }
}

interface ReactionRequest extends EnsureAuthRequest {
    body: {
        reaction: Reaction
    }
}

@RouterController('/')
@SubRouterControllers([
    CommentRouterController
])
export default class PostRouterController {

    postDAO = new PostDAO()

    /**
     * @api {POST} /v1/post Create Post
     * @apiDescription Create post. client has to send content that relates to type
     * @apiGroup Post
     * @apiPermission loggedIn
     *
     * @apiHeader {String} Authorization Token string from Firebase
     *
     * @apiParamExample
     * body: {
     *     content: {
     *          link | text | image: String
     *     },
     *     title: String,
     *     type: Enum ("link" | "text" | "image")
     *     categoryId: Int
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

        this.postDAO.createPost(creator, content, type, title, categoryId).then((post) => {
            res.status(200).send(new HTTPResponse.Response({ post }))
        }).catch((e) => {
            res.status(500)
            next(e)
        })
    }

    @GET('/:postId')
    @Middleware(authenticate)
    async getPost(req: GetPostRequest, res: express.Response, next: express.NextFunction) {
        const interactor = req.user
        const postId = req.params.postId

        try {
            const post = await this.postDAO.getPost(postId, interactor)
            res.status(200).send(new HTTPResponse.Response({ post }))
        } catch (e) {
            res.status(400)
            console.log(e)
            next(e)
        }
    }

    @DELETE('/:postId')
    @Middleware(ensureAuthenticate)
    async deletePost(req: GetPostRequest, res: express.Response, next: express.NextFunction) {
        const interactor = req.user!
        const postId = req.params.postId

        try {
            const post = await this.postDAO.deletePost(postId, interactor)
            res.status(200).send(new HTTPResponse.Response({ post }))
        } catch (e) {
            res.status(400)
            next(e)
        }
    }

    /**
     * @api {PUT} /post/:id/reaction Like post
     * @apiDescription Like the post with the given id
     * @apiGroup Post
     * @apiPermission loggedIn
     *
     * @apiParam {Reaction} reaction The reaction for the post [like, none]
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

        if (!reaction) {
            res.status(400).send(new HTTPResponse.ErrorResponse('No reaction in body'))
            return
        }

        try {
            const post = await Post.findById(req.params.id)
            if (!post) throw('Post does not exists')

            try {
                post.setReaction(interactor, reaction)
            } catch (e) {
                res.status(200).send(new HTTPResponse.Response({ message: e.message }))
                return
            }

            const savedPost = await post.save()
            res.status(200).send(new HTTPResponse.Response({ post: savedPost }))
        } catch (e) {
            res.status(500)
            next(e)
        }
    }

}