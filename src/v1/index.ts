import express from 'express'
import AccountRouteController from './Account'
const router = express.Router()

const accountRouteController = new AccountRouteController()

router.use('/account', accountRouteController.router)
router.use('/post', require('@v1/Post'))
router.use('/feed', require('@v1/Feed'))

module.exports = router