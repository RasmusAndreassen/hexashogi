import * as P from "./pieces";

export type Coord = [q:number, r:number];

export enum Player {
	ou,
	gyoku,
}


export interface PieceState {
	board: {
		[q:number]: {
			[r:number]: null|P.Piece;
		}
	};
	players: {
		[P in Player]: {
			king:Coord;
			board:Coord[];
			hand:P.type.Type[];
		}
	}
}


export interface GameState {
	pieces: PieceState;
	turn: Player;
	moveCode: MoveCode;
	ordinal: number;
}

export interface Territory {
	area: Map<number,number|number[]>;
	obstructed: boolean;
}

type Optional<T extends string> = T|"";

export type Move = [src?:Coord|number, dst?:Coord, captured?:P.Piece|null, uniq?:boolean, nari?:boolean]

type MoveLabel = `${P.label.Face}${Optional<'n'>}` | P.label.Back;
type MoveCoord = `${number},${number}`;

export type MoveSpace = `${MoveLabel}${Optional<`(${MoveCoord})`>}${MoveCoord}${Optional<"*">}`;
export type MovePlace = `${P.label.Face}${MoveCoord}+`
               | `香車[${'i'|'-j'|'-k'}]${MoveCoord}+`;

export type MoveCode = MoveSpace
          | MovePlace;

export interface Action<P> {
	type: string;
	payload: P;
}