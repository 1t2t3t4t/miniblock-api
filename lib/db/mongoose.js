const mongoose = require('mongoose')
const config = require('../config')

mongoose.connect(config.mongouri, {
    useCreateIndex: true,
    useNewUrlParser: true
}).then(() => {
    console.log('Connected to db.')
})

module.exports = mongoose