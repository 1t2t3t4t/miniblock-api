const mongoose = require('mongoose')
const Schema = mongoose.Schema

const Message = require('./Message')

const validator = require('validator')

const User = new Schema({
    email: {
        type: String,
        required: true,
        unique: true,
        validate: {
            validator: validator.isEmail,
            message: '{VALUE is not a valid email.}'
        }
    },
    displayName: {
        type: String,
        required: true,
        minlength: 1,
    },
    userName: {
        type: String,
        required: true,
        unique: true,
        validate: {
            validator: validator.isAlphanumeric,
            message: '{VALUE} should not contain special character'
        },
        minlength: 1
    },
    messages: {
        type: [Message.schema]
    }
})

module.exports = mongoose.model('User', User)