import Post, {PostModel, PostType} from '../../src/model/Post'
import User, {UserModel} from '../../src/model/User'
import {Category} from "../../src/model/Categories";
import {Response} from 'superagent'

const assert = require('assert')
const request = require('supertest')
const app = require('../../server')

const DBManager = require('../DBManager')

describe('Fetch all from feed with 1 category', () => {
    const dbManager = new DBManager()
    let posts: Array<PostModel> = []
    before((next) => {
        const stubPost = async (creator: string) => {
            for(let i=1;i<=25;i++) {
                let modelLoneliness = {
                    type: PostType.TEXT,
                    categoryId: Category.Loneliness,
                    content: {
                        text: `text number ${i}`
                    },
                    creator: creator,
                    title: `${i}`
                } as PostModel
                let modelDepression = {
                    type: PostType.TEXT,
                    categoryId: Category.Depression,
                    content: {
                        text: `text number ${i}`
                    },
                    creator: creator,
                    title: `${i}`
                } as PostModel
                const postLone = await dbManager.stubPost(modelLoneliness)
                posts.push(postLone)
            }
        }


        dbManager.start().then(() => {
            return User.findByUID("1")
        }).then((user: UserModel) => {
            return stubPost(user._id)
        }).then(() => {
            next()
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

describe('Fetch all from feed with mixed category', () => {
    const dbManager = new DBManager()
    let posts: Array<PostModel> = []
    before((next) => {
        const stubPost = async (creator: string) => {
            for(let i=1;i<=25;i++) {
                let modelLoneliness = {
                    type: PostType.TEXT,
                    categoryId: Category.Loneliness,
                    content: {
                        text: `text number ${i}`
                    },
                    creator: creator,
                    title: `${i}`
                } as PostModel
                let modelDepression = {
                    type: PostType.TEXT,
                    categoryId: Category.Depression,
                    content: {
                        text: `text number ${i}`
                    },
                    creator: creator,
                    title: `${i}`
                } as PostModel
                const postLone = await dbManager.stubPost(modelLoneliness)
                posts.push(postLone)
                const postDepress = await dbManager.stubPost(modelDepression)
                posts.push(postDepress)
            }
        }


        dbManager.start().then(() => {
            return User.findByUID("1")
        }).then((user: UserModel) => {
            return stubPost(user._id)
        }).then(() => {
            next()
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

    it('should get 10 posts with specific categoryId', (done) => {
        const categoryId = Category.Depression
        request(app)
            .get(path + '?limit=10&categoryId=' + categoryId)
            .expect(200)
            .expect((res: Response) => {
                assert.notDeepEqual(res.body.body.posts, undefined)
                const resPosts: Array<PostModel> = res.body.body.posts
                assert.deepEqual(resPosts.length, 10)
                resPosts.forEach((post) => {
                    assert.deepEqual(post.categoryId, categoryId)
                })
            }).end(done)
    })

    it('should get 10 posts with specific categoryId after 10th', (done) => {
        const categoryId = Category.Depression
        const afterId = posts
            .filter((post) => post.categoryId == categoryId)
            .find((post, idx) => idx == 9)!._id
        request(app)
            .get(path + '?limit=10&categoryId=' + categoryId + '&afterId=' + afterId)
            .expect(200)
            .expect((res: Response) => {
                assert.notDeepEqual(res.body.body.posts, undefined)
                const resPosts: Array<PostModel> = res.body.body.posts
                assert.deepEqual(resPosts.length, 10)
                const expectId = posts
                    .filter((post) => post.categoryId == categoryId)
                    .find((post, idx) => idx == 10)!._id.toString()
                assert.deepEqual(expectId, resPosts[0]._id)
                resPosts.forEach((post) => {
                    assert.deepEqual(post.categoryId, categoryId)
                })
            }).end(done)
    })

})

describe('Seach post', () => {

    const dbManager = new DBManager()
    let posts: Array<PostModel> = []

    const keyword = 'keyword'
    before((next) => {

        const makePost = (title: string, creator: string): PostModel => {
            return {
                type: PostType.TEXT,
                categoryId: Category.Loneliness,
                content: {
                    text: `text`
                },
                title: title,
                creator: creator,
            } as PostModel
        }

        const stubPost = async (creator: string) => {
            let postList: PostModel[] = []
            postList.push(makePost(keyword, creator))
            postList.push(makePost('random post', creator))
            postList.push(makePost(`${keyword} followed my smt`, creator))
            postList.push(makePost('random post 2', creator))
            postList.push(makePost(`lead by smt ${keyword} followed my smt`, creator))
            postList.push(makePost('random post 3', creator))
            postList.push(makePost(`lllll${keyword}llll`, creator))
            postList.push(makePost('random post 3', creator))
            postList.push(makePost(`hey yo ${keyword}`, creator))
            for(const post of postList) {
                const returnedPost = await new Post(post).save()
                posts.push(returnedPost)
            }
        }

        dbManager.start().then(() => {
            return User.findByUID("1")
        }).then((user: UserModel) => {
            return stubPost(user._id)
        }).then(() => {
            next()
        }).catch((e: Error) => {
            console.log(e)
        })
    })

    after(() => {
        dbManager.stop()
    })

    const path = '/v1/feed/search'
    it('should get all post that matches keyword', (done) => {
        const postWithKeyword = posts.reduce((tot, curr) => {
            return tot += curr.title.includes(keyword) ? 1 : 0
        }, 0)
        request(app)
            .get(path + '?keyword=' + keyword)
            .expect(200)
            .expect((res: Response) => {
                assert.notDeepEqual(res.body.body.posts, undefined)
                const resPosts: Array<PostModel> = res.body.body.posts
                assert.deepEqual(postWithKeyword, resPosts.length)
                resPosts.forEach((post) => {
                    assert(post.title.includes(keyword), 'should contain keyword')
                })
            }).end(done)
    })

    it('should get all post that matches keyword with limit', (done) => {
        request(app)
            .get(path + '?keyword=' + keyword + '&limit=3')
            .expect(200)
            .expect((res: Response) => {
                assert.notDeepEqual(res.body.body.posts, undefined)
                const resPosts: Array<PostModel> = res.body.body.posts
                assert.deepEqual(3, resPosts.length)
                resPosts.forEach((post) => {
                    assert(post.title.includes(keyword), 'should contain keyword')
                })
            }).end(done)
    })

    it('should get all post that matches keyword with limit and afterId', (done) => {
        const thirdPost = posts
            .filter((post) => post.title.includes(keyword))
            .find((post, idx) => idx == 2)!._id
        request(app)
            .get(path + '?keyword=' + keyword + '&limit=3&afterId=' + thirdPost)
            .expect(200)
            .expect((res: Response) => {
                assert.notDeepEqual(res.body.body.posts, undefined)
                const resPosts: Array<PostModel> = res.body.body.posts
                const expectId = posts
                    .filter((post) => post.title.includes(keyword))
                    .find((post, idx) => idx == 3)!._id.toString()
                assert.deepEqual(resPosts[0]._id, expectId)
                assert.deepEqual(2, resPosts.length)
                resPosts.forEach((post) => {
                    assert(post.title.includes(keyword), 'should contain keyword')
                })
            }).end(done)
    })

})