import {GET, POST, PUT, RouterController, SubRouterControllers} from "./index";
import express from "express";
import TestSubOfSubRouterController from "./test-sub-of-sub-endpoint";

@RouterController('/1stsubroute')
@SubRouterControllers([
    TestSubOfSubRouterController
])
export default class TestSubRouterController {

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

    @PUT('/endpoint')
    testPut(req: express.Request, res: express.Response, next: express.NextFunction) {
        res.send({
            name: this.subname,
            body: req.body
        })
    }
}