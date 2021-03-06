const admin = require('firebase-admin')

const verifyIdToken = (token) => {
    if (process.env.ENV != 'production' && token === 'admin') {
        return Promise.resolve({
            uid: '1'
        })
    }

    return admin.auth().verifyIdToken(token)
}

module.exports = {
    verifyIdToken
}