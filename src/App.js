import { useState } from 'react'
import {
    Link,
    BrowserRouter as Router,
    Routes,
    Route,
    useParams,
    useNavigate,
} from 'react-router-dom'

const Menu = ({ anecdotes, addNew }) => {
    const padding = {
        paddingRight: 5,
    }
    return (
        <Router>
            <div>
                <Link style={padding} to="/">
                    Anecdotes
                </Link>
                <Link style={padding} to="/createnew">
                    Create new
                </Link>
                <Link style={padding} to="/about">
                    About
                </Link>
            </div>

            <Routes>
                <Route
                    path="/"
                    element={<AnecdoteList anecdotes={anecdotes} />}
                />
                <Route
                    path="/anecdotes/:id"
                    element={<SingleAnecdote anecdotes={anecdotes} />}
                />
                <Route
                    path="/createnew"
                    element={<CreateNew addNew={addNew} />}
                />
                <Route path="/about" element={<About />} />
            </Routes>
        </Router>
    )
}

const AnecdoteList = ({ anecdotes }) => (
    <div>
        <h2>Anecdotes</h2>
        <ul>
            {anecdotes.map((anecdote) => (
                <li key={anecdote.id}>
                    <Link to={`/anecdotes/${anecdote.id}`}>
                        {anecdote.content}
                    </Link>
                </li>
            ))}
        </ul>
    </div>
)

const SingleAnecdote = ({ anecdotes }) => {
    const id = useParams().id
    console.log('id', id)
    console.log(anecdotes)

    let anecdote = anecdotes.find((anecdote) => anecdote.id === Number(id))
    console.log('anecdote', anecdote)

    return (
        <div>
            <h2>
                {anecdote.content} by {anecdote.author}
            </h2>
            <p>It has {anecdote.votes} votes</p>
            <p>
                For more info see <a href={anecdote.info}>{anecdote.info}</a>
            </p>
        </div>
    )
}

const About = () => (
    <div>
        <h2>About anecdote app</h2>
        <p>According to Wikipedia:</p>

        <em>
            An anecdote is a brief, revealing account of an individual person or
            an incident. Occasionally humorous, anecdotes differ from jokes
            because their primary purpose is not simply to provoke laughter but
            to reveal a truth more general than the brief tale itself, such as
            to characterize a person by delineating a specific quirk or trait,
            to communicate an abstract idea about a person, place, or thing
            through the concrete details of a short narrative. An anecdote is "a
            story with a point."
        </em>

        <p>
            Software engineering is full of excellent anecdotes, at this app you
            can find the best and add more.
        </p>
    </div>
)

const Footer = () => (
    <div>
        Anecdote app for{' '}
        <a href="https://fullstackopen.com/">Full Stack Open</a>. See{' '}
        <a href="https://github.com/fullstack-hy2020/routed-anecdotes/blob/master/src/App.js">
            https://github.com/fullstack-hy2020/routed-anecdotes/blob/master/src/App.js
        </a>{' '}
        for the source code.
    </div>
)

const CreateNew = (props) => {
    const [content, setContent] = useState('')
    const [author, setAuthor] = useState('')
    const [info, setInfo] = useState('')
    const navigate = useNavigate()

    const handleSubmit = async (e) => {
        e.preventDefault()
        await props.addNew({
            content,
            author,
            info,
            votes: 0,
        })
        // Navigate to the "home page" after creating a new anecdote
        navigate('/')
    }

    return (
        <div>
            <h2>create a new anecdote</h2>
            <form onSubmit={handleSubmit}>
                <div>
                    content
                    <input
                        name="content"
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                    />
                </div>
                <div>
                    author
                    <input
                        name="author"
                        value={author}
                        onChange={(e) => setAuthor(e.target.value)}
                    />
                </div>
                <div>
                    url for more info
                    <input
                        name="info"
                        value={info}
                        onChange={(e) => setInfo(e.target.value)}
                    />
                </div>
                <button>create</button>
            </form>
        </div>
    )
}

const App = () => {
    const [anecdotes, setAnecdotes] = useState([
        {
            content: 'If it hurts, do it more often',
            author: 'Jez Humble',
            info: 'https://martinfowler.com/bliki/FrequencyReducesDifficulty.html',
            votes: 0,
            id: 1,
        },
        {
            content: 'Premature optimization is the root of all evil',
            author: 'Donald Knuth',
            info: 'http://wiki.c2.com/?PrematureOptimization',
            votes: 0,
            id: 2,
        },
    ])

    const [notification, setNotification] = useState('')

    // Notification component
    const Notification = ({ notification }) => {
        const notificationStyle = {
            border: 'solid',
            padding: 10,
            borderWidth: 1,
        }

        // If notification is empty, return null
        if (notification === '' || notification === null) {
            return null
        } else {
            return (
                <div style={notificationStyle} className="notification">
                    {notification}
                </div>
            )
        }
    }

    const addNew = (anecdote) => {
        anecdote.id = Math.round(Math.random() * 10000)
        setAnecdotes(anecdotes.concat(anecdote))
        // Set the notification and then remove it after 5 seconds
        setNotification(`a new anecdote ${anecdote.content} created!`)
        setTimeout(() => {
            setNotification('')
        }, 5000)
    }

    const anecdoteById = (id) => anecdotes.find((a) => a.id === id)

    const vote = (id) => {
        const anecdote = anecdoteById(id)

        const voted = {
            ...anecdote,
            votes: anecdote.votes + 1,
        }

        setAnecdotes(anecdotes.map((a) => (a.id === id ? voted : a)))
    }

    return (
        <div>
            <h1>Software anecdotes</h1>
            <Notification notification={notification} />
            <Menu anecdotes={anecdotes} addNew={addNew} />
            <Footer />
        </div>
    )
}

export default App
