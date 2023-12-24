import { Piece, PieceBack, PieceFace, PieceType } from "./pieces";

type Coord = [q:number, r:number];

enum Player {
	ou,
	gyoku,
}

type TileAttributes = {
	classNames: string[];
	piece: null|Piece;
}

interface PieceState {
	board: {
		[q:number]: {
			[r:number]: null|Piece;
		}
	};
	players: {
		[P in Player]: {
			king:Coord;
			board:Coord[];
			hand:Piece<false>[];
		}
	}
}


interface GameState {
	pieces: PieceState;
	turn: Player;
	moveCode: MoveCode;
	ordinal: number;
}

interface Territory {
	area: Map<number,number|number[]>;
	obstructed: boolean;
}

type Optional<T extends string> = T|"";

type Move = [src?:Coord|number, dst?:Coord, captured?:Piece|null, uniq?:boolean, nari?:boolean]

type MoveLabel = `${PieceFace}${Optional<'n'>}` | PieceBack;
type MoveCoord = `${number},${number}`;

type MoveSpace = `${MoveLabel}${Optional<`(${MoveCoord})`>}${MoveCoord}${Optional<"*">}`;
type MovePlace = `${PieceFace}${MoveCoord}+`
               | `香車[${'i'|'-j'|'-k'}]${MoveCoord}+`;

type MoveCode = MoveSpace
          | MovePlace;

interface Action<P> {
	type: string;
	payload: P;
}

export type { PieceState, MoveCode, Move, MovePlace, MoveSpace, TileAttributes, Territory, GameState, Coord, Action, };
export { Player, };