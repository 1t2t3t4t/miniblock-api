import express from 'express'
import PostRouterController from './PostRoute'

const router = express.Router()

const controller = new PostRouterController(express.Router())

router.use('/', controller.router)

export default router
