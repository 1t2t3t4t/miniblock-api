import {GET, Middleware, POST, RouterController} from "../../framework/annotation-restapi";
import {ensureAuthenticate, EnsureAuthRequest} from "../../middleware";
import express from 'express'
import ChatRoomDAO from "../../common/ChatRoomDAO";
import {MessageInfo, MessageType} from "../../model/Message";

const HTTPResponse = require('../../model/HTTPResponse');

interface PostChatMessage extends EnsureAuthRequest {
    body: {
        chatRoomId: string
        type: MessageType
        content: string
    }
}

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
    all(req: EnsureAuthRequest, res: express.Response, next: express.NextFunction) {
        this.chatRoomDAO.get(req.user!)
            .then((chatRooms) => {
                res.status(200).send(new HTTPResponse.Response({ chatRooms }))
            }).catch((e) => {
                res.status(500)
                next(e)
            })
    }

    /**
     * @api {POST} /v1/chats/message Post message to chat
     * @apiDescription Post new message to chat
     * @apiGroup Chat
     * @apiPermission loggedIn
     *
     * @apiHeader {String} Authorization Token string from Firebase
     *
     * @apiParam {String} chatRoomId Id of chatRoom
     * @apiParam {String} type Type of message (currently only have text)
     * @apiParam {String} content Content of the message
     *
     * @apiSuccess {ChatRoom} chatRoom ChatRoom model with latestMessageInfo
     *
     * */
    @POST('/message')
    @Middleware(ensureAuthenticate)
    postMessage(req: PostChatMessage, res: express.Response, next: express.NextFunction) {
        const user = req.user!
        this.chatRoomDAO.postMessage(user, req.body.chatRoomId, req.body)
            .then((chatRoom) => {
                res.status(200).send(new HTTPResponse.Response({ chatRoom }))
            }).catch((e) => {
                res.status(500)
                next(e)
        })
    }

}