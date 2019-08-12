import {GET, Middleware, PUT, RouterController} from "../../framework/annotation-restapi";
import {ensureAuthenticate, EnsureAuthRequest} from "../../middleware";
import express from 'express'
import {Gender} from "../../model/User";
import DiscoveryManager from "../../common/DiscoveryManager";
import {Category} from "../../model/Categories";
import {Coordinates} from "../../model/Location";

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
        currentFeeling: Category
        maxDistance: number
        page: number
        limit: number
    }
}

@RouterController('/')
export default class DiscoveryRouterController {

    discoveryManager = new DiscoveryManager()

    @PUT('/currentLocation')
    @Middleware(ensureAuthenticate)
    updateCurrentLocation(req: UpdateCurrentLocationRequest, res: express.Response, next: express.NextFunction) {
        const user = req.user!
        const coordinates: Coordinates = [req.body.longitude, req.body.latitude]

        this.discoveryManager.updateLocation(user, coordinates).then((user) => {
            res.status(200)
            res.send(new HTTPResponse.Response({ updatedLocation: user.discoveryInfo.currentLocation }))
        }).catch((e) => {
            res.status(500)
            next(e)
        })
    }

    @GET('/')
    @Middleware(ensureAuthenticate)
    discovery(req: DiscoveryRequest, res: express.Response, next: express.NextFunction) {
        const user = req.user!
        const { gender, currentFeeling, maxDistance } = req.query
        const page = Number(req.query.page) || 0
        const limit = Number(req.query.limit) || 10

        this.discoveryManager.discovery(user, currentFeeling, maxDistance, page, limit, gender)
            .then((users) => {
                res.status(200)
                res.send(new HTTPResponse.Response({ users }))
            }).catch((e) => {
                res.status(500)
                next(e)
            })
    }
}