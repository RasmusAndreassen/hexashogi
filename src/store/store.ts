import { configureStore } from '@reduxjs/toolkit'
import pieceReducer from './slices/pieceSlice'
import logReducer from './slices/logSlice'


export default configureStore({
	reducer: {
		piece: pieceReducer,
		log: logReducer,
	},
})