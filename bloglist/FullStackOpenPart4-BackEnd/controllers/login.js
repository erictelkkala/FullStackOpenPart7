const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')
const loginRouter = require('express').Router()
const User = require('../models/userSchema')

loginRouter.post('/', async (request, response) => {
    const { username, password } = request.body

    const user = await User.findOne({ username })
    const passwordCorrect =
        user === null
            ? false
            : // The compare function REQUIRES the await keyword to work, otherwise it will accept even wrong passwords
              await bcrypt.compare(password, user.passwordHash)

    if (!(user && passwordCorrect)) {
        return response.status(401).json({
            error: 'invalid username or password',
        })
    }

    const userForToken = {
        username: user.username,
        id: user._id,
    }

    const token = jwt.sign(userForToken, process.env.SECRET, {
        expiresIn: '1h',
    })

    response
        .status(200)
        .send({ token, username: user.username, name: user.name })
})

module.exports = loginRouter
