import AppTestManager from '../AppTestManager'
import assert from 'assert'
import {PostType} from "../../src/model/Post";
import {Category} from "../../src/model/Categories";
const DBManager = require('../DBManager')

const dbManager = new DBManager()
const manager = new AppTestManager()

describe('Create post', () => {
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