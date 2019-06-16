const mongoose = require('mongoose')
const Schema = mongoose.Schema

const Message = require('./Message')

const validator = require('validator')
const jwt = require('jsonwebtoken')

const SHA256 = require('../utils/SHA256')

const SALT = 'BossLopeSalt'

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
    password: {
        type: String,
        required: true,
        minlength: 6
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
    messages: {
        type: [Message.schema]
    },
    tokens: [{
        access: {
            type: String,
            required: true
        },
        token: {
            type:String,
            required: true
        }
    }]
})

User.pre('save', function (next) {
    if (this.isModified('password')) {
        const password = this.password
        this.password = SHA256(password)
    }

    next()
})

User.methods.generateAuthToken = async function() {
    const {_id} = this
    const access = 'auth'
    const token = jwt.sign({_id, access}, SALT)

    this.tokens = this.tokens.concat([{access, token}])
    return this.save().then(() => token)
}

User.statics.findByEmailPassword = async function(email, password) {
    if (!password || !email) { throw Error('Invalid email or password.') }
    const hash = SHA256(password)

    return this.findOne({email, password: hash})
}

User.statics.findByAuthToken = async function(authToken) {
    if (!authToken) throw Error('Require Auth Token.')
    const splitedAuthToken = authToken.split(' ')

    if (splitedAuthToken[0] !== 'Bearer' || !splitedAuthToken[1]) { throw Error('Invalid Auth Header.') }

    const token = splitedAuthToken[1]
    const user = jwt.verify(token, SALT)

    return this.findOne({ _id: user._id })
}

module.exports = mongoose.model('User', User)