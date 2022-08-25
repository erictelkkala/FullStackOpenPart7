const mongoose = require('mongoose')
const supertest = require('supertest')
const app = require('../app')
const api = supertest(app)
const Blog = require('../models/blogSchema')

const initialBlogs = [
    {
        title: 'String',
        author: 'Author',
        url: 'www.String.com',
        likes: 12345,
    },
    {
        title: 'String2',
        author: 'Author2',
        url: 'www.String2.com',
        likes: 1234,
    },
]

beforeEach(async () => {
    await Blog.deleteMany({})
    await Blog.insertMany(initialBlogs)
})

describe('blogs', () => {
    test('Blogs are returned as JSON', async () => {
        await api
            .get('/api/blogs')
            .expect(200)
            .expect('Content-Type', /application\/json/)
    })

    test('All blogs are returned', async () => {
        const response = await api.get('/api/blogs')
        expect(response.body.length).toBe(initialBlogs.length)
    })

    test('The ID field exists and is named _id', async () => {
        const response = await api.get('/api/blogs')
        expect(response.body[0]._id).toBeDefined()
    })

    test('A new blog can be added to the database', async () => {
        const newBlog = {
            title: 'String3',
            author: 'Author3',
            url: 'www.String3.com',
            likes: 123,
        }
        await api
            .post('/api/blogs')
            .send(newBlog)
            .expect(201)
            .expect('Content-Type', /application\/json/)

        const response = await api.get('/api/blogs')
        const lastBlog = response.body[response.body.length - 1]
        // Remove the properties that we cannot test
        delete lastBlog._id && delete lastBlog.__v
        expect(lastBlog).toEqual(newBlog)
    })

    test('If a new blog has no likes, it will default to zero likes', async () => {
        const newBlog = {
            title: 'String3',
            author: 'Author3',
            url: 'www.String3.com',
        }
        await api
            .post('/api/blogs')
            .send(newBlog)
            .expect(201)
            .expect('Content-Type', /application\/json/)

        const response = await api.get('/api/blogs')
        const lastBlog = response.body[response.body.length - 1]
        // Remove the properties that we cannot test
        delete lastBlog._id && delete lastBlog.__v
        expect(lastBlog.likes).toBe(0)
    })

    test('If a new blog has no title or url, it will return status code 400', async () => {
        const newBlog = {
            author: 'Author3',
            likes: 123,
        }
        await api.post('/api/blogs').send(newBlog).expect(400)
    })

    test('A blog can be deleted', async () => {
        // Get all of the blogs and delete the first one
        const blogsAtStart = await api.get('/api/blogs')
        const blogToDelete = blogsAtStart.body[0]
        await api.delete(`/api/blogs/${blogToDelete._id}`).expect(204)
        // Get all of the blogs and check if the first one is gone
        const blogsAtEnd = await api.get('/api/blogs')
        expect(blogsAtEnd.body.length).toBe(blogsAtStart.body.length - 1)
    })

    test('A blog can be updated', async () => {
        // Get all of the blogs and update the first one
        const blogsAtStart = await api.get('/api/blogs')
        const blogToUpdate = blogsAtStart.body[0]

        blogToUpdate.likes = blogToUpdate.likes + 10
        await api
            .put(`/api/blogs/${blogToUpdate._id}`)
            .send(blogToUpdate)
            .expect(200)
        // Get all of the blogs and check if the first one has been updated
        const blogsAtEnd = await api.get('/api/blogs')
        expect(blogsAtEnd.body[0].likes).toBe(blogToUpdate.likes)
    })

    afterAll(() => {
        mongoose.connection.close()
    })
})
