import mongoose from 'mongoose'
import mongodb from 'mongodb'
const mongooseDB = require('../src/db/mongoose.ts');
import {MongoMemoryServer} from 'mongodb-memory-server'
import User from "../src/model/User";

class DBManager {
    db!: mongodb.Db
    server: MongoMemoryServer
    connection!: mongoose.Connection
    uri! : string

    constructor() {
        this.server = new MongoMemoryServer()
    }

    async start() {
        this.uri = await this.server.getConnectionString()
        this.connection = await mongooseDB.connect(this.uri, {
            useCreateIndex: true,
            useNewUrlParser: true
        })
        this.db = mongoose.connection.db
        this.dropDB()
        await this.stubUser()
        console.log('reconnect db to', this.uri)
    }

    async stubUser() {
        const stubUser = new User({
            email: 'test@email.com',
            displayName: 'username',
            uid: "1"
        })
        return stubUser.save()
    }

    dropDB() {
        this.db.dropDatabase();
    }

    async stop() {
        console.log(this.uri, 'stopped')
        return this.server.stop()
    }
}

module.exports = DBManager