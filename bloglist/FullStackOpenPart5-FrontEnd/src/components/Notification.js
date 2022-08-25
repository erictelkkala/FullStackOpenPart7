import PropTypes from 'prop-types'

const Notification = (props) => {
    if (props.message === null) {
        return null
    } else {
        if (props.type === 'success') {
            return <div className="success">{props.message}</div>
        } else {
            return <div className="error">{props.message}</div>
        }
    }
}

Notification.propTypes = {
    message: PropTypes.string,
    type: PropTypes.string,
}

export default Notification
