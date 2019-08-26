import express from "express"
import {register} from '../../framework/annotation-restapi'
import ChatRouterController from "./ChatRouterController";

const router = express.Router()

register(router, ChatRouterController)

export default router
