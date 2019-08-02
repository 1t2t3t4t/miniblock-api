import assert from 'assert'
import {Category} from "../../src/model/Categories";
import PostFactory from "../PostFactory";
import {PostModel} from "../../src/model/Post";
import {CommentModel} from "../../src/model/Comment";
import {UserModel} from "../../src/model/User";


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
            postId = p._id.toString()
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
    const text = 'THIS IS TEST TEXT'

    it('create comment succesfully', (done) => {
        const path = `/v1/post/${postId}/comment`
        request(app)
            .post(path)
            .set(validHeaderToken)
            .send({
                text
            })
            .expect(200)
            .expect((res: Response) => {
                assert.notDeepEqual(res.body, undefined)
                const body: any = res.body
                const comment: CommentModel = body.body.comment
                assert.deepEqual(comment.content.text, text)
                assert.deepEqual(comment.content.text, text)
                const creator = comment.creator as UserModel
                assert.deepEqual(creator.uid, dbManager.defaultUser.uid)
                assert.deepEqual(creator.uid, dbManager.defaultUser.uid)
            })
            .end(done)
    })

    it('create comment unsuccesfully if post does not exist', (done) => {
        const path = `/v1/post/5d41d18da2a32317715c80a0/comment`
        request(app)
            .post(path)
            .set(validHeaderToken)
            .send({
                text
            })
            .expect(500)
            .expect((res: Response) => {
                assert.notDeepEqual(res.body, undefined)
                const body: any = res.body
                assert.deepEqual(body.body.message, 'Comment validation failed: post: PostId 5d41d18da2a32317715c80a0 does not exist')
            })
            .end(done)
    })

    it('get comments correctly', (done) => {
        const path = `/v1/post/${postId}/comment`
        request(app)
            .get(path)
            .expect(200)
            .expect((res: Response) => {
                assert.notDeepEqual(res.body, undefined)
                const body: any = res.body
                const comments: CommentModel[] = body.body.comments
                assert.deepEqual(comments.length, 1)
                const comment: CommentModel = comments[0]
                assert.deepEqual(comment.content.text, text)
                const creator = comment.creator as UserModel
                assert.deepEqual(creator.uid, dbManager.defaultUser.uid)
            })
            .end(done)
    })

    it('get correct comments count in feed', (done) => {
        const path = `/v1/feed/all`
        request(app)
            .get(path)
            .expect(200)
            .expect((res: Response) => {
                assert.notDeepEqual(res.body, undefined)
                const body: any = res.body
                const posts: PostModel[] = body.body.posts
                assert.deepEqual(posts.length, 1)
                const post = posts[0]
                assert.deepEqual(post.commentInfo.count, 1)
            })
            .end(done)
    })

})
