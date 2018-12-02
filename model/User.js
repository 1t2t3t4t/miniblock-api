const mongoose = require('mongoose')
const Schema = mongoose.Schema

const User = new Schema({
    displayName: {
        type: String
    }
})

module.exports = mongoose.model('User', User)