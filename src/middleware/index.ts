import User, {UserModel} from '../model/User'
import express from 'express'
import {Model} from "mongoose";
const utils = require('../utils/VerifyIdToken')

/**
 * @apiDefine loggedIn Logged In user
 * Every logged in user has to send auth token
 * */

/**
 * Middleware interface for request that could be authenticated
 * */
export interface EnsureAuthRequest extends express.Request {
    user?: UserModel
}

/**
 * @api {GET} / Authenticate
 * @apiDescription This one is for every request that require authentication. Could be for any HTTP verb
 * @apiGroup How to authenticate
 *
 * @apiHeader {String} Authorization Token string from Firebase
 * @apiHeaderExample {json} Header-Example:
 *     {
 *       "Authorization": "Bearer SOME_VALID_TOKEN"
 *     }
 *
 * @apiError MissingAuthToken Error with message Require Authorization.
 * @apiError InvalidAuthHeader Error with message Invalid Auth Header.
 * @apiError InvalidAuthToken Error indicates token could be expired or invalid token.
 *
 * */
export async function ensureAuthenticate(req: express.Request, res: express.Response, next: express.NextFunction) {
    const authToken = req.headers.authorization

    if (!authToken) next(Error('Require Authorization.'))
    const slicedAuthToken = authToken!.split(' ')
    if (slicedAuthToken[0] !== 'Bearer' || !slicedAuthToken[1]) {
        next(Error('Invalid Auth Header.'))
    }
    const token = slicedAuthToken[1]

    try {
        const user = await userFromToken(token)
        const authenticatedRequest = req as EnsureAuthRequest
        if (!user) {
            throw Error('User is null or not found.')
        }

        authenticatedRequest.user = user
        next()
    } catch(e) {
        console.log(e)
        res.status(401)
        next(e)
    }

}

export async function authenticate(req: express.Request, res: express.Response, next: express.NextFunction) {
    const authToken = req.headers.authorization

    if (!authToken) {
        next()
        return
    }

    const slicedAuthToken = authToken!.split(' ')
    if (slicedAuthToken[0] !== 'Bearer' || !slicedAuthToken[1]) {
        next(Error('Invalid Auth Header.'))
    }
    const token = slicedAuthToken[1]

    try {
        const user = await userFromToken(token)
        const authenticatedRequest = req as EnsureAuthRequest
        if (!user) {
            throw Error('User is null or not found.')
        }

        authenticatedRequest.user = user
        next()
    } catch(e) {
        console.log(e)
        res.status(401)
        next(e)
    }

}

const userFromToken = (token: string): Promise<UserModel> => {
    return utils.verifyIdToken(token).then((decodedToken: any) => User.findByUID(decodedToken.uid))
}
