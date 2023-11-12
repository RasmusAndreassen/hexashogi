import { Piece } from "./pieces";

type Coord = [q:number, r:number];

enum Player {
	ou,
	gyoku,
}

type TileAttributes = {
	highlighted?: boolean;
	piece: null|Piece;
	extra?: Piece;
	update?: (q: number, r: number, nari: boolean)=>void;
}

interface BoardState {
	[q:number]:{
		[r:number]: TileAttributes;
	}
}

interface PlayerPieces {
	board:{piece:Piece,position:Coord}[];
	hand:Piece[];
}

interface PlayerState {
	pieces:PlayerPieces,
	setPieces:(pieces:PlayerPieces)=>void,
}

type History = {
	move:string,
	state: {
		board:BoardState,
		hands: {
			[P in Player]: PlayerPieces['hand'];
		}
	}
}[]

export type { Coord, TileAttributes, BoardState, History, PlayerPieces, PlayerState, };
export { Player };