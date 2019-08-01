import express from "express"
import {register} from '../../framework/annotation-restapi'
import AccountRouterController from './AccountRouterController'

const router = express.Router()

register(router, AccountRouterController)

export default router
