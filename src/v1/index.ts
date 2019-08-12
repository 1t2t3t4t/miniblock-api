import express from 'express'
import Account from './Account'
import Post from './Post'
import Categories from './Categories'
import Feed from './Feed'
import Discovery from './Discovery'
const router = express.Router()

router.use('/account', Account)
router.use('/post', Post)
router.use('/categories', Categories)
router.use('/feed', Feed)
router.use('/discovery', Discovery)

module.exports = router