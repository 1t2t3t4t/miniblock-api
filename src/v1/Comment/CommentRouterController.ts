import {GET, Middleware, POST, RouterController} from "../../framework/annotation-restapi";
import {NextFunction, Request, Response} from "express";
import {ensureAuthenticate, EnsureAuthRequest} from "../../middleware";
import CommentDAO from "../../common/CommentDAO";
const HTTPResponse = require("../../model/HTTPResponse");


interface CommentRequest extends Request {
    params: {
        postId: string
    }
}

interface CreateCommentRequest extends EnsureAuthRequest {
    params: {
        postId: string
    }
    body: {
        text: string
    }
}

@RouterController('/:postId/comment')
export default class CommentRouterController {

    commentDAO = new CommentDAO()

    /**
     * @api {GET} /v1/post/:postId/comment Get all comment
     * @apiDescription Fetch all comments from given post
     * @apiGroup Comment
     *
     *
     * @apiSuccess {Comment[]} comments Array of comment model
     * @apiSuccessExample Comment Model
     * comments:  [
     * {
     *     post: PostRef,
     *     creator: UserRef,
     *     content: {
     *         text: String
     *     },
     *     createdAt: Date
     * }
     * ]
     *
     * */
    @GET('/')
    async get(req: CommentRequest, res: Response, next: NextFunction) {
        try {
            const comments = await this.commentDAO.getAll(req.params.postId)
            res.status(200).send(new HTTPResponse.Response({ comments }))
        } catch (e) {
            res.status(500)
            next(e)
        }
    }

    /**
     * @api {POST} /v1/post/:postId/comment Create comment
     * @apiDescription Add comment to the given post
     * @apiGroup Comment
     * @apiPermission loggedIn
     *
     * @apiHeader {String} Authorization Token string from Firebase
     *
     * @apiParamExample
     * body: {
     *     text: string
     * }
     *
     * @apiSuccess {Comment} comment Comment model
     * @apiSuccessExample Comment Model
     * {
     *     post: PostRef,
     *     creator: UserRef,
     *     content: {
     *         text: String
     *     },
     *     createdAt: Date
     * }
     *
     * */
    @POST('/')
    @Middleware(ensureAuthenticate)
    async addComment(req: CreateCommentRequest, res: Response, next: NextFunction) {
        const user = req.user!
        try {
            const comment = await this.commentDAO.createComment(req.params.postId, user, req.body.text)
            res.status(200).send(new HTTPResponse.Response({ comment }))
        } catch (e) {
            res.status(500)
            next(e)
        }
    }

}