import axios from 'axios'
const baseUrl = '/api/login'

const login = async (credentials) => {
    const response = await axios.post(baseUrl, credentials)
    if (response.data.error) {
        throw new Error(response.data.error)
    } else {
        return response.data
    }
}

export default { login }
