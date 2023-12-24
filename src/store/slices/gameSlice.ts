import { createSlice } from "@reduxjs/toolkit";
import pieceReducer, { pieceSlice, move, } from "./pieceSlice";
import { Coord, GameState, Player } from "../../resources/types";
import { Piece } from "../../resources/pieces";
import { Action } from "../../resources/types";


export const gameSlice = createSlice({
	name: "game",
	initialState: start(),
	reducers: {
		move(state, action:Action<{piece:Piece, dst:Coord}>) {
			const [q, r] = action.payload.dst;
			state.pieces = pieceReducer(state.pieces, move(action.payload));
		},
		override(state, action:Action<GameState>) {
			for (const [key, value] of Object.entries(action.payload))
				(state[key] as any) = value;
		},
		select(state, action) {
			const [ piece, ] = action.payload;
		},
		clear(state) {
			for (let col of Object.values(state.pieces.board))
				for (let tile of Object.values(col))
					tile.classNames = [];
		},
		nextTurn(state) {
			state.turn = Number(!state.turn);
		},
	},
	selectors: {
		tile: (state, q, r) => pieceSlice.selectors.tile({pieces:state.pieces}, q, r),
	}
});


function start(): GameState {
	const pieces = pieceSlice.getInitialState();
	const turn = Player.ou;

	return {
		pieces,
		turn,
		ordinal: 0,
	};
}

// case "select": {
// 			clear();
// 			state.selection = selection = action.target;
// 			state.mode = Mode.moving;
// 		}
// 		break;
// 		case "move": {
// 			const [ q, r, ] = action.dst;
// 			if (typeof selection!.position === 'number')
// 				moveCode = place(q, r);
// 			else
// 				moveCode = move(q, r);
// 			if (moveCode)
// 				state.mode = Mode.selecting;
// 		}
// 		break;
// 		case "override":
// 			for (let [key, value] of Object.entries(action.state))
// 				(state[key] as GameState[keyof GameState]) = value;
// 			state.new = true;
// 			return state;

export default gameSlice.reducer;
