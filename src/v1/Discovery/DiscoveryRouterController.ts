import {GET, Middleware, PUT, RouterController} from "../../framework/annotation-restapi";
import {ensureAuthenticate, EnsureAuthRequest} from "../../middleware";
import express from 'express'
import {Gender} from "../../model/User";
import DiscoveryManager from "../../common/DiscoveryManager";
import AccountFacade from "../../common/AccountFacade";
import {CurrentFeeling} from "../../model/CurrentFeeling";

const HTTPResponse = require('../../model/HTTPResponse');

interface UpdateCurrentLocationRequest extends EnsureAuthRequest {
    body: {
        latitude: number
        longitude: number
    }
}

interface DiscoveryRequest extends EnsureAuthRequest {
    query: {
        gender?: Gender
        currentFeeling: CurrentFeeling
        maxDistance: number
        page: number
        limit: number
    }
}

interface LikeDiscoveryRequest extends EnsureAuthRequest {
    params: {
        userId: string
    }
}

@RouterController('/')
export default class DiscoveryRouterController {

    discoveryManager = new DiscoveryManager()
    accountFacade = new AccountFacade()

    /**
     * @api {PUT} /v1/discovery/currentLocation Update current location
     * @apiDescription Get post from given id
     * @apiGroup Discovery
     * @apiPermission loggedIn
     *
     * @apiHeader {String} Authorization Token string from Firebase
     *
     * @apiParam {Number} latitude Latitude values from -90 to 90
     * @apiParam {Number} longitude Longitude values from -180 to 180
     *
     * @apiSuccess {LocationInfo} updatedLocation Saved location
     *
     * */
    @PUT('/currentLocation')
    @Middleware(ensureAuthenticate)
    updateCurrentLocation(req: UpdateCurrentLocationRequest, res: express.Response, next: express.NextFunction) {
        const user = req.user!
        const { latitude, longitude } = req.body

        this.discoveryManager.updateLocation(user, latitude, longitude).then((user) => {
            res.status(200)
            res.send(new HTTPResponse.Response({ updatedLocation: user.discoveryInfo.currentLocation }))
        }).catch((e) => {
            res.status(500)
            next(e)
        })
    }

    /**
     * @api {GET} /v1/discovery Get users from discovery
     * @apiDescription Get post from given id
     * @apiGroup Discovery
     * @apiPermission loggedIn
     *
     * @apiHeader {String} Authorization Token string from Firebase
     *
     * @apiParam {Category} currentFeeling Id of interested feeling
     * @apiParam {Gender} [gender] Filter users' gender
     * @apiParam {Number} [maxDistance] Maximum distance is Kilometers
     * @apiParam {Number} [page] Number of page
     * @apiParam {Number} [limit] Limit of users per page
     *
     * @apiSuccess {[User]} users Array of user
     *
     * */
    @GET('/')
    @Middleware(ensureAuthenticate)
    discovery(req: DiscoveryRequest, res: express.Response, next: express.NextFunction) {
        const user = req.user!
        const { gender, maxDistance } = req.query
        const currentFeeling = Number(req.query.currentFeeling)
        const page = Number(req.query.page) || 0
        const limit = Number(req.query.limit) || 10

        if (isNaN(currentFeeling)) {
            res.status(400)
            next(new Error('Invalid or empty currentFeeling'))
            return
        }

        this.discoveryManager.discovery(user, currentFeeling, maxDistance, page, limit, gender)
            .then((users) => {
                res.status(200)
                res.send(new HTTPResponse.Response({ users }))
            }).catch((e) => {
                res.status(500)
                next(e)
            })
    }

    /**
     * @api {GET} /v1/discovery/:userId/like Like user
     * @apiDescription Send friend request to user
     * @apiGroup Discovery
     * @apiPermission loggedIn
     *
     * @apiHeader {String} Authorization Token string from Firebase
     *
     * @apiSuccess {FriendRequestModel} friendRequest FriendRequest model
     *
     * */
    @GET('/:userId/like')
    @Middleware(ensureAuthenticate)
    like(req: LikeDiscoveryRequest, res: express.Response, next: express.NextFunction) {
        const user = req.user!
        const userId = req.params.userId

        this.accountFacade.createFriendRequest(user, userId)
            .then((friendRequest) => {
            res.status(200)
            res.send(new HTTPResponse.Response({ friendRequest }))
        }).catch((e) => {
            res.status(500)
            next(e)
        })
    }
}