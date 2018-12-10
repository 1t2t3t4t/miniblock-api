const crypto = require('crypto')

const SHA256 = (data, salt = '') => {
    return crypto.createHash('sha256').update(data).update(salt).digest('hex')
}

module.exports = SHA256