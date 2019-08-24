import {GET, Middleware, PUT, RouterController} from "../../framework/annotation-restapi";
import {ensureAuthenticate, EnsureAuthRequest} from "../../middleware";
import express from "express";
import AccountFacade from "../../common/AccountFacade";
import {FriendRequestStatus} from "../../model/FriendRequest";

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

    accountFacade = new AccountFacade()

    @GET('/')
    @Middleware(ensureAuthenticate)
    friendRequests(req: FriendRequestsRequest, res: express.Response, next: express.NextFunction) {
        const user = req.user!

        this.accountFacade.friendRequests(user).then((requests) => {
            res.send(new HTTPResponse.Response({ requests }))
        }).catch((e) => {
            res.status(500)
            next(e)
        })
    }

    @PUT('/')
    @Middleware(ensureAuthenticate)
    friendRequestsAction(req: FriendRequestsActionRequest, res: express.Response, next: express.NextFunction) {
        const user = req.user!
        const { id, action } = req.body

        switch (action) {
            case FriendRequestStatus.Accept:
                this.accountFacade.friendRequestAccept(id).then((chatRoom) => {
                    res.send(new HTTPResponse.Response({ chatRoom }))
                }).catch((e) => {
                    res.status(500)
                    next(e)
                })
                break
            case FriendRequestStatus.Decline:
                this.accountFacade.friendRequestDecline(id).then(() => {
                    res.send(new HTTPResponse.Response({ message: "Declined user" }))
                }).catch((e) => {
                    res.status(500)
                    next(e)
                })
                break
        }
    }
}