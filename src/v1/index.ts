import express from 'express'
import AccountRouteController from './Account'
import Post from './Post'
const router = express.Router()

const accountRouteController = new AccountRouteController()

router.use('/account', accountRouteController.router)
router.use('/post', Post)
router.use('/feed', require('./Feed'))

module.exports = router