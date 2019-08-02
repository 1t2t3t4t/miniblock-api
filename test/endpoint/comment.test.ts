import assert from 'assert'
import {Category} from "../../src/model/Categories";
import PostFactory from "../PostFactory";
import {PostModel} from "../../src/model/Post";


const request = require('supertest')

const app = require('../../server')
const DBManager = require('../DBManager')


describe('Comment path', () => {
    const dbManager = new DBManager()

    let postId!: string
    let post!: PostModel

    before((next) => {
        dbManager.start().then(() => {
            const p = PostFactory.build(dbManager.defaultUser)
            return dbManager.stubPost(p)
        }).then((p: PostModel) => {
            postId = p._id.toHexString()
            post = p
            next()
        }).catch((e: Error) => {
            console.log(e)
        })
    })

    after(() => {
        dbManager.stop()
    })

    const validHeaderToken = { 'authorization': 'Bearer admin'}

    const path = `/v1/post/${postId}/comment`
    it('create comment succesfully', () => {
        request(app)
            .post(path)
            .set(validHeaderToken)
            .expect(200)
    })

    it('get comments correctly', () => {
        request(app)
            .get(path)
            .expect(200)
    })

})
