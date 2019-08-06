import {
    GET,
    POST,
    Middleware,
    RouterController,
    PUT,
    SubRouterControllers, DELETE, PATCH
} from "../../framework/annotation-restapi";
import express from 'express';
import TestSubRouterController from "./test-sub-endpoint";
import TestParamsEndpoint from "./test-params-endpoint";


@RouterController('/test')
@SubRouterControllers([
    TestSubRouterController,
    TestParamsEndpoint
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

    @PATCH('/endpoint')
    testPatch(req: express.Request, res: express.Response, next: express.NextFunction) {
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

    @DELETE('/endpoint')
    testDelete(req: express.Request, res: express.Response, next: express.NextFunction) {
        res.send({
            name: this.name,
            body: req.body
        })
    }
}
