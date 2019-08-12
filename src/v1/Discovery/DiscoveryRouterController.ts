import {Middleware, PUT, RouterController} from "../../framework/annotation-restapi";
import {ensureAuthenticate, EnsureAuthRequest} from "../../middleware";
import express from 'express'
import {Coordinates} from "../../model/User";
import DiscoveryManager from "../../common/DiscoveryManager";

const HTTPResponse = require('../../model/HTTPResponse');

interface UpdateCurrentLocationRequest extends EnsureAuthRequest {
    body: {
        latitude: number
        longitude: number
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
}