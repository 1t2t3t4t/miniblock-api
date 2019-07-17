import express, {Router} from 'express'
import categories from '../../model/Categories'

const HTTPResponse = require('../../model/HTTPResponse');

export default class PostRouterController {

    router: Router

    constructor(router: Router) {
        this.router = router
        this.registerRoute()
    }

    private registerRoute() {
        this.router.post('/', this.categories.bind(this))
    }

    /**
     * @api {GET} /categories Get all categories
     * @apiDescription get all categories
     * @apiGroup Categories
     *
     *
     *
     * @apiSuccess {[Category]} list of categories contains name, id, and iconURL
     *
     * */
    categories(req: express.Request, res: express.Response, next: express.NextFunction) {
        res.status(200).send(new HTTPResponse.Response({ categories }))
    }

}