import axios from 'axios'
const baseUrl = '/api/blogs'

const getAll = async () => {
    const request = axios.get(baseUrl)
    const response = await request
    return response.data
}

const create = async (newObject, user) => {
    // Get the token from the user object
    const config = {
        headers: { Authorization: `bearer ${user.token}` },
    }
    const request = axios.post(baseUrl, newObject, config)
    const response = await request
    return response.data
}

const update = async (updatedObject, user) => {
    // Get the token from the user object
    const config = {
        headers: { Authorization: `bearer ${user.token}` },
    }
    const request = axios.put(
        `${baseUrl}/${updatedObject.id}`,
        updatedObject,
        config
    )
    const response = await request

    return response.data
}

const remove = async (removedObject, user) => {
    // Get the token from the user object
    const config = {
        headers: { Authorization: `bearer ${user.token}` },
    }
    const request = axios.delete(`${baseUrl}/${removedObject.id}`, config)
    const response = await request

    return response.data
}

export default { getAll, create, update, remove }
