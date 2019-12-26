import assert from 'assert'
import NewsletterDAO from '../../src/common/NewsletterDAO'
import NewsletterSubscriber, { NewsletterSubscriberModel } from '../../src/model/NewsletterSubscriber'

const request = require('supertest')

const app = require('../../server')
const DBManager = require('../DBManager')


describe('Newsletter subscription', () => {
    const dbManager = new DBManager()

    const existedEmail = 'someExisitingEmail@email.com'
    let existedSub: NewsletterSubscriberModel

    const newsletterDAO = new NewsletterDAO()

    before((next) => {
        dbManager.start().then(() => {
            return newsletterDAO.subscribe(existedEmail)
        }).then((subscriber: NewsletterSubscriberModel) => {
            existedSub = subscriber
            return NewsletterSubscriber.ensureIndexes()
        }).then(next)
        .catch((e: Error) => {
            console.log(e)
        })
    })

    after(() => {
        dbManager.stop()
    })

    const validHeaderToken = { 'authorization': 'Bearer admin'}
    const path = '/v1/newsletter/subscription'

    it('can subscribe succesfully', async () => {
        const expectedEmail = 'myemail@email.com'
        await request(app)
            .post(path)
            .send({
                email: expectedEmail
            })
            .expect(200)
            .expect((res: Response) => {
                assert.notDeepEqual(res.body, undefined)
                const body: any = res.body
                const subscriber = body.body.subscriber as NewsletterSubscriberModel
                assert.deepEqual(false, subscriber.isCancelled)
                assert.deepEqual(expectedEmail, subscriber.email)
            })
    })

    it('can not subscribe if invalid email', async () => {
        const email = 'corruptedemail'
        await request(app)
            .post(path)
            .send({
                email
            })
            .expect(500)
            .expect((res: Response) => {
                assert.notDeepEqual(res.body, undefined)
                const body: any = res.body
                assert.deepEqual('error', body.status)
                const msg = body.body.message as string
                assert.deepEqual(true, msg.includes('is not a valid'))
            })
    })

    it('can not subscribe if empty email', async () => {
        await request(app)
            .post(path)
            .send()
            .expect(500)
            .expect((res: Response) => {
                assert.notDeepEqual(res.body, undefined)
                const body: any = res.body
                assert.deepEqual('error', body.status)
                const msg = body.body.message as string
                assert.deepEqual('Empty email', msg)
            })
    })

    it('can not subscribe if dup email', async () => {
        await request(app)
            .post(path)
            .send({
                email: existedEmail
            })
            .expect(500)
            .expect((res: Response) => {
                assert.notDeepEqual(res.body, undefined)
                const body: any = res.body
                assert.deepEqual('error', body.status)
                const msg = body.body.message as string
                assert.deepEqual(true, msg.includes('duplicate key error dup key'))
            })
    })
})