import express from 'express'
import Account from './Account'
import Post from './Post'
import Categories from './Categories'
import Feed from './Feed'
const router = express.Router()

router.use('/account', Account)
router.use('/post', Post)
router.use('/categories', Categories)
router.use('/feed', Feed)

module.exports = router