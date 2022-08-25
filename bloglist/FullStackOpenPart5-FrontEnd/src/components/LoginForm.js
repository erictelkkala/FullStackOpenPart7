import PropTypes from 'prop-types'
const LoginForm = (props) => {
    return (
        <form onSubmit={props.handleLogin}>
            <div>
                username
                <input
                    id="username"
                    value={props.username}
                    onChange={props.handleChangeUsername}
                />
            </div>
            <div>
                password
                <input
                    id="password"
                    value={props.password}
                    type="password"
                    onChange={props.handleChangePassword}
                />
            </div>
            <button type="submit">login</button>
        </form>
    )
}

LoginForm.propTypes = {
    handleLogin: PropTypes.func.isRequired,
    handleChangeUsername: PropTypes.func.isRequired,
    handleChangePassword: PropTypes.func.isRequired,
    username: PropTypes.string.isRequired,
    password: PropTypes.string.isRequired,
}

export default LoginForm
