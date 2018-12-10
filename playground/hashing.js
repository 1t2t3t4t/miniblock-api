const crypto = require('crypto')
const jwt = require('jsonwebtoken')

const pass = 'MyPass'
const hash = crypto.createHash('sha256').update(pass).digest('hex')

console.log(`Password is ${pass}`)
console.log(`Hash is ${hash}`)
var user = {
    id: 'Boss',
    password: hash
}

console.log(jwt.sign(user, 'HelloMate'))
