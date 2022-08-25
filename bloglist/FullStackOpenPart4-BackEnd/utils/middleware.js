const jwt = require('jsonwebtoken')
const User = require('../models/userSchema')

const tokenExtractor = async (request, response, next) => {
    const authorization = request.get('authorization')
    if (authorization && authorization.toLowerCase().startsWith('bearer ')) {
        // Send the token as a header named token
        request.token = await authorization.substring(7)
        next()
    } else {
        response.status(401).json({ error: 'token missing or invalid' }).end()
    }
}

const userExtractor = async (request, response, next) => {
    const authorization = request.get('authorization')
    if (authorization && authorization.toLowerCase().startsWith('bearer ')) {
        // Get the username of the token holder
        const decodedToken = jwt.verify(
            authorization.substring(7),
            process.env.SECRET
        )
        const user = await User.findById(decodedToken.id)
        if (user) {
            request.user = user
            next()
        } else {
            response
                .status(401)
                .json({ error: 'token missing or invalid' })
                .end()
        }
    } else {
        response.status(401).json({ error: 'Invalid token format' }).end()
    }
}

module.exports = { tokenExtractor, userExtractor }
