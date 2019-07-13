const mongoose = require('mongoose')
const config = require('../../config')

const mongouri = config.MONGO_URI

mongoose.connect(mongouri, {
    useCreateIndex: true,
    useNewUrlParser: true
}).then(() => {
    console.log('Connected to db.')
})

module.exports = mongoose