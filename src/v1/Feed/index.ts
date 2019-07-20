import FeedRouterController from './FeedRouterController'
import express from "express"
import {register} from '../../framework/annotation-restapi'

const router = express.Router()

register(router, FeedRouterController)

export default router
