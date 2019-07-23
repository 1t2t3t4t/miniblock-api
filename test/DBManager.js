const mongoose = require('../src/db/mongoose.ts');
const {
    MongoMemoryServer
} = require('mongodb-memory-server');

class DBManager {
    constructor() {
        this.db = null
        this.server = new MongoMemoryServer()
    }

    async start() {
        const url = await this.server.getConnectionString()
        console.log('reconnect db to', url)
        this.connection = await mongoose.connect(url, {
            useCreateIndex: true,
            useNewUrlParser: true
        })
        mongoose.connection.db.dropDatabase();
    }

    stop() {
        console.log(this.server.instanceInfoSync.uri, 'stopped')
        return this.server.stop()
    }
}

module.exports = DBManager