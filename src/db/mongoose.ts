const mongoose = require('mongoose')
const url = require('./MongoURL')

const env = process.env.ENV || "development"

let mongoURI: String

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


mongoose.connect(mongoURI, {
    useCreateIndex: true,
    useNewUrlParser: true
}).then(() => {
    console.log('Connected to db.')
})

module.exports = mongoose