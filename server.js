const express = require('express')
const authentication = require('./router/authentication')
const port = process.env.PORT || 3000
const db = require('./db/mongoose')

let app = express()

app.get('/', (req, res) => {
    res.send('Hello World')
});

app.use('/auth', authentication)

app.listen(port, () => {
    console.log('Server started on port', port)
})
