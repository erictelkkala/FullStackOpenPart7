const User = require('../models/userSchema')
const userRouter = require('express').Router()
const bcrypt = require('bcrypt')

userRouter.post('/', async (request, response) => {
    const { username, name, password } = request.body

    if (!username || !password) {
        return response
            .status(400)
            .json({ error: 'Missing username or password' })
    } else if (password.length < 3) {
        return response
            .status(400)
            .json({ error: 'Password must be at least 3 characters long' })
    } else if (username.length < 3) {
        return response
            .status(400)
            .json({ error: 'Username must be at least 3 characters long' })
    } else {
        const existingUser = await User.findOne({ username })
        if (existingUser) {
            return response
                .status(400)
                .json({ error: 'Username already taken' })
        }

        // Hash the password with salt
        const saltRounds = 10
        const passwordHash = await bcrypt.hash(password, saltRounds)
        // Create a new user with the new password hash
        const user = new User({ username, name, passwordHash })
        const result = await user.save()
        if (result) {
            response.status(201).json(result)
        } else {
            response.status(400).end()
        }
    }
})

// Get all the users
userRouter.get('/', async (request, response) => {
    const users = await User.find({}).populate('blogs', { title: 1, author: 1 })
    response.json(users.map((u) => u.toJSON()))
})

module.exports = userRouter
