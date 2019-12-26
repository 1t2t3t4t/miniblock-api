import assert from 'assert'
import NewsletterDAO from '../../src/common/NewsletterDAO'
import { NewsletterSubscriberModel } from '../../src/model/NewsletterSubscriber'

const request = require('supertest')

const app = require('../../server')
const DBManager = require('../DBManager')


describe('Newsletter', () => {
    const dbManager = new DBManager()

    const existedEmail = 'someExisitingEmail@email.com'
    let existedSub: NewsletterSubscriberModel

    const newsletterDAO = new NewsletterDAO()

    before((next) => {
        dbManager.start().then(() => {
            return newsletterDAO.subscribe(existedEmail)
        }).then((subscriber: NewsletterSubscriberModel) => {
            existedSub = subscriber
            next()
        }).catch((e: Error) => {
            console.log(e)
        })
    })

    after(() => {
        dbManager.stop()
    })

    const validHeaderToken = { 'authorization': 'Bearer admin'}
    const path = '/v1/newsletter/subscription'

    it('can subscribe succesfully', (done) => {
        request(app)
            .post(path)
            .send({
                email: 'myemail@email.com'
            })
            .expect(200)
            .expect((res: Response) => {
                assert.notDeepEqual(res.body, undefined)
                const body: any = res.body
                console.log(body)
            })
            .end(done)
    })
})