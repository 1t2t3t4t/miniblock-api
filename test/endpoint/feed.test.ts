import Post, {PostModel, PostType} from '../../src/model/Post'
import User, {UserModel} from '../../src/model/User'
import {Category} from "../../src/model/Categories";
import {Response} from 'superagent'

const assert = require('assert')
const request = require('supertest')
const app = require('../../server')

const DBManager = require('../DBManager')

const dbManager = new DBManager()

let posts: Array<PostModel> = []

describe('Fetch all from feed', () => {
    before((next) => {

        const stubPost = async (creator: string) => {
            for(let i=1;i<=25;i++) {
                let model = {
                    type: PostType.TEXT,
                    categoryId: Category.Loneliness,
                    content: {
                        text: `text number ${i}`
                    },
                    creator: creator,
                    title: `${i}`
                } as PostModel
                await dbManager.stubPost(model).then((post: PostModel) => {
                    posts.push(post)
                })
            }
        }


        dbManager.start().then(() => {
            return User.findByUID("1")
        }).then((user: UserModel) => {
            return stubPost(user._id)
        }).then(() => {
            Post.find({}).then((posts) => {
                next()
            })
        }).catch((e: Error) => {
            console.log(e)
        })
    })

    after(() => {
        dbManager.stop()
    })

    const path = '/v1/feed/all'
    it('should get all feed', (done) => {
        request(app)
            .get(path)
            .expect(200)
            .expect((res: Response) => {
                assert.notDeepEqual(res.body.body.posts, undefined)
                const resPosts: Array<PostModel> = res.body.body.posts
                assert.equal(resPosts.length, posts.length)
            }).end(done)
    })

    it('should get 10 posts', (done) => {
        request(app)
            .get(path + '?limit=10')
            .expect(200)
            .expect((res: Response) => {
                assert.notDeepEqual(res.body.body.posts, undefined)
                const resPosts: Array<PostModel> = res.body.body.posts
                assert.equal(resPosts.length, 10)
            }).end(done)
    })

    it('should get 10 posts after 10th post', (done) => {
        const tenId = posts.find((post, index) => index == 9)!._id
        request(app)
            .get(path + `?limit=10&afterId=${tenId}`)
            .expect(200)
            .expect((res: Response) => {
                assert.notDeepEqual(res.body.body.posts, undefined)
                const resPosts: Array<PostModel> = res.body.body.posts
                assert.deepEqual(resPosts.length, 10)
                assert.deepEqual(resPosts[0].title, posts[10].title)
                assert.deepEqual(resPosts[9].title, posts[19].title)
            }).end(done)
    })

    it('should get 5 posts after 20th post', (done) => {
        const twenId = posts.find((post, index) => index == 19)!._id
        request(app)
            .get(path + `?limit=10&afterId=${twenId}`)
            .expect(200)
            .expect((res: Response) => {
                assert.notDeepEqual(res.body.body.posts, undefined)
                const resPosts: Array<PostModel> = res.body.body.posts
                assert.deepEqual(resPosts.length, 5)
                assert.deepEqual(resPosts[0].title, posts[20].title)
                assert.deepEqual(resPosts[4].title, posts[24].title)
            }).end(done)
    })
})