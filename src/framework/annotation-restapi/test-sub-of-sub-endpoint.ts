import express from "express";
import {GET, Middleware, POST, RouterController} from "./index";

interface AuthenticatedRequest extends express.Request {
    something?: string
}

function testMiddleware(req: express.Request, res: express.Response, next: express.NextFunction) {
    let r = req as AuthenticatedRequest
    r.something = 'MIDDLEWARE ADD SOMETHING'
    next()
}

@RouterController('/2ndsubroute')
export default class TestSubOfSubRouterController {

    subSubName = 'TestSubOfSubRouterController'

    @GET('/endpoint')
    test(req: express.Request, res: express.Response, next: express.NextFunction) {
        res.send({
            name: this.subSubName
        })
    }

    @POST('/endpoint')
    testPost(req: express.Request, res: express.Response, next: express.NextFunction) {
        res.send({
            name: this.subSubName,
            body: req.body
        })
    }

    @GET('/endpointMD')
    @Middleware(testMiddleware)
    md(req: AuthenticatedRequest, res: express.Response, next: express.NextFunction) {
        res.send({
            name: this.subSubName,
            md: req.something
        })
    }

    @GET('/endpointNoMD')
    noMd(req: AuthenticatedRequest, res: express.Response, next: express.NextFunction) {
        res.send({
            name: this.subSubName,
            md: req.something
        })
    }
}
