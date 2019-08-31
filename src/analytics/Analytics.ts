import express from 'express'
import ResponseTimeAnalytic, {ResponseTimeAnalyticModel} from "./ResponseTimeAnalytic";

export default class Analytics {

    static shared = new Analytics()

    private responseTime: ResponseTimeAnalyticModel[] = []

    // http://www.sheshbabu.com/posts/measuring-response-times-of-express-route-handlers/
    logTimeMiddleware(req: express.Request, res: express.Response, next: express.NextFunction) {
        const startHrTime = process.hrtime()

        res.on("finish", () => {
            const elapsedHrTime = process.hrtime(startHrTime)
            const elapsedTimeInMs = elapsedHrTime[0] * 1000 + elapsedHrTime[1] / 1e6
            const path = req.path
            console.log("%s : %fms", path, elapsedTimeInMs)
            this.recordResponseTime(path, elapsedTimeInMs)
        })

        next()
    }

    private recordResponseTime(path: string, responseTime: number) {
        this.responseTime.push({
            path,
            responseTime
        } as ResponseTimeAnalyticModel)

        this.sendAnalyticsIfNeeded()
    }

    private sendAnalyticsIfNeeded() {
        if (this.responseTime.length < 30) return
        const responseTimeCopy = Object.assign([], this.responseTime)
        this.responseTime = []

        ResponseTimeAnalytic.insertMany(responseTimeCopy).then((sentAnalytics) => {
            console.log('sent', sentAnalytics.length, 'response time analytics')
        })
    }
}