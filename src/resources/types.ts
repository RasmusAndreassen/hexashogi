import { Piece } from "./pieces";

type Coord = [q:number, r:number];

enum Color {
	white,
	black,
}

interface BasePiece {
	repr: string;
	moves: string[];
}


type TileAttributes = {
	highlighted?: boolean;
	piece: Piece|null;
}

interface BoardState {
	[q:number]:{
		[r:number]: TileAttributes;
	}
}

type History = {move:string,state:BoardState}[]

export type { Coord, BasePiece, TileAttributes, BoardState, History};
export { Color, Player};