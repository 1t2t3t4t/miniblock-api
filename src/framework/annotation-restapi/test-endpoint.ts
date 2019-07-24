import {GET, POST, Middleware, RouterController, SubRouterController} from "../../framework/annotation-restapi";
import express from 'express';

@RouterController('/test')
export default class TestRouterController {

    name = 'TestRouterController'

    @GET('/endpoint')
    test(req: express.Request, res: express.Response, next: express.NextFunction) {
        res.send({
            name: this.name
        })
    }

    @GET('/query')
    query(req: express.Request, res: express.Response, next: express.NextFunction) {
        res.send({
            name: this.name,
            query: req.query
        })
    }

    @GET('/params/:something/yo')
    params(req: express.Request, res: express.Response, next: express.NextFunction) {
        res.send({
            name: this.name,
            params: req.params
        })
    }

    @POST('/endpoint')
    testPost(req: express.Request, res: express.Response, next: express.NextFunction) {
        res.send({
            name: this.name,
            body: req.body
        })
    }

}

@SubRouterController(TestRouterController, '/1stsubroute')
class TestSubRouterController {

    subname = 'TestSubRouterController'

    @GET('/endpoint')
    test(req: express.Request, res: express.Response, next: express.NextFunction) {
        res.send({
            name: this.subname
        })
    }

    @POST('/endpoint')
    testPost(req: express.Request, res: express.Response, next: express.NextFunction) {
        res.send({
            name: this.subname,
            body: req.body
        })
    }
}

interface AuthenticatedRequest extends express.Request {
    something?: string
}

function testMiddleware(req: express.Request, res: express.Response, next: express.NextFunction) {
    let r = req as AuthenticatedRequest
    r.something = 'MIDDLEWARE ADD SOMETHING'
    next()
}

@SubRouterController(TestSubRouterController, '/2ndsubroute')
class TestSubOfSubRouterController {

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
