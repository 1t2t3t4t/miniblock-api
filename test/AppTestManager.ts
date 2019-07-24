import supertest, {SuperTest, Response} from 'supertest'

export default class AppTestManager {

    app = require('../server')
    agent!: SuperTest<supertest.Test>

    constructor() {
        this.agent = supertest(this.app)
    }

}
