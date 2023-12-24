import { createSlice } from "@reduxjs/toolkit";
import { Action, GameState } from "../../resources/types";


export const logSlice = createSlice({
	name: "log",
	initialState: [] as GameState[],
	reducers: {
		append(state, action:Action<GameState>) {
			state.push(action.payload);
		},
		decapitate(state, action:Action<number>) {
			state.splice(action.payload);
		}
	}
})


export default logSlice.reducer;
export const logActions = logSlice.actions;