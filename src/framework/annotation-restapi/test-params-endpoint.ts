import {GET, RouterController} from "./index";
import express from 'express'

@RouterController('/:smt')
export default class TestParamsEndpoint {

    name = 'TestParamsEndpoint'

    @GET('/params')
    params(req: express.Request, res: express.Response, next: express.NextFunction) {
        res.status(200).send({
            name: this.name,
            params: req.params
        })
    }
}