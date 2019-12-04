import mongoose from 'mongoose'
import mongodb from 'mongodb'
const mongooseDB = require('../src/db/mongoose.ts');
import {MongoMemoryServer} from 'mongodb-memory-server'
import User, {UserModel} from "../src/model/User";
import Post, {PostModel} from "../src/model/Post";

class DBManager {

    db!: mongodb.Db
    server: MongoMemoryServer
    connection!: mongoose.Connection
    uri!: string
    defaultUser!: UserModel
    authHeader = { 'Authorization': 'Bearer admin' }

    constructor() {
        this.server = new MongoMemoryServer()
    }

    async start() {
        this.uri = await this.server.getConnectionString()
        this.connection = await mongooseDB.connect(this.uri, {
            useUnifiedTopology: true,
            useCreateIndex: true,
            useNewUrlParser: true
        })
        this.db = mongoose.connection.db
        this.dropDB()
        const user = {
            email: 'test@email.com',
            displayName: 'username',
            uid: "1"
        } as UserModel
        this.defaultUser = await this.stubUser(user)
        console.log('reconnect db to', this.uri)
    }

    async stubUser(user: UserModel) {
        const stubUser = new User(user)
        return stubUser.save()
    }

    async stubPost(post: PostModel) {
        const stubPost = new Post(post)
        return stubPost.save()
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