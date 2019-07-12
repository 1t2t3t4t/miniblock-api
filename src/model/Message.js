const mongoose = require('mongoose')
const Schema = mongoose.Schema

const Message = new Schema({
    message: {
        type: String,
        required: true
    },
    ownerID: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
})

module.exports = mongoose.model('Message', Message)