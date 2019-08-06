import Post, {PostModel, PostType} from '../../src/model/Post'
import User, {UserModel, UserRef} from '../../src/model/User'
import {Category} from "../../src/model/Categories";
import {Response} from 'superagent'
import mongoose from 'mongoose'
import PostDAO from "../../src/common/PostDAO";

const assert = require('assert')
const request = require('supertest')
const app = require('../../server')

const DBManager = require('../DBManager')

describe('Fetch all from feed with 1 category', () => {
    const dbManager = new DBManager()
    let posts: Array<PostModel> = []
    before((next) => {
        const stubPost = async (creator: UserRef) => {
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
        const tenId = posts.find((post, index) => index == 15)!._id
        request(app)
            .get(path + `?limit=10&afterId=${tenId}`)
            .expect(200)
            .expect((res: Response) => {
                assert.notDeepEqual(res.body.body.posts, undefined)
                const resPosts: Array<PostModel> = res.body.body.posts
                assert.deepEqual(resPosts.length, 10)
                assert.deepEqual(resPosts[0].title, posts[14].title)
                assert.deepEqual(resPosts[9].title, posts[5].title)
            }).end(done)
    })

    it('should get 5 posts after 20th post', (done) => {
        const twenId = posts.find((post, index) => index == 5)!._id
        request(app)
            .get(path + `?limit=10&afterId=${twenId}`)
            .expect(200)
            .expect((res: Response) => {
                assert.notDeepEqual(res.body.body.posts, undefined)
                const resPosts: Array<PostModel> = res.body.body.posts
                assert.deepEqual(resPosts.length, 5)
                assert.deepEqual(resPosts[0].title, posts[4].title)
                assert.deepEqual(resPosts[4].title, posts[0].title)
            }).end(done)
    })
})

describe('Fetch all from feed with mixed category', () => {
    const dbManager = new DBManager()
    let posts: Array<PostModel> = []
    before((next) => {
        const stubPost = async (creator: UserRef) => {
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
            .find((post, idx) => idx == 15)!._id
        request(app)
            .get(path + '?limit=10&categoryId=' + categoryId + '&afterId=' + afterId)
            .expect(200)
            .expect((res: Response) => {
                assert.notDeepEqual(res.body.body.posts, undefined)
                const resPosts: Array<PostModel> = res.body.body.posts
                assert.deepEqual(resPosts.length, 10)
                const expectId = posts
                    .filter((post) => post.categoryId == categoryId)
                    .find((post, idx) => idx == 14)!._id.toString()
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

        const makePost = (title: string, creator: UserRef): PostModel => {
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

        const stubPost = async (creator: UserRef) => {
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
                    .find((post, idx) => idx == 1)!._id.toString()
                assert.deepEqual(resPosts[0]._id, expectId)
                assert.deepEqual(2, resPosts.length)
                resPosts.forEach((post) => {
                    assert(post.title.includes(keyword), 'should contain keyword')
                })
            }).end(done)
    })

})

describe('Like info in feed', () => {
    const dbManager = new DBManager()
    let posts: Array<PostModel> = []
    before((next) => {
        const stubPost = async (creator: UserRef) => {
            let likedPostModel = {
                type: PostType.TEXT,
                categoryId: Category.Loneliness,
                content: {
                    text: `text`
                },
                creator: creator,
                title: `like`,
                likeInfo: {
                    like: [creator]
                }
            } as PostModel
            const likedPost = await dbManager.stubPost(likedPostModel)
            posts.push(likedPost)

            let notLikedPostModel = {
                type: PostType.TEXT,
                categoryId: Category.Loneliness,
                content: {
                    text: `text`
                },
                creator: creator,
                title: `not like`
            } as PostModel
            const notLikedPost = await dbManager.stubPost(notLikedPostModel)
            posts.push(notLikedPost)
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
    it('like info is valid', (done) => {
        request(app)
            .get(path)
            .set('authorization', 'Bearer admin')
            .expect(200)
            .expect( (res: Response) => {
                assert.notDeepEqual(res.body.body.posts, undefined)
                const resPosts: Array<PostModel> = res.body.body.posts
                const likePost = resPosts.find((post) => post.title == 'like')
                const notLikePost = resPosts.find((post) => post.title == 'not like')
                assert.notDeepEqual(likePost, undefined)
                assert.notDeepEqual(notLikePost, undefined)
                assert.deepStrictEqual(likePost!.likeInfo.isLiked, true)
                assert.deepStrictEqual(notLikePost!.likeInfo.isLiked, false)
                assert.deepStrictEqual(likePost!.likeInfo.count, 1)
                assert.deepStrictEqual(notLikePost!.likeInfo.count, 0)
            }).end(done)
    })
})

describe('Fetch top from feed with mixed category', () => {
    const dbManager = new DBManager()
    let posts: Array<PostModel> = []

    before((next) => {
        const stubPost = async (creator: UserRef) => {
            for(let i=1;i<=25;i++) {
                const randA: mongoose.Types.ObjectId[] = []
                const a = Math.ceil(Math.random() * 100)
                for(let i=1;i<=a;i++) {
                    randA.push(mongoose.Types.ObjectId())
                }
                let modelLoneliness = {
                    type: PostType.TEXT,
                    categoryId: Category.Loneliness,
                    content: {
                        text: `text number ${i}`
                    },
                    creator: creator,
                    title: `${i} catA`,
                    likeInfo: {
                        like: randA
                    }
                } as PostModel
                const randB: mongoose.Types.ObjectId[] = []
                const b = Math.ceil(Math.random() * 100)
                for(let i=1;i<=b;i++) {
                    randB.push(mongoose.Types.ObjectId())
                }
                let modelDepression = {
                    type: PostType.TEXT,
                    categoryId: Category.Depression,
                    content: {
                        text: `text number ${i}`
                    },
                    creator: creator,
                    title: `${i} catB`,
                    likeInfo: {
                        like: randB
                    }
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

    const isOrderedDesc = (posts: PostModel[]): boolean => {
        for(let i=0;i<posts.length - 1;i++) {
            if (posts[i].likeInfo.count! < posts[i].likeInfo.count!) {
                return false
            }
        }

        return true
    }

    const path = '/v1/feed/all?sortType=top'
    it('should get all feed', (done) => {
        request(app)
            .get(path)
            .expect(200)
            .expect((res: Response) => {
                assert.notDeepEqual(res.body.body.posts, undefined)
                const resPosts: Array<PostModel> = res.body.body.posts
                assert.equal(resPosts.length, posts.length)
                assert(isOrderedDesc(resPosts), 'should ordered count by desc')
            }).end(done)
    })

    it('should get 10 posts', (done) => {
        request(app)
            .get(path + '&limit=10')
            .expect(200)
            .expect((res: Response) => {
                assert.notDeepEqual(res.body.body.posts, undefined)
                const resPosts: Array<PostModel> = res.body.body.posts
                assert.deepEqual(resPosts.length, 10)
                assert(isOrderedDesc(resPosts), 'should ordered count by desc')
            }).end(done)
    })

    it('should get 10 posts after 10th', (done) => {
        const categoryId = Category.Depression
        const after = posts
            .sort((a, b) => b.likeInfo.count! - a.likeInfo.count!)
            .find((post, idx) => idx == 15)!
        request(app)
            .get(path + '&limit=10&afterId=' + after._id)
            .expect(200)
            .expect((res: Response) => {
                assert.notDeepEqual(res.body.body.posts, undefined)
                const resPosts: Array<PostModel> = res.body.body.posts
                assert.deepEqual(resPosts.length, 10)
                assert.deepEqual(resPosts.find((post) => post.title == after.title), undefined)
                assert(resPosts[0].likeInfo.count! <= after.likeInfo.count!, 'should start with lower or equal likes')
                assert(isOrderedDesc(resPosts), 'should ordered count by desc')
            }).end(done)
    })

    it('should get 10 posts with specific categoryId', (done) => {
        const categoryId = Category.Depression
        request(app)
            .get(path + '&limit=10&categoryId=' + categoryId)
            .expect(200)
            .expect((res: Response) => {
                assert.notDeepEqual(res.body.body.posts, undefined)
                const resPosts: Array<PostModel> = res.body.body.posts
                assert.deepEqual(resPosts.length, 10)
                resPosts.forEach((post) => {
                    assert.deepEqual(post.categoryId, categoryId)
                })
                assert(isOrderedDesc(resPosts), 'should ordered count by desc')
            }).end(done)
    })

    it('should get 10 posts with specific categoryId after 10th', (done) => {
        const categoryId = Category.Depression
        const after = posts
            .filter((post) => post.categoryId == categoryId)
            .sort((a, b) => b.likeInfo.count! - a.likeInfo.count!)
            .find((post, idx) => idx == 8)!
        request(app)
            .get(path + '&limit=10&categoryId=' + categoryId + '&afterId=' + after._id)
            .expect(200)
            .expect((res: Response) => {
                assert.notDeepEqual(res.body.body.posts, undefined)
                const resPosts: Array<PostModel> = res.body.body.posts
                assert.deepEqual(resPosts.length, 10)
                assert.deepEqual(resPosts.find((post) => post.title == after.title), undefined)
                assert(resPosts[0].likeInfo.count! <= after.likeInfo.count!, 'should start with lower or equal likes')
                resPosts.forEach((post) => {
                    assert.deepEqual(post.categoryId, categoryId)
                })
                assert(isOrderedDesc(resPosts), 'should ordered count by desc')
            }).end(done)
    })

})

describe('Post in feed', () => {
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

    it('can fetch post with auth', (done) => {
        const path = '/v1/feed/all'
        request(app)
            .get(path)
            .set(validHeaderToken)
            .expect(200)
            .expect((res: Response) => {
                assert.notDeepEqual(res.body, undefined)
                const body: any = res.body!
                assert.notDeepEqual(body.body.posts, undefined)
                const post: PostModel = body.body!.posts[0]

                assert.notDeepEqual(post.authInfo, undefined)
                assert.notDeepEqual(post.likeInfo.isLiked, undefined)

                assert.deepEqual(post.authInfo!.canDelete, true)
                assert.deepEqual(post.authInfo!.canEdit, true)
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

})