import { useState, useEffect, useRef } from 'react'
import Blog from './components/Blog'
import blogService from './services/blogs'
import loginService from './services/login'
import LoginForm from './components/LoginForm'
import BlogForm from './components/BlogForm'
import Notification from './components/Notification'
import Togglable from './components/Toggleable'

const App = () => {
    const [errorMessage, setErrorMessage] = useState(null)
    const [successMessage, setSuccessMessage] = useState(null)
    const [blogs, setBlogs] = useState([])
    const [user, setUser] = useState(null)
    const [username, setUsername] = useState('')
    const [password, setPassword] = useState('')

    const blogFormRef = useRef()

    useEffect(() => {
        blogService.getAll().then((blogs) => setBlogs(blogs))
        // If the user is cached, get the user from localStorage
        if (localStorage.getItem('user')) {
            setUser(JSON.parse(localStorage.getItem('user')))
        }
    }, [])

    const handleLogin = async (event) => {
        event.preventDefault()

        try {
            const user = await loginService.login({
                username,
                password,
            })
            setUser(user)
            setSM(`${user.name} logged in`)
            window.localStorage.setItem('user', JSON.stringify(user))
            setUsername('')
            setPassword('')
        } catch (exception) {
            setEM('Wrong username or password')
        }
    }

    const handleLogout = () => {
        setUser(null)
        setSM('Logged out')
        window.localStorage.removeItem('user')
    }

    const handleLike = async (blog) => {
        const blogToUpdate = { ...blog }
        // Increment the likes
        blogToUpdate.likes = blog.likes + 1
        // Remove the user from the blog
        delete blogToUpdate.user
        const updatedBlog = await blogService.update(blogToUpdate, user)
        // Since the user is not sent to the server, we need to add it back so the client does not need to refresh the page
        updatedBlog.user = blog.user
        // Update the blogs array
        setBlogs(blogs.map((b) => (b.id !== blog.id ? b : updatedBlog)))
        // Show a success message
        setSM(`Liked ${blog.title}`)
    }

    const handleRemove = async (blog) => {
        const ok = await window.confirm(
            `Remove ${blog.title} by ${blog.author}?`
        )
        if (ok) {
            try {
                await blogService.remove(blog, user)
                // Remove the blog from the blogs array
                setBlogs(blogs.filter((b) => b.id !== blog.id))
                setSM(`${blog.title} by ${blog.author} removed`)
            } catch (exception) {
                if (exception.response.status === 404) {
                    setEM(`${blog.title} by ${blog.author} not found`)
                    // The user token expires in 1 hour, so display an error message for that
                } else if (exception.response.status === 500) {
                    setEM('Please log in again')
                } else {
                    setEM(
                        `${blog.title} by ${blog.author} could not be removed`
                    )
                }
            }
        }
    }

    async function addBlog(blog) {
        try {
            // Toggle the visibility
            blogFormRef.current.toggleVisibility()
            const newBlog = await blogService.create(blog, user)
            setBlogs(blogs.concat(newBlog))
            setSM(
                'A new blog "' +
                    newBlog.title +
                    '" by "' +
                    newBlog.author +
                    '" added'
            )
        } catch (exception) {
            setEM('Error adding blog')
        }
    }

    function setEM(message) {
        setErrorMessage(message)
        setTimeout(() => {
            setErrorMessage(null)
        }, 5000)
    }

    function setSM(message) {
        setSuccessMessage(message)
        setTimeout(() => {
            setSuccessMessage(null)
        }, 5000)
    }

    const logoutButton = () => <button onClick={handleLogout}>logout</button>

    const BlogList = () => {
        // Sort the blogs by likes
        const sortedBlogs = blogs.sort((a, b) => b.likes - a.likes)
        return (
            <div>
                {sortedBlogs.map((blog) => (
                    <Blog
                        key={blog.id}
                        blog={blog}
                        like={handleLike}
                        remove={handleRemove}
                    />
                ))}
            </div>
        )
    }

    return (
        <div>
            <h2>blogs</h2>

            {/* Error or success notification */}
            {errorMessage === null ? (
                <Notification message={successMessage} type="success" />
            ) : (
                <Notification message={errorMessage} type="error" />
            )}

            {/* Display the login form if the user is not logged in */}
            {user === null ? (
                <LoginForm
                    handleLogin={handleLogin}
                    username={username}
                    handleChangeUsername={({ target }) =>
                        setUsername(target.value)
                    }
                    password={password}
                    handleChangePassword={({ target }) =>
                        setPassword(target.value)
                    }
                />
            ) : (
                <div>
                    <p>
                        {' '}
                        {user.name} logged in {logoutButton()}
                    </p>{' '}
                    <Togglable buttonLabel="Add a new blog" ref={blogFormRef}>
                        <BlogForm createBlog={addBlog} />
                    </Togglable>
                    <BlogList> </BlogList>
                </div>
            )}
        </div>
    )
}

export default App
