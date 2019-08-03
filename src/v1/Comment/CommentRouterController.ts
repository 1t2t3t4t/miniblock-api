import {GET, Middleware, POST, RouterController} from "../../framework/annotation-restapi";
import {NextFunction, Request, Response} from "express";
import {ensureAuthenticate, EnsureAuthRequest} from "../../middleware";
import CommentDAO from "../../common/CommentDAO";
import {CommentModel} from "../../model/Comment";
const HTTPResponse = require("../../model/HTTPResponse");


interface CommentRequest extends Request {
    params: {
        postId: string
    }
    query: {
        parent?: string
    }
}

interface CreateCommentRequest extends EnsureAuthRequest {
    params: {
        postId: string
    }
    body: {
        parent?: string
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
     * @apiParam {String} [parent] Id of the parent comment to get subComments
     *
     * @apiSuccess {Comment[]} comments Array of comment model
     * @apiSuccessExample Comment Model
     * comments:  [
     * {
     *     post: PostRef,
     *     parent?: CommentRef,
     *     creator: UserRef,
     *     content: {
     *         text: String
     *     },
     *     createdAt: Date,
     *     subCommentInfo: {
     *         comments: [CommentRef],
     *         count: number
     *     }
     * }
     * ]
     *
     * */
    @GET('/')
    async get(req: CommentRequest, res: Response, next: NextFunction) {
        const { postId } = req.params
        const { parent } = req.query
        try {
            const comments = await this.commentDAO.getAll(postId, parent)
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
     * @apiParam {String} text Content of comment
     * @apiParam {String} [parent] Id of the parent comment to get subComments
     *
     * @apiParamExample
     * body: {
     *     text: string,
     *     parent?: string
     * }
     *
     * @apiSuccess {Comment} comment Comment model
     * @apiSuccessExample Comment Model
     * {
     *     post: PostRef,
     *     parent?: CommentRef,
     *     creator: UserRef,
     *     content: {
     *         text: String
     *     },
     *     createdAt: Date,
     *     subCommentInfo: {
     *         comments: [CommentRef],
     *         count: number
     *     }
     * }
     *
     * */
    @POST('/')
    @Middleware(ensureAuthenticate)
    async addComment(req: CreateCommentRequest, res: Response, next: NextFunction) {
        const user = req.user!
        const { parent, text } = req.body
        try {
            let comment: CommentModel
            if (parent) {
                comment = await this.commentDAO.createSubComment(req.params.postId, parent, user, text)
            } else {
                comment = await this.commentDAO.createComment(req.params.postId, user, text)
            }

            res.status(200).send(new HTTPResponse.Response({ comment }))
        } catch (e) {
            res.status(500)
            next(e)
        }
    }

}