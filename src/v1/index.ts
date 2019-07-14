import express from 'express'
import AccountRouteController from './Account'
const router = express.Router()

const accountRouteController = new AccountRouteController()

router.use('/account', accountRouteController.router)
router.use('/post', require('./Post'))
router.use('/feed', require('./Feed'))

module.exports = router