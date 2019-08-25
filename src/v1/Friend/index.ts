import express from "express"
import {register} from '../../framework/annotation-restapi'
import FriendRouterController from "./FriendRouterController";

const router = express.Router()

register(router, FriendRouterController)

export default router
