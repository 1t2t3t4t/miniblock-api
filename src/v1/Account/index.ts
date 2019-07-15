import express from 'express'
import AuthenticationFacade from './AuthenticationFacade'
import {UserModel} from "../../model/User";

const HTTPResponse = require('../../model/HTTPResponse')
const authenticate = require('../../middleware/authenticate')

interface AuthenticatedRequest extends express.Request {
    user?: UserModel
}

class AccountRouterController {

    protected facade: AuthenticationFacade
    router = express.Router()

    constructor(facade: AuthenticationFacade = new AuthenticationFacade()) {
        this.facade = facade
        this.registerRoute()
    }

    private registerRoute() {
        this.router.post('/login', this.login.bind(this))
        this.router.post('/register', this.register.bind(this))
        this.router.get('/profile', authenticate.authenticate, this.profile.bind(this))
        this.router.post('/profile', authenticate.authenticate, this.saveProfile.bind(this))
    }

    /**
     * @api {POST} /account/login Login (Dont do anything ATM.)
     * @apiDeprecated Dont really know if we need this or not so keep it just in case
     * @apiGroup Account
     *
     * @apiParam {String} uid           Users unique ID.
     * @apiParam {String} email         Users email.
     * @apiParam {String} username      Username.
     *
     */
    login(req: express.Request, res: express.Response, next: express.NextFunction) {
        const email = req.body.email
        const password = req.body.password
        res.send(new HTTPResponse.Response({ message: 'Did not do anything yet' }))
    }


    /**
     * @api {POST} /account/register Register
     * @apiDescription Register user from Firebase to the database **Must be called**
     * @apiGroup Account
     *
     * @apiParam {String} uid           Users unique ID.
     * @apiParam {String} email         Users email.
     * @apiParam {String} username      Username.
     *
     * @apiSuccess {String} message     Successfully message.
     * @apiSuccess {User}   User        User model.
     *
     * @apiError {Error} InternalError error with message
     */
    register(req: express.Request, res: express.Response, next: express.NextFunction) {
        const { email, username, uid } = req.body

        this.facade.register(email, username, uid).then(async (user: object) => {
            res.send(new HTTPResponse.Response({'message': 'Register successfully', user}))
        }).catch((error: Error) => {
            res.status(400)
            next(error)
        })
    }

    /**
     * @api {GET} /account/profile Get User Profile
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
    profile(req: AuthenticatedRequest, res: express.Response, next: express.NextFunction) {
        res.status(200).send(new HTTPResponse.Response(req.user))
    }

    /**
     * @api {POST} /account/profile Update User Profile
     * @apiDescription Update user's profile from parameters
     * @apiGroup Account
     * @apiPermission loggedIn
     *
     * @apiHeader {String} Authorization Token string from Firebase
     *
     * @apiParam {String} displayName Display name to be saved
     *
     * @apiSuccess {User} User model
     *
     * */
    saveProfile(req: AuthenticatedRequest, res: express.Response, next: express.NextFunction) {
        if (!req.user) {
            next(Error('Unregistered'))
            return
        }

        const { displayName } = req.body
        req.user.displayName = displayName
        req.user.save().then((newUser) => {
            res.status(200).send(new HTTPResponse.Response(newUser))
        }).catch((error: Error) => {
            res.status(400)
            next(error)
        })
    }
}

export default AccountRouterController