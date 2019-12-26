import express from "express"
import {register} from '../../framework/annotation-restapi'
import NewsletterRouterController from "./NewsletterRouterController";

const router = express.Router()

register(router, NewsletterRouterController)

export default router
