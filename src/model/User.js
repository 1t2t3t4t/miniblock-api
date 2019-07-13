const mongoose = require('mongoose')
const Schema = mongoose.Schema

const Message = require('./Message')

const validator = require('validator')
const jwt = require('jsonwebtoken')

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
    },
    messageList: [
        { type: mongoose.Schema.Types.ObjectId, ref: 'Message' }
    ]
})


/*
* Actually unused but just want to keep it
* */
User.methods.generateAuthToken = async function() {
    const {_id} = this
    const access = 'auth'
    const token = jwt.sign({_id, access}, SALT)

    this.tokens = this.tokens.concat([{access, token}])
    return this.save().then(() => token)
}

User.statics.findByUID = async function(uid) {
    if (!uid) throw Error('uid is missing')

    return this.findOne({ uid })
}

module.exports = mongoose.model('User', User)