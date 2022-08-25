import { useState } from 'react'
import PropTypes from 'prop-types'

const BlogForm = (props) => {
    const [newTitle, setNewTitle] = useState('')
    const [newAuthor, setNewAuthor] = useState('')
    const [newUrl, setNewUrl] = useState('')

    async function addBlog(event) {
        event.preventDefault()
        const blog = {
            title: newTitle,
            author: newAuthor,
            url: newUrl,
        }
        try {
            // Send the blog to the parent component
            await props.createBlog(blog)
            setNewTitle('')
            setNewAuthor('')
            setNewUrl('')
        } catch (exception) {
            console.log(exception)
        }
    }

    return (
        <div>
            <h2>create new</h2>
            <form onSubmit={addBlog}>
                <div>
                    title
                    <input
                        value={newTitle}
                        id="title"
                        onChange={({ target }) => setNewTitle(target.value)}
                    />
                </div>
                <div>
                    author
                    <input
                        value={newAuthor}
                        id="author"
                        onChange={({ target }) => setNewAuthor(target.value)}
                    />
                </div>
                <div>
                    url
                    <input
                        value={newUrl}
                        id="url"
                        onChange={({ target }) => setNewUrl(target.value)}
                    />
                </div>
                <button type="submit">create</button>
            </form>
        </div>
    )
}

BlogForm.propTypes = {
    createBlog: PropTypes.func.isRequired,
}

export default BlogForm
