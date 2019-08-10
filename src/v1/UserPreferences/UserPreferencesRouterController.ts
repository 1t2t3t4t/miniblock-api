import {GET, Middleware, PUT, RouterController} from "../../framework/annotation-restapi";
import express from 'express'
import {ensureAuthenticate, EnsureAuthRequest} from "../../middleware";
import {UserModel} from "../../model/User";

interface UserPreferencesRequest extends express.Request {

}

@RouterController('/userPreferences')
export default class UserPreferencesRouterController {

    @PUT('/')
    @Middleware(ensureAuthenticate)
    pref(req: UserPreferencesRequest, res: express.Response, next: express.NextFunction) {
        res.send('SOEF')
    }
}