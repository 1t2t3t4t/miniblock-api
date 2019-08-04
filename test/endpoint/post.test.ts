import assert from 'assert'
import {PostModel, PostType} from "../../src/model/Post";
import {Category} from "../../src/model/Categories";
import PostFactory from "../PostFactory";
import {UserModel} from "../../src/model/User";
import PostDAO from "../../src/common/PostDAO";

const request = require('supertest')

const app = require('../../server')
const DBManager = require('../DBManager')

describe('Get post', () => {
    const dbManager = new DBManager()

    let post!: PostModel
    let postId!: string

    const text = 'content'
    const title = 'title'
    const type = PostType.TEXT
    const category = Category.Loneliness

    before((next) => {
        dbManager.start().then(() => {
            return new PostDAO().createPost(dbManager.defaultUser,
                { text: text},
                type,
                title,
                category)
        }).then((p: PostModel) => {
            post = p
            postId = p._id.toString()
            next()
        }).catch((e: Error) => {
            console.log(e)
        })
    })

    after(() => {
        dbManager.stop()
    })

    const validHeaderToken = { 'authorization': 'Bearer admin'}

    it('can fetch post', (done) => {
        const path = `/v1/post/${postId}`
        request(app)
            .get(path)
            .expect(200)
            .expect((res: Response) => {
                assert.notDeepEqual(res.body, undefined)
                const body: any = res.body!
                assert.notDeepEqual(body.body.post, undefined)
                const post: PostModel = body.body!.post
                assert.deepEqual(post.authInfo, undefined)
                assert.deepEqual(post.likeInfo.isLiked, undefined)
                assert.deepEqual(post.likeInfo.count, 0)
                assert.deepEqual(post.title, title)
                assert.deepEqual(post.content.text, text)
                assert.deepEqual(post.commentInfo.count, 0)
                assert.deepEqual(post.categoryId, category)
                assert.deepEqual(post.type, type)
            })
            .end(done)
    })

    it('can fetch post with auth', (done) => {
        const path = `/v1/post/${postId}`
        request(app)
            .get(path)
            .set(validHeaderToken)
            .expect(200)
            .expect((res: Response) => {
                assert.notDeepEqual(res.body, undefined)
                const body: any = res.body!
                assert.notDeepEqual(body.body.post, undefined)
                const post: PostModel = body.body!.post
                assert.notDeepEqual(post.authInfo, undefined)
                assert.notDeepEqual(post.likeInfo.isLiked, undefined)

                assert.deepEqual(post.authInfo!.canDelete, true)
                assert.deepEqual(post.likeInfo.isLiked, false)

                assert.deepEqual(post.likeInfo.count, 0)
                assert.deepEqual(post.title, title)
                assert.deepEqual(post.content.text, text)
                assert.deepEqual(post.commentInfo.count, 0)
                assert.deepEqual(post.categoryId, category)
                assert.deepEqual(post.type, type)
            })
            .end(done)
    })

    it('not exist post', (done) => {
        const path = `/v1/post/5d47195dc5f3c2093a6503e5`
        request(app)
            .get(path)
            .set(validHeaderToken)
            .expect(400)
            .expect((res: Response) => {
                assert.notDeepEqual(res.body, undefined)
                const body: any = res.body!
                assert.deepEqual(body.body.post, undefined)
                assert.deepEqual(body.body.message, 'Post does not exist')
            })
            .end(done)
    })

})


describe('Create post', () => {
    const dbManager = new DBManager()

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
        request(app)
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

    it('can create image post if valid', (done) => {
        const path = '/v1/post'
        request(app)
            .post(path)
            .send({
                type: PostType.IMAGE,
                categoryId: Category.Depression,
                content: {
                    imageInfo: {
                        image: "imageurl",
                        width: 600,
                        height: 800
                    }
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
                assert.notDeepEqual(body.body.post.content.imageInfo, undefined)
                assert.notDeepEqual(body.body.post.content.imageInfo.image, undefined)
                assert.notDeepEqual(body.body.post.content.imageInfo.width, undefined)
                assert.notDeepEqual(body.body.post.content.imageInfo.height, undefined)
            })
            .end(done)
    })

    it('can create image post even if no width and height', (done) => {
        const path = '/v1/post'
        request(app)
            .post(path)
            .send({
                type: PostType.IMAGE,
                categoryId: Category.Depression,
                content: {
                    imageInfo: {
                        image: "imageurl"
                    }
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
                assert.notDeepEqual(body.body.post.content.imageInfo, undefined)
                assert.notDeepEqual(body.body.post.content.imageInfo.image, undefined)
                assert.deepEqual(body.body.post.content.imageInfo.width, undefined)
                assert.deepEqual(body.body.post.content.imageInfo.height, undefined)
            })
            .end(done)
    })

})

describe('Interact with post', () => {
    const dbManager = new DBManager()
    let postID!: string

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

    it('throw error if invalid request', (done) => {
        const path = `/v1/post/${postID}/reaction`
        request(app)
            .put(path)
            .set(validHeaderToken)
            .expect(400)
            .expect((res: Response) => {
                assert.notDeepEqual(res.body, undefined)
                const body: any = res.body!
                assert.deepEqual(body.body.post, undefined)
                assert.deepEqual(body.body.message, 'No reaction in body')
            })
            .end(done)
    })

    it('can like post', (done) => {
        const path = `/v1/post/${postID}/reaction`
        request(app)
            .put(path)
            .set(validHeaderToken)
            .send({
                reaction: 'like'
            })
            .expect(200)
            .expect((res: Response) => {
                assert.notDeepEqual(res.body, undefined)
                const body: any = res.body!
                assert.notDeepEqual(body.body.post, undefined)
                const post: PostModel = body.body.post
                assert.deepEqual(post.likeInfo.count, 1)
                assert.deepEqual(post.likeInfo.like.length, 1)
                assert.deepEqual(post.likeInfo.isLiked, true)
                const liker = (post.likeInfo.like[0] as UserModel)
                assert.deepEqual(liker._id, dbManager.defaultUser._id.toString())
            })
            .end(done)
    })

    it('show already liked message', (done) => {
        const path = `/v1/post/${postID}/reaction`
        request(app)
            .put(path)
            .set(validHeaderToken)
            .send({
                reaction: 'like'
            })
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

    it('can react none to liked post', (done) => {
        const path = `/v1/post/${postID}/reaction`
        request(app)
            .put(path)
            .set(validHeaderToken)
            .send({
                reaction: 'none'
            })
            .expect(200)
            .expect((res: Response) => {
                assert.notDeepEqual(res.body, undefined)
                const body: any = res.body!
                assert.notDeepEqual(body.body.post, undefined)
                const post: PostModel = body.body.post
                assert.deepEqual(post.likeInfo.count, 0)
                assert.deepEqual(post.likeInfo.like.length, 0)
                assert.deepEqual(post.likeInfo.isLiked, false)
            })
            .end(done)
    })

    it('show already none reaction message', (done) => {
        const path = `/v1/post/${postID}/reaction`
        request(app)
            .put(path)
            .set(validHeaderToken)
            .send({
                reaction: 'none'
            })
            .expect(200)
            .expect((res: Response) => {
                assert.notDeepEqual(res.body, undefined)
                const body: any = res.body!
                assert.deepEqual(body.body.post, undefined)
                const message = body.body.message
                assert.deepEqual(message, 'User did not like the post')
            })
            .end(done)
    })

})