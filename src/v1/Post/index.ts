import express from 'express'
import PostRouterController from './PostRouterController'
import {register} from "../../framework/annotation-restapi";

const router = express.Router()

register(router, PostRouterController)

export default router
