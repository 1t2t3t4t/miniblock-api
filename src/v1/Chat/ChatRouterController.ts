import {GET, Middleware, RouterController} from "../../framework/annotation-restapi";
import {ensureAuthenticate} from "../../middleware";
import {FeedQueryRequest} from "../Feed/FeedRouterController";
import express from 'express'
import ChatRoomDAO from "../../common/ChatRoomDAO";

const HTTPResponse = require('../../model/HTTPResponse');

@RouterController('/')
export default class ChatRouterController {

    chatRoomDAO = new ChatRoomDAO()

    /**
     * @api {GET} /v1/chats Get chats
     * @apiDescription Get all of user's chats
     * @apiGroup Chat
     * @apiPermission loggedIn
     *
     * @apiHeader {String} Authorization Token string from Firebase
     *
     * @apiSuccess {ChatRoom[]} chatRooms ChatRoom array model
     *
     * */
    @GET('/')
    @Middleware(ensureAuthenticate)
    all(req: FeedQueryRequest, res: express.Response, next: express.NextFunction) {
        this.chatRoomDAO.get(req.user!)
            .then((chatRooms) => {
                res.status(200).send(new HTTPResponse.Response({ chatRooms }))
            }).catch((e) => {
                res.status(500)
                next(e)
            })
    }
}