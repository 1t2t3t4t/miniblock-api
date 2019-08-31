import express from 'express'

export default class Analytics {

    static shared = new Analytics()

    // http://www.sheshbabu.com/posts/measuring-response-times-of-express-route-handlers/
    logTimeMiddleware(req: express.Request, res: express.Response, next: express.NextFunction) {
        const startHrTime = process.hrtime()

        res.on("finish", () => {
            const elapsedHrTime = process.hrtime(startHrTime)
            const elapsedTimeInMs = elapsedHrTime[0] * 1000 + elapsedHrTime[1] / 1e6
            console.log("%s : %fms", req.path, elapsedTimeInMs)
        })

        next()
    }
}