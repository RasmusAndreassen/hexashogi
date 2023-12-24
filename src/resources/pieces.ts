import { Player } from './types';
import { DeepWritable } from './util';
const piecePrimitives = {
	O: {
		repr: '王将',
		moves: ['ih', 'i-jh'],
	},
	G: {
		repr: '玉将',
		moves: ['ih', 'i-jh'],
	},
	H: {
		repr: '飛車',
		moves: ['ih+'],
		nari: {
			repr: '龍',
			moves: ['ih+', 'i-jh'],
		},
	},
	K: {
		repr: '角行',
		moves: ['i-jh+'],
		nari: {
			repr: '馬',
			moves: ['ih', 'i-jh+'],
		}

	},
	k: {
		repr: '金将',
		moves: ['ih', 'i-j', 'i-k', 'j-k', 'k-j'],
	},
	g: {
		repr: '銀将',
		moves: ['i-jh', 'i', '-j', '-k'],
		nari: {
			repr: '金',
		},
	},
	e: {
		repr: '桂馬',
		moves: ['ii-j', 'ii-k', '-j-ji', '-k-ki'],
		nari: {
			repr: '全',
		},
	},
	o: {
		repr: '香車',
		moves: ['i+'],
		nari: {
			repr: '金',
		},
	},
	f: {
		repr: '歩兵',
		moves: ['i'],
		nari: {
			repr: 'と',
		},
	},
} as const;

type PP = typeof piecePrimitives;

const primitives = piecePrimitives as PiecePrimitives;

type PiecePrimitives = {
	[K in keyof PP]: PP[K] extends {nari:any}?
		PP[K]['nari'] extends {moves:any[]}?
			PP[K]
		:PP[K] & {
			nari:PP[K]['nari'] & {
				moves: undefined
			}
		}
	:{nari:undefined} & PP[K];
}


type PieceType = keyof PP;

type PieceNari = keyof FilterProperties<PP, {nari:any}>;
type PieceNariWMoves = keyof FilterProperties<PP, {nari:{moves:any}}>

type FilterProperties<T, U> = {
	[K in keyof T as T[K] extends U? K: never]: T[K];
};

type PieceFace<T extends PieceType = PieceType> = PP[T]['repr'];
type PieceBack<T extends PieceNari = PieceNari> = PP[T]['nari']['repr'];
type PieceLabel<T extends PieceType = PieceType> = T extends PieceNari? PieceFace<T> | PieceBack<T>: PieceFace<T>;

type PieceMoves<T extends PieceType = PieceType> = T extends PieceNariWMoves? PP[T]['moves'] | PP[T]['nari']['moves']: PP[T]['moves'];

interface Piece<
	N extends boolean = boolean,
	T extends PieceType = PieceType,> {
	repr: N extends true?
		T extends PieceNari? PieceBack<T>: never: N extends false? PieceFace<T>: PieceLabel<T>;
	nari: N;
	type: T;
	owner: Player;
	moves: DeepWritable<N extends true?
		T extends PieceNari?
			PP[T]['nari'] extends {moves:any[]}?
				PP[T]['nari']['moves']
				:PP['k']['moves']
			:never
		:N extends false?
			PP[T]['moves']:
			PieceMoves<T>>;
	direction?: T extends 'o'? 'i'|'-j'|'-k': never;
}


function newPiece<T extends PieceType>(type:T, owner:Player): Piece<false,T> {
	return {
		owner,
		type,
		repr: primitives[type].repr,
		moves: [...primitives[type].moves] as DeepWritable<typeof primitives[T]['moves']>,
		nari: false,
	}
}


function naru(piece:Piece<false>): Piece<true> {
	const { type, } = piece;
	const { nari, } = primitives[type];
	if (!nari)
		throw new Error(`${piece.repr}は成れない`);

	const { repr, moves, } = nari;

	

	return {
		...piece,
		type: type as PieceNari,
		moves: moves ?? ["ih", "i-j", "i-k", "j-k", "k-j"],
		nari: true,
		repr,
		direction: undefined,
		};
}

function capture<T extends PieceType>(piece:Piece<boolean,T>): Piece<false,T> {
	const { type, owner, } = piece;
	const { repr, moves, } = primitives[type];
	return {
		...piece,
		nari: false,
		repr,
		moves: [...moves] as DeepWritable<typeof primitives[T]['moves']>,
		owner: Number(!owner),
	};
}

function clone(piece:Piece): typeof piece {
	return {
		...piece,
	};
}



export const operations = {clone, naru, newPiece, capture};
export { piecePrimitives, };
export type { Piece, PieceFace, PieceBack, PieceLabel, PieceType, PieceNari, };