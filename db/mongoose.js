const mongoose = require('mongoose')
const config = require('../config')

mongoose.connect(config.mongouri, { useNewUrlParser: true })
    .then(() => {
        console.log('Connected to db.')
    })

module.exports = mongoose