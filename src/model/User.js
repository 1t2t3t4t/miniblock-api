const mongoose = require('mongoose')
const Schema = mongoose.Schema

const validator = require('validator')

const User = new Schema({
    uid: {
        type: String,
        required: true,
        unique: true
    },
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
        minlength: 1,
    },
    username: {
        type: String,
        required: true,
        unique: true,
        validate: {
            validator: validator.isAlphanumeric,
            message: '{VALUE} should not contain special character'
        },
        minlength: 1
    }
})

User.statics.findByUID = async function(uid) {
    if (!uid) throw Error('uid is missing')

    return this.findOne({ uid })
}

module.exports = mongoose.model('User', User)