const mongoose = require('mongoose')
const config = require('../../config')

const env = process.env.ENV || "development"

let mongoURI

switch (env) {
    case 'production':
        mongoURI = config.MONGO_URI
        break;
    case 'staging':
        mongoURI = config.MONGO_URI
        break;
    case 'development':
        mongoURI = config.MONGO_LOCAL_URI
        break;
    default:
        mongoURI = config.MONGO_LOCAL_URI
        break;
}


mongoose.connect(mongoURI, {
    useCreateIndex: true,
    useNewUrlParser: true
}).then(() => {
    console.log('Connected to db.')
})

module.exports = mongoose