const mongoose = require('mongoose')
const bcrypt = require('bcrypt')
const supertest = require('supertest')
const app = require('../app')
const api = supertest(app)
const User = require('../models/userSchema')
const Blog = require('../models/blogSchema')
const helper = require('../utils/user_helpers')

describe('when there is initially one user in db', () => {
    // Delete all the blogs from the database
    beforeAll(async () => {
        await Blog.deleteMany({})
    })

    beforeEach(async () => {
        await User.deleteMany({})

        const passwordHash = await bcrypt.hash('secret', 10)
        const user = new User({
            username: 'root',
            name: 'rootUser',
            passwordHash,
        })

        await user.save()
    })

    test('a list of users is returned', async () => {
        const usersInDb = await helper.usersInDb()
        expect(usersInDb).toHaveLength(1)
    })

    test('creation succeeds with a fresh username', async () => {
        const usersAtStart = await helper.usersInDb()

        const newUser = {
            username: 'mluukkai',
            name: 'Matti Luukkainen',
            password: 'salainen',
        }

        await api
            .post('/api/users')
            .send(newUser)
            .expect(201)
            .expect('Content-Type', /application\/json/)

        const usersAtEnd = await helper.usersInDb()
        expect(usersAtEnd).toHaveLength(usersAtStart.length + 1)

        const usernames = usersAtEnd.map((u) => u.username)
        expect(usernames).toContain(newUser.username)
    })

    test('Creation fails if username is taken', async () => {
        const usersAtStart = await helper.usersInDb()
        const newUser = {
            username: 'root',
            password: 'root',
        }
        await api.post('/api/users').send(newUser).expect(400)
        const usersAtEnd = await helper.usersInDb()
        expect(usersAtEnd).toHaveLength(usersAtStart.length)
    })

    test('Creation fails if password is under 3 characters long', async () => {
        const usersAtStart = await helper.usersInDb()
        const newUser = {
            username: 'mluukkai',
            name: 'Matti Luukkainen',
            password: 'sa',
        }
        await api.post('/api/users').send(newUser).expect(400)
        const usersAtEnd = await helper.usersInDb()
        expect(usersAtEnd).toHaveLength(usersAtStart.length)
    })

    test('Creation fails if username is under 3 characters long', async () => {
        const usersAtStart = await helper.usersInDb()
        const newUser = {
            username: 'ml',
            name: 'Matti Luukkainen',
            password: 'salasana',
        }
        await api.post('/api/users').send(newUser).expect(400)
        const usersAtEnd = await helper.usersInDb()
        expect(usersAtEnd).toHaveLength(usersAtStart.length)
    })

    test('User can log in', async () => {
        const usersAtStart = await helper.usersInDb()
        const newUser = {
            username: 'mluukkai',
            name: 'Matti Luukkainen',
            password: 'salainen',
        }

        // Create a new user
        await api
            .post('/api/users')
            .send(newUser)
            .expect(201)
            .expect('Content-Type', /application\/json/)

        // Check that the user is added to the database
        const usersAtEnd = await helper.usersInDb()
        expect(usersAtEnd).toHaveLength(usersAtStart.length + 1)

        const loginDetails = {
            username: 'mluukkai',
            password: 'salainen',
        }

        // Check that the user can log in
        await api.post('/api/login').send(loginDetails).expect(200)
    })

    test('user root exists in the database', async () => {
        const usersInDb = await helper.usersInDb()
        const usernames = usersInDb.map((u) => u.username)
        expect(usernames).toContain('root')
    })

    test('Blogs have references to a user when created', async () => {
        // Login to get the auth token
        const loginDetails = {
            username: 'root',
            password: 'secret',
        }

        // Login to get the auth token
        const response = await api.post('/api/login').send(loginDetails)
        const authToken = response.body.token

        const newBlog = {
            title: 'Test blog',
            author: 'Test author',
            url: 'http://www.test.com',
            likes: 5,
        }

        await api
            .post('/api/blogs')
            .auth(authToken, { type: 'bearer' })
            .send(newBlog)
            .expect(201)
            .expect('Content-Type', /application\/json/)
    })

    test('Users have a reference to their blogs', async () => {
        // Login to get the auth token
        const loginDetails = {
            username: 'root',
            password: 'secret',
        }

        const response = await api.post('/api/login').send(loginDetails)
        const authToken = response.body.token

        const newBlog = {
            title: 'Test blog',
            author: 'Test author',
            url: 'http://www.test.com',
            likes: 5,
        }

        await api
            .post('/api/blogs')
            .auth(authToken, { type: 'bearer' })
            .send(newBlog)
            .expect(201)
            .expect('Content-Type', /application\/json/)

        const usersInDb = await helper.usersInDb()
        const user = usersInDb.find((u) => u.username === 'root')
        expect(user.blogs).toHaveLength(1)
    })

    test('Blog can only be added with a token', async () => {
        const loginDetails = {
            username: 'root',
            password: 'secret',
        }

        const response = await api.post('/api/login').send(loginDetails)
        const authToken = response.body.token

        const newBlog = {
            title: 'Test blog',
            author: 'Test author',
            url: 'http://www.test.com',
            likes: 5,
        }

        // Expect that the blog cannot be added without a token
        await api.post('/api/blogs').send(newBlog).expect(401)

        // Expect that the blog can be added with a token
        await api
            .post('/api/blogs')
            .auth(authToken, { type: 'bearer' })
            .send(newBlog)
            .expect(201)
    })

    test('A blog can be deleted only with a token', async () => {
        // Login to get the auth token
        const loginDetails = {
            username: 'root',
            password: 'secret',
        }

        // Login to get the auth token
        const response = await api.post('/api/login').send(loginDetails)
        const authToken = response.body.token

        const newBlog = {
            title: 'Test blog',
            author: 'Test author',
            url: 'http://www.test.com',
            likes: 5,
        }

        await api
            .post('/api/blogs')
            .auth(authToken, { type: 'bearer' })
            .send(newBlog)
            .expect(201)
            .expect('Content-Type', /application\/json/)

        const blogsInDb = await helper.blogsInDb()
        // Delete the last blog
        const blogToDelete = blogsInDb[blogsInDb.length - 1]
        // console.log(blogToDelete)

        // Expect that you cannot delete a blog without a token
        await api.delete(`/api/blogs/${blogToDelete._id}`).expect(401)

        // Expect that you can only delete a blog with a correct token
        await api
            .delete(`/api/blogs/${blogToDelete.id}`)
            .auth(authToken, { type: 'bearer' })
            .expect(204)
    })

    test('A blog can only be deleted by its creator', async () => {
        // Login to get the auth token
        const loginDetails = {
            username: 'root',
            password: 'secret',
        }

        // Login to get the auth token
        const response = await api.post('/api/login').send(loginDetails)
        const authToken = response.body.token

        const newBlog = {
            title: 'Test blog',
            author: 'Test author',
            url: 'http://www.test.com',
            likes: 5,
        }

        await api
            .post('/api/blogs')
            .auth(authToken, { type: 'bearer' })
            .send(newBlog)
            .expect(201)
            .expect('Content-Type', /application\/json/)

        const blogsInDb = await helper.blogsInDb()
        // Delete the last blog
        const blogToDelete = blogsInDb[blogsInDb.length - 1]
        // Login with another user
        const loginDetails2 = {
            username: 'mluukkai',
            password: 'salainen',
        }

        // Login to get the auth token
        const response2 = await api.post('/api/login').send(loginDetails2)
        const authToken2 = response2.body.token

        // Expect that you cannot delete a blog with another user
        await api
            .delete(`/api/blogs/${blogToDelete._id}`)
            .auth(authToken2, { type: 'bearer' })
            .expect(401)

        // Expect that you can only delete a blog with a correct token
        await api
            .delete(`/api/blogs/${blogToDelete.id}`)
            .auth(authToken, { type: 'bearer' })
            .expect(204)
    })

    afterAll(async () => {
        await mongoose.connection.close()
    })
})
