const mongoose = require('@db/mongoose');
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
        this.connection = await mongoose.connect(url, {
            useCreateIndex: true,
            useNewUrlParser: true
        })
        mongoose.connection.db.dropDatabase();
    }

    stop() {
        return this.server.stop()
    }
}

module.exports = new DBManager()