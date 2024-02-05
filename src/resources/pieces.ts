import { Player } from './types';
import { DeepWritable } from './util';

const _primitives = {
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

type PP = typeof _primitives;

export const primitives = _primitives as Primitives;

type Primitives = {
	[K in keyof PP]: K extends type.Nari?
		K extends type.SpecialNari?
			PP[K]
		:PP[K] & {
			nari:PP[K]['nari'] & {
				moves: undefined
			}
		}
	:PP[K] &{
		nari: undefined;
	};
}


export namespace type {
	export type Type = keyof Primitives;
	export type Nari = keyof FilterProperties<PP, {nari:any}>;
	export type SpecialNari = keyof FilterProperties<PP, {nari:{moves:any}}>;
};
export namespace label {
	export type Face<T extends  type.Type = type.Type> = PP[T]['repr'];
	export type Back<T extends  type.Nari = type.Nari> = PP[T]['nari']['repr'];
	export type Label<P extends Piece = Piece> = P extends Piece<true>? Back<P['type']>: Face<P['type']>;
}

type Moves<P extends Piece> = P extends Piece<true,type.SpecialNari>? PP[P['type']]['nari']['moves']: P extends type.Nari? PP['k']['moves']: PP[P['type']]['moves'];

type FilterProperties<T, U> = {
	[K in keyof T as T[K] extends U? K: never]: T[K];
};


export interface Piece<
	N extends boolean = boolean,
	T extends (N extends true? type.Nari: type.Type) = (N extends true? type.Nari: type.Type),> {
	nari: N;
	type: T;
	owner: Player;
	direction?: T extends 'o'? 'i'|'-j'|'-k': never;
}

export namespace operations {

	export function newPiece<T extends type.Type>(type:T, owner:Player): Piece<false,T> {
		return {
			owner,
			type,
			nari: false,
		}
	}

	export function isNari<T extends type.Type>(piece:Piece<boolean,T>): piece is Piece<true,T & type.Nari> {
		return piece.nari;
	}

	export function notNari<T extends type.Type>(piece:Piece<boolean,T>): piece is Piece<false,T> {
		return !piece.nari;
	}

	function isSpecNari<T extends type.Type>(piece:Piece<boolean,T>): piece is Piece<true,T & type.SpecialNari> {
		return piece.nari && ['H', 'K'].includes(piece.type);
	}

	export function canNari(piece:Piece<false>): piece is Piece<false,type.Nari> {
		return primitives[piece.type].nari !== undefined;
	}

	export function repr<P extends Piece>(piece:P) {
		let repr;
		if (isNari(piece))
			repr = primitives[piece.type].nari.repr;
		else
			repr = primitives[piece.type].repr;

		return repr as label.Label<P>;
	}

	export function moves<P extends Piece>(piece:P) {
		let moves;
		if (isSpecNari(piece))
			moves = primitives[piece.type].nari.moves;
		else if (isNari(piece)) {
			moves = primitives['k'].moves;
		} else if (piece.type === 'o' && piece.direction) {
			moves = [piece.direction + '+']
		} else {
			moves = primitives[piece.type].moves;
		}
		return moves as Moves<P>;
	}

	export function naru(piece:Piece<false>): Piece<true> {
		const { type, owner, } = piece;
		if (!canNari(piece))
			throw new Error(`${repr(piece)}は成れない`);

		return {
			owner,
			type: type as type.Nari,
			nari: true,
			};
	}

	export function capture<T extends type.Type>(piece:Piece<boolean,T>): Piece<false,T> {
		const { type, owner, } = piece;
		return {
			nari: false,
			type,
			owner: Number(!owner),
		};
	}

	export function clone(piece:Piece): typeof piece {
		return {
			...piece,
		};
	}
}
