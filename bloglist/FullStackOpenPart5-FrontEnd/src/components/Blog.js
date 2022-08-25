import { useState } from 'react'
import PropTypes from 'prop-types'

const Blog = (props) => {
    const [visible, setVisible] = useState(false)

    const hidden = { display: visible ? '' : 'none' }

    // Assign the blog to a const from the props
    const blog = props.blog

    const blogStyle = {
        paddingTop: 10,
        paddingBottom: 5,
        paddingLeft: 2,
        border: 'solid',
        borderWidth: 1,
        marginBottom: 5,
    }

    const toggleVisibility = () => {
        setVisible(!visible)
    }

    return (
        <article style={blogStyle}>
            <div className="Title_and_author">
                {blog.title} {blog.author}
            </div>
            {!visible ? (
                <button onClick={toggleVisibility}>Expand</button>
            ) : (
                <button onClick={toggleVisibility}>Collapse</button>
            )}
            <div style={hidden} className="hidden">
                <a className="blogURL" href={blog.url}>
                    {blog.url}
                </a>
                <br></br>
                <div className="likes">
                    {blog.likes} likes {''}
                    <button onClick={() => props.like(blog)}>Like</button>
                </div>
                {blog.user.name}
                <br></br>
                <button onClick={() => props.remove(blog)}>Remove</button>
            </div>
        </article>
    )
}

Blog.propTypes = {
    // Blog shape
    blog: PropTypes.shape({
        title: PropTypes.string.isRequired,
        author: PropTypes.string.isRequired,
        url: PropTypes.string.isRequired,
        likes: PropTypes.number.isRequired,
        user: PropTypes.object.isRequired,
    }).isRequired,
    // Functions
    like: PropTypes.func.isRequired,
    remove: PropTypes.func.isRequired,
}

export default Blog
