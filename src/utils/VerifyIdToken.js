const admin = require('firebase-admin')

const verifyIdToken = (token) => admin.auth().verifyIdToken(token)

module.exports = {
    verifyIdToken
}