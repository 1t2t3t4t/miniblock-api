import express from 'express'
import CategoriesRouterController from './CategoriesRouterController'

const router = express.Router()

const controller = new CategoriesRouterController(express.Router())

router.use('/', controller.router)

export default router
