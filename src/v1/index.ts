import express from 'express'
const router = express.Router()

router.use('/auth', require('@v1/Authentication'))
router.use('/member', require('@v1/Member'))
router.use('/post', require('@v1/Post'))
router.use('/feed', require('@v1/Feed'))

module.exports = router