import {GET, Middleware, PUT, RouterController} from "../../framework/annotation-restapi";
import express from 'express'
import {ensureAuthenticate, EnsureAuthRequest} from "../../middleware";
import {UserModel} from "../../model/User";
import UserPreferencesDAO from "../../common/UserPreferencesDAO";

interface UpdateUserPreferencesRequest extends EnsureAuthRequest {
    body: {
        showInDiscovery?: boolean
    }
}

@RouterController('/userPreferences')
export default class UserPreferencesRouterController {

    userPreferencesDAO = new UserPreferencesDAO()

    @GET('/')
    @Middleware(ensureAuthenticate)
    pref(req: EnsureAuthRequest, res: express.Response, next: express.NextFunction) {
        const user = req.user!

        this.userPreferencesDAO.getUserPreferences(user._id).then((userPref) => {
            res.status(200).send({ userPref })
        }).catch((e) => {
            res.status(500)
            next(e)
        })
    }

    @PUT('/')
    @Middleware(ensureAuthenticate)
    updatePref(req: UpdateUserPreferencesRequest, res: express.Response, next: express.NextFunction) {
        const user = req.user!
        const { showInDiscovery } = req.body

        this.userPreferencesDAO.updateUserPreferences(user._id, showInDiscovery).then((userPref) => {
            res.status(200).send({ userPref })
        }).catch((e) => {
            res.status(500)
            next(e)
        })
    }
}