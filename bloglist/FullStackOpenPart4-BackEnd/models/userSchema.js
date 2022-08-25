const mongoose = require('mongoose')

const userSchema = new mongoose.Schema({
    blogs: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Blog',
        },
    ],
    username: String,
    name: String,
    userID: String,
    // Do not send the passwordHash to the client
    passwordHash: String,
})

userSchema.options.toJSON = {
    transform: function (document, returnedObject) {
        returnedObject.id = returnedObject._id.toString()
        delete returnedObject._id
        delete returnedObject.passwordHash
        return returnedObject
    },
    versionKey: false,
}

const User = mongoose.model('User', userSchema)

module.exports = User
