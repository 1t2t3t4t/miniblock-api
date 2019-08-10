import {GET, Middleware, PUT, RouterController} from "../../framework/annotation-restapi";
import express from 'express'
import {ensureAuthenticate, EnsureAuthRequest} from "../../middleware";
import UserPreferencesDAO from "../../common/UserPreferencesDAO";

const HTTPResponse = require('../../model/HTTPResponse');

interface UpdateUserPreferencesRequest extends EnsureAuthRequest {
    body: {
        showInDiscovery?: boolean
    }
}

@RouterController('/userPreferences')
export default class UserPreferencesRouterController {

    userPreferencesDAO = new UserPreferencesDAO()

    /**
     * @api {GET} v1/account/userPreferences Get User's Preferences
     * @apiDescription Get User's Preferences. User has to be loggedIn in order to call this
     * @apiGroup UserPreferences
     * @apiPermission loggedIn
     *
     * @apiHeader {String} Authorization Token string from Firebase
     *
     * @apiSuccess {UserPreferences} userPref UserPreferences model
     *
     * */
    @GET('/')
    @Middleware(ensureAuthenticate)
    pref(req: EnsureAuthRequest, res: express.Response, next: express.NextFunction) {
        const user = req.user!

        this.userPreferencesDAO.getUserPreferences(user._id).then((userPref) => {
            res.status(200).send(new HTTPResponse.Response({ userPref }))
        }).catch((e) => {
            console.log(e)
            res.status(500)
            next(e)
        })
    }

    /**
     * @api {PUT} v1/account/userPreferences Update User's Preferences
     * @apiDescription Update User's Preferences. User has to be loggedIn in order to call this
     * @apiGroup UserPreferences
     * @apiPermission loggedIn
     *
     * @apiHeader {String} Authorization Token string from Firebase
     *
     * @apiParam {Boolean} [showInDiscovery] Boolean indicates that user want to be shown in discovery mode or not
     *
     * @apiSuccess {UserPreferences} userPref Saved UserPreferences model
     *
     * */
    @PUT('/')
    @Middleware(ensureAuthenticate)
    updatePref(req: UpdateUserPreferencesRequest, res: express.Response, next: express.NextFunction) {
        const user = req.user!
        const { showInDiscovery } = req.body

        this.userPreferencesDAO.updateUserPreferences(user._id, showInDiscovery).then((userPref) => {
            res.status(200).send(new HTTPResponse.Response({ userPref }))
        }).catch((e) => {
            res.status(500)
            next(e)
        })
    }
}