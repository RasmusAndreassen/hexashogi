/* eslint-disable no-lone-blocks */
import { createSlice } from "@reduxjs/toolkit";
import { Piece, operations, } from "../../resources/pieces";
import { PieceState, Coord, Player, } from "../../resources/types";
import initial from "../../resources/initial";

interface Action<P> {
	type: string;
	payload: P;
}

type MoveAction<S extends Coord|number> = Action<{
	piece:S extends number? Piece:Piece|undefined;
	src:S;
	dst:Coord;
}>


export const pieceSlice = createSlice({
	name: 'pieces',
	initialState: start,
	reducers: {
		move(state, {payload}:MoveAction<Coord|number>) {
			const { board, players, } = state;

			const { src, dst, } = payload;
			let { piece, } = payload;

			if (typeof src === 'number') {
				piece = piece!;
				players[piece.owner].hand.splice(src,1);
			} else {
				const [ q, r ] = src;
				piece = piece ?? board[q][r]!;
				board[q][r] = null;
			}

			const [ q, r ] = dst;
			if (['O','G'].includes(piece.type))
				players[piece.owner].king = [q,r];
			const captured = board[q][r];

			if (captured) {
				let i = players[piece.owner].hand.length;
				players[piece.owner].hand[i] = operations.capture(captured);
			}

			board[q][r] = operations.clone(piece);

		},
		override(state, {payload}:Action<PieceState>) {
			const { board, players, } = payload
			state.board = board;
			state.players = players;
		},
	},
	selectors: {
		tile: (state, q:number, r:number) => state.board[q][r],
	}
})

export const { move, override, } = pieceSlice.actions

function start(): PieceState {
	const state:PieceState = {
		board:{},
		players:{
		[Player.ou]: {
			king: [NaN,NaN],
			board: [],
			hand: [],
		},
		[Player.gyoku]: {
			king: [NaN,NaN],
			board: [],
			hand: [],
		},
	}}

	for (let q = -5; q <= 5; q++) {
		state.board[q] = {}
		for (let r = Math.max(-5 - q, -5); r <= Math.min(5 - q, 5); r++) {
			try {
				const { piece: p, owner } = initial[q][r];

				let piece = operations.newPiece(p, owner);
				state.board[q][r] = piece;
				
				state.players[owner].board.push([q,r]);

				if (['O','G'].includes(piece.type))
					state.players[piece.owner].king = [q,r];

			} catch {
				state.board[q][r] = null;
			}
		}
	}

	return state;
}

export default pieceSlice.reducer;
export const pieceActions = pieceSlice.actions