import AppTestManager from '../AppTestManager'
import assert from 'assert'
import {PostModel, PostType} from "../../src/model/Post";
import {Category} from "../../src/model/Categories";
import PostFactory from "../PostFactory";
import mongoose from 'mongoose'
import {UserModel} from "../../src/model/User";
const DBManager = require('../DBManager')


describe('Create post', () => {
    const dbManager = new DBManager()
    const manager = new AppTestManager()

    before((next) => {
        dbManager.start().then(() => {
            next()
        }).catch((e: Error) => {
            console.log(e)
        })
    })

    after(() => {
        dbManager.stop()
    })

    const validHeaderToken = { 'authorization': 'Bearer admin'}

    it('can create post if valid', (done) => {
        const path = '/v1/post'
        manager.agent
            .post(path)
            .send({
                type: PostType.TEXT,
                categoryId: Category.Depression,
                content: {
                    text: `text number`
                },
                creator: dbManager.defaultUser._id,
                title: `title`
            })
            .set(validHeaderToken)
            .expect(200)
            .expect((res: Response) => {
                assert.notDeepEqual(res.body, undefined)
                const body: any = res.body!
                assert.notDeepEqual(body.body.post, undefined)
            })
            .end(done)
    })

})

describe('Interact with post', () => {
    const dbManager = new DBManager()
    const manager = new AppTestManager()
    let postID: string
    before((next) => {
        dbManager.start().then(() => {
            const post = PostFactory.build(dbManager.defaultUser)
            return dbManager.stubPost(post)
        }).then((post: PostModel) => {
            postID = post._id.toHexString()
            next()
        }).catch((e: Error) => {
            console.log(e)
        })
    })

    after(() => {
        dbManager.stop()
    })

    const validHeaderToken = { 'authorization': 'Bearer admin'}

    it('can like post', (done) => {
        const path = `/v1/post/${postID}/like`
        manager.agent
            .post(path)
            .set(validHeaderToken)
            .expect(200)
            .expect((res: Response) => {
                assert.notDeepEqual(res.body, undefined)
                const body: any = res.body!
                assert.notDeepEqual(body.body.post, undefined)
                const post: PostModel = body.body.post
                assert.deepEqual(post.likeInfo.count, 1)
                assert.deepEqual(post.likeInfo.like.length, 1)
                const liker = (post.likeInfo.like[0] as UserModel)
                assert.deepEqual(liker._id, dbManager.defaultUser._id.toString())
            })
            .end(done)
    })

    it('show already liked message', (done) => {
        const path = `/v1/post/${postID}/like`
        manager.agent
            .post(path)
            .set(validHeaderToken)
            .expect(200)
            .expect((res: Response) => {
                assert.notDeepEqual(res.body, undefined)
                const body: any = res.body!
                assert.deepEqual(body.body.post, undefined)
                const message = body.body.message
                assert.deepEqual(message, 'User already liked')
            })
            .end(done)
    })

})