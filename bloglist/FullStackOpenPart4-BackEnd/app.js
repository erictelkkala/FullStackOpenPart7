const express = require('express')
const app = express()
require('express-async-errors')
const cors = require('cors')
const mongoose = require('mongoose')
const logger = require('./utils/logger')
const config = require('./utils/config')
const blogRouter = require('./controllers/blogRouter')
const userRouter = require('./controllers/userRouter')
const loginRouter = require('./controllers/login')
const testingRouter = require('./controllers/testingRouter')

const mongodbURI = config.MONGODB_URI
mongoose
    .connect(mongodbURI)
    .then(() => {
        logger.info('Connected to MongoDB')
    })
    .catch((error) => {
        logger.error('Error connecting to MongoDB:', error.message)
    })

const unknownEndpoint = (request, response) => {
    response.status(404).send({ error: 'Unknown endpoint' })
}

const errorHandler = (error, request, response, next) => {
    if (error.name === 'CastError') {
        return response.status(400).send({
            error: 'Malformed id',
        })
    } else if (error.name === 'ValidationError') {
        return response.status(400).json({
            error: error.message,
        })
    } else if (error.name === 'JsonWebTokenError') {
        return response
            .status(401)
            .json({ error: 'Invalid authorization token' })
    }

    logger.error(error.message)

    next(error)
}

app.use(express.json())
app.use('/api/blogs', blogRouter)
app.use('/api/users', userRouter)
app.use('/api/login', loginRouter)
// Router for the test environment
if (process.env.NODE_ENV === 'test') {
    app.use('/api/testing', testingRouter)
}
app.use(unknownEndpoint)
app.use(errorHandler)
app.use(cors())

module.exports = app
