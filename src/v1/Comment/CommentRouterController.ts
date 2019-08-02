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

    @GET('/')
    async get(req: CommentRequest, res: Response, next: NextFunction) {
        try {
            const comments = await this.commentDAO.getAll(req.params.postId)
            res.status(200).send(new HTTPResponse.Response({ comments }))
        } catch (e) {
            res.status(500)
        }
    }

    @POST('/')
    @Middleware(ensureAuthenticate)
    async addComment(req: CreateCommentRequest, res: Response, next: NextFunction) {
        const user = req.user!
        try {
            const comment = await this.commentDAO.createComment(req.params.postId, user, req.body.text)
            res.status(200).send(new HTTPResponse.Response({ comment }))
        } catch (e) {
            res.status(500)
        }
    }

}