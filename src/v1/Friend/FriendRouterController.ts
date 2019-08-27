import {GET, Middleware, PUT, RouterController} from "../../framework/annotation-restapi";
import {ensureAuthenticate, EnsureAuthRequest} from "../../middleware";
import express from "express";
import {FriendRequestStatus} from "../../model/FriendRequest";
import FriendRequestDAO from "../../common/FriendRequestDAO";

const HTTPResponse = require('../../model/HTTPResponse');

interface FriendRequestsRequest extends EnsureAuthRequest {
    query: {
        requestedId: string
    }
}

interface FriendRequestsActionRequest extends EnsureAuthRequest {
    body: {
        id: string,
        action: FriendRequestStatus
    }
}

@RouterController('/')
export default class FriendRouterController {

    friendRequestDAO = new FriendRequestDAO()

    /**
     * @api {GET} /v1/friendRequests Get friend request list
     * @apiDescription Get friend request list
     * @apiGroup FriendRequest
     * @apiPermission loggedIn
     *
     * @apiHeader {String} Authorization Token string from Firebase
     *
     * @apiSuccess {FriendRequestModel[]} requests FriendRequest array model
     *
     * */
    @GET('/')
    @Middleware(ensureAuthenticate)
    friendRequests(req: FriendRequestsRequest, res: express.Response, next: express.NextFunction) {
        const user = req.user!

        this.friendRequestDAO.friendRequests(user).then((requests) => {
            res.send(new HTTPResponse.Response({ requests }))
        }).catch((e) => {
            res.status(500)
            next(e)
        })
    }

    /**
     * @api {PUT} /v1/friendRequests Friend request action
     * @apiDescription Set friend request action
     * @apiGroup FriendRequest
     * @apiPermission loggedIn
     *
     * @apiHeader {String} Authorization Token string from Firebase
     *
     * @apiParam {String} id Id of friend request
     * @apiParam {String} action Action to do with friend request {'accept' || 'decline'}
     *
     * @apiSuccess {ChatRoom} chatRoom Chat Room Model if send accept
     *
     * */
    @PUT('/')
    @Middleware(ensureAuthenticate)
    friendRequestsAction(req: FriendRequestsActionRequest, res: express.Response, next: express.NextFunction) {
        const user = req.user!
        const { id, action } = req.body

        switch (action) {
            case FriendRequestStatus.Accept:
                this.friendRequestDAO.friendRequestAccept(id).then((chatRoom) => {
                    res.send(new HTTPResponse.Response({ chatRoom }))
                }).catch((e) => {
                    res.status(500)
                    next(e)
                })
                break
            case FriendRequestStatus.Decline:
                this.friendRequestDAO.friendRequestDecline(id).then(() => {
                    res.send(new HTTPResponse.Response({ message: "Declined user" }))
                }).catch((e) => {
                    res.status(500)
                    next(e)
                })
                break
        }
    }
}