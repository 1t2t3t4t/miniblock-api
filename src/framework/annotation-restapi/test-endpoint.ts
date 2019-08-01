import {
    GET,
    POST,
    Middleware,
    RouterController,
    PUT,
    SubRouterControllers
} from "../../framework/annotation-restapi";
import express from 'express';
import TestSubRouterController from "./test-sub-endpoint";


@RouterController('/test')
@SubRouterControllers([
    TestSubRouterController
])
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

    @PUT('/endpoint')
    testPut(req: express.Request, res: express.Response, next: express.NextFunction) {
        res.send({
            name: this.name,
            body: req.body
        })
    }
}
