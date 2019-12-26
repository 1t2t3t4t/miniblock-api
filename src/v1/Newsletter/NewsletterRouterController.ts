import { RouterController, POST } from '../../framework/annotation-restapi'
import { Request, Response, NextFunction } from 'express'
import NewsletterDAO from '../../common/NewsletterDAO'

const HTTPResponse = require('../../model/HTTPResponse')

interface SubscriptionRequest extends Request {
    body: {
        email?: string
    }
}

@RouterController('/newsletter')
export default class NewsletterRouterController {

    private readonly newsletterDAO = new NewsletterDAO()

    @POST('/subscription')
    async subscribe(req: SubscriptionRequest, res: Response, next: NextFunction) {
        const email = req.body.email
        if (email) {
            this.newsletterDAO.subscribe(email).then((subscriber) => {
                res.send(new HTTPResponse.Response({ subscriber }))
            }).catch((err) => {
                res.status(500)
                next(err)
            })
        } else {
            res.status(500)
            next(new Error("Empty email"))
        }
    }
}