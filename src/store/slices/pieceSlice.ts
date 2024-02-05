/* eslint-disable no-lone-blocks */
import { createSlice } from "@reduxjs/toolkit";
import { Piece, operations, } from "../../resources/pieces";
import { PieceState, Coord, Player, } from "../../resources/types";
import initial from "../../resources/initial";
import { arrayEq } from "../../resources/util";

interface Action<P> {
	type: string;
	payload: P;
}

type MoveAction = Action<{
	piece?:Piece;
	src:Coord;
	dst:Coord;
}>

type PlaceAction = Action<{
	player:Player;
	src:number;
	dst:Coord;
	piece?:Piece;
}>

export const pieceSlice = createSlice({
	name: 'pieces',
	initialState: start,
	reducers: {
		move(state, {payload}:MoveAction) {
			const { board, players, } = state;

			const { src, dst, } = payload;
			let { piece, } = payload;
			{
				const [ q, r ] = src;
				piece = piece ?? board[q][r]!;
				board[q][r] = null;
				let i = players[piece.owner].board.findIndex(pos => arrayEq(pos, src));
				players[piece.owner].board[i] = dst;
			}
			const [ q, r ] = dst;
			if (['O','G'].includes(piece.type))
				players[piece.owner].king = [q,r];
			const captured = board[q][r];

			if (captured) {
				let i = players[captured.owner].board.findIndex(pos => arrayEq(pos,dst));
				players[captured.owner].board.splice(i,1);
				players[piece.owner].hand.push(captured.type);
			}

			board[q][r] = operations.clone(piece);

		},

		place(state, {payload}:PlaceAction) {
			const { board, players, } = state;

			const { player, src, dst, piece, } = payload;

			const [ q, r ] = dst;

			const [type] = players[player].hand.splice(src,1);


			players[player].board.push(dst);

			board[q][r] = piece ?? operations.newPiece(type, player);

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
			hand: ['o'],
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