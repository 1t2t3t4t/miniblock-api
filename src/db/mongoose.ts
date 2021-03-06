import mongoose, { mongo } from 'mongoose'
const url = require('./MongoURL')

const env = process.env.ENV || "development"

let mongoURI: string

switch (env) {
    case 'production':
        mongoURI = url.MONGO_URI
        break;
    case 'staging':
        mongoURI = url.MONGO_URI
        break;
    case 'development':
        mongoURI = url.MONGO_LOCAL_URI
        break;
    default:
        mongoURI = url.MONGO_LOCAL_URI
        break;
}

console.log(mongoURI)

mongoose.connect(mongoURI, {
    useUnifiedTopology: true,
    useCreateIndex: true,
    useNewUrlParser: true
}).then(() => {
    console.log('Connected to db.')
}).catch((e: Error) => {
    console.log(e.name)
})

module.exports = mongoose