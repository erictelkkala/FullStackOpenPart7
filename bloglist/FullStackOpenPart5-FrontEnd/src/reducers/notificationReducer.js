import { createSlice } from '@reduxjs/toolkit'

const notificationSlice = createSlice({
    name: 'notification',
    initialState: {
        message: null,
        type: null,
    },
    reducers: {
        setNotification: (state, action) => {
            state.message = action.payload.message
            state.type = action.payload.type
        },
        removeNotification: (state) => {
            state.message = null
            state.type = null
        },
    },
})

export const { setNotification, removeNotification } = notificationSlice.actions
export default notificationSlice.reducer
