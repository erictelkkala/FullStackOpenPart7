const Blog = require('../models/blogSchema')
const blogRouter = require('express').Router()
const jwt = require('jsonwebtoken')
const { tokenExtractor, userExtractor } = require('../utils/middleware')

// Get every blog from the database
blogRouter.get('/', async (request, response) => {
    const blogs = await Blog.find({}).populate('user', { username: 1, name: 1 })
    if (blogs) {
        response.json(blogs)
    } else {
        response.status(404).end()
    }
})

// Add a new blog to the database
blogRouter.post(
    '/',
    tokenExtractor,
    userExtractor,
    async (request, response) => {
        const blog = request.body
        // console.log('Token:' + request.token)
        // console.log('Blog:' + blog)

        const decodedToken = jwt.verify(request.token, process.env.SECRET)
        if (!decodedToken.id) {
            return response
                .status(401)
                .json({ error: 'Token missing or invalid' })
        }

        // Get the user from the database using the id of the token holder
        const user = request.user
        // If the likes property is not defined, set it to 0
        if (blog.likes === undefined) {
            blog.likes = 0
            // If the name and url properties are not defined, return a 400 error
        } else if (blog.title === undefined || blog.url === undefined) {
            response.status(400).end()
        }

        const newBlog = new Blog({
            title: blog.title,
            author: blog.author,
            url: blog.url,
            likes: blog.likes,
            user: user.id,
        })

        const result = await newBlog.save()
        if (result) {
            user.blogs = user.blogs.concat(result.id)
            await user.save()
            response.status(201).json(result)
        } else {
            response.status(400).end()
        }
    }
)

// Delete a blog from the database
blogRouter.delete(
    '/:id',
    tokenExtractor,
    userExtractor,
    async (request, response) => {
        // Check if the token is valid
        const decodedToken = jwt.verify(request.token, process.env.SECRET)
        if (!decodedToken.id) {
            return response
                .status(401)
                .json({ error: 'Token missing or invalid' })
        }

        // Get the user from the database using the id of the token holder
        const user = request.user
        if (user) {
            // Get the blog from the database using the id in the url
            const blog = await Blog.findById(request.params.id)
            if (blog) {
                // Check if the blog belongs to the user
                if (blog.user.toString() !== user.id.toString()) {
                    return response.status(401).json({ error: 'Unauthorized' })
                }
                // Delete the blog
                await Blog.findByIdAndRemove(request.params.id)
                // Remove the blog from the user's blogs array
                user.blogs = user.blogs.filter(
                    (blog) => blog.toString() !== request.params.id.toString()
                )
                // Save the user
                await user.save()
                response.status(204).end()
                // If the blog does not exist, return a 404 error
            } else {
                response.status(404).end()
            }
            // If the user does not exist, return a 404 error
        } else {
            response.status(404).json({ error: 'User not found' })
        }
    }
)

// Update a blog in the database
blogRouter.put(
    '/:id',
    tokenExtractor,
    // Does not need userExtractor, because that would limit only the creator to like their own blog
    async (request, response) => {
        const result = await Blog.findByIdAndUpdate(
            request.params.id,
            request.body,
            {
                new: true,
            }
        )
        if (result) {
            response.json(result)
        }
        response.status(400).end()
    }
)

module.exports = blogRouter
