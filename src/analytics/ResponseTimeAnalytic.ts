import mongoose from 'mongoose'

export interface ResponseTimeAnalyticModel extends mongoose.Document {
    path: string,
    responseTime: number
}

const ResponseTimeAnalytic = new mongoose.Schema({
    path: {
        type: String,
        required: true,
        index: true
    },
    responseTime: {
        type: Number,
        required: true
    }
})

ResponseTimeAnalytic.index({ path: 1, responseTime: 1 })

export default mongoose.model<ResponseTimeAnalyticModel>('ResponseTimeAnalytic', ResponseTimeAnalytic)