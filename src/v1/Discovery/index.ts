import express from "express"
import {register} from '../../framework/annotation-restapi'
import DiscoveryRouterController from './DiscoveryRouterController'

const router = express.Router()

register(router, DiscoveryRouterController)

export default router
