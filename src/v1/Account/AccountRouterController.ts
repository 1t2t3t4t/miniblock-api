import AuthenticationFacade from "../../common/AuthenticationFacade";
import {ensureAuthenticate, EnsureAuthRequest} from "../../middleware";
import {UserModel} from "../../model/User";
import {MongoError} from "mongodb";
import express from 'express'
import {GET, Middleware, PATCH, POST, RouterController, SubRouterControllers} from "../../framework/annotation-restapi";
import {isNullOrUndefined} from "util";

const HTTPResponse = require('../../model/HTTPResponse');

@RouterController('/')
export default class AccountRouterController {

    protected facade: AuthenticationFacade = new AuthenticationFacade()

    /**
     * @api {POST} v1/account/login Login (Dont do anything ATM.)
     * @apiDeprecated Dont really know if we need this or not so keep it just in case
     * @apiGroup Account
     *
     * @apiParam {String} uid           Users unique ID.
     * @apiParam {String} email         Users email.
     * @apiParam {String} username      Username.
     *
     */
    @POST('/login')
    login(req: express.Request, res: express.Response, next: express.NextFunction) {
        const email = req.body.email
        const password = req.body.password
        res.send(new HTTPResponse.Response({ message: 'Did not do anything yet' }))
    }

    /**
     * @api {POST} v1/account/register Register
     * @apiDescription Register user from Firebase to the database **Must be called**
     * @apiGroup Account
     *
     * @apiParam {String} uid           Users unique ID.
     * @apiParam {String} email         Users email.
     * @apiParam {String} username      Username.
     *
     * @apiSuccess {String} message     Successfully message.
     * @apiSuccess {User}   user        User model.
     *
     * @apiError {Error} InternalError error with message
     */
    @POST('/register')
    register(req: express.Request, res: express.Response, next: express.NextFunction) {
        const { email, displayName, uid } = req.body

        this.facade.register(email, displayName, uid).then(async (user: UserModel) => {
            res.send(new HTTPResponse.Response({'message': 'Register successfully', user}))
        }).catch((error: MongoError) => {
            if (error.code == 11000) {
                res.send(new HTTPResponse.Response({'message': 'Already registered.'}))
                return
            }
            res.status(400)
            next(error)
        })
    }

    /**
     * @api {GET} v1/account/profile Get User Profile
     * @apiDescription Get user profile. User has to be loggedIn in order to call this
     * @apiGroup Account
     * @apiPermission loggedIn
     *
     * @apiHeader {String} Authorization Token string from Firebase
     *
     *
     * @apiSuccess {User} User model
     *
     * */
    @GET('/profile')
    @Middleware(ensureAuthenticate)
    profile(req: EnsureAuthRequest, res: express.Response, next: express.NextFunction) {
        res.status(200).send(new HTTPResponse.Response({ user: req.user }))
    }

    /**
     * @api {PATCH} v1/account/profile Update User Profile
     * @apiDescription Update user's profile from parameters
     * @apiGroup Account
     * @apiPermission loggedIn
     *
     * @apiHeader {String} Authorization Token string from Firebase
     *
     * @apiParam {String} [displayName] Display name to be saved
     * @apiParam {String} [image] Display picture url
     * @apiParam {String} [gender] User gender
     * @apiParam {Int} [age] User age
     * @apiParam {[Int]} [currentFeeling] Array user current feeling
     * @apiParam {Boolean} [showInDiscovery] User's desire to be shown in discovery mode
     *
     * @apiSuccess {User} user User model
     *
     * */
    @PATCH('/profile')
    @Middleware(ensureAuthenticate)
    saveProfile(req: EnsureAuthRequest, res: express.Response, next: express.NextFunction) {
        const user =  req.user!

        const { displayName, age, image, showInDiscovery, gender, currentFeeling } = req.body

        this.facade.update(user, displayName, age, image, showInDiscovery, gender, currentFeeling)
            .then((newUser) => {
                res.status(200).send(new HTTPResponse.Response({ user: newUser }))
            }).catch((error: Error) => {
                res.status(400)
                next(error)
            })
    }
}