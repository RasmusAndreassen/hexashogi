import { Player } from './types';
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
	},
	K: {
		repr: '角行',
		moves: ['i-jh+'],
	},
	k: {
		repr: '金将',
		moves: ['ih', 'i-j', 'i-k', 'j-k', 'k-j'],
	},
	g: {
		repr: '銀将',
		moves: ['i-jh', 'i', '-j', '-k'],
	},
	e: {
		repr: '桂馬',
		moves: ['ii-j', 'ii-k', '-j-ji', '-k-ki'],
	},
	o: {
		repr: '香車',
		moves: ['i+'],
	},
	f: {
		repr: '歩兵',
		moves: ['i'],
	},
} as const;

interface PiecePrimitive {
	repr: (typeof piecePrimitives)[keyof typeof piecePrimitives]['repr'] | '龍' | '馬' | '金' | '全' | '金' | 'と';
	moves: string[]
}

type PieceType = keyof typeof piecePrimitives

class Piece implements PiecePrimitive {
	repr: PiecePrimitive['repr'];
	moves: string[];
	type: PieceType;
	nari: boolean;
	allegiance: Player;
	direction?: 'i'|'-j'|'-k';
	ghost?: boolean;

	constructor(type:PieceType, allegiance:Player, ghost?:boolean) {
		this.type = type;
		this.repr = piecePrimitives[type].repr;
		this.moves = [...piecePrimitives[type].moves];
		this.nari = false;
		this.allegiance = allegiance;
		this.ghost = ghost
	}

	naru (): this {
		if (!this.nari) {
			let moves = ['ih', 'i-j', 'i-k', 'j-k', 'k-j'];
			
			this.nari = true;

			switch (this.type) {
				case 'H':
					this.repr = '龍';
					moves = ['ih+', 'i-jh'];

				break;
				case 'K':
					this.repr = '馬';
					moves = ['ih', 'i-jh+'];
					
				break;
				case 'g':
					this.repr = '金';
				break;
				case 'e':
					this.repr = '全';
				break;
				case 'o':
					this.repr = '金';
					delete this.direction;
				break;
				case 'f':
					this.repr = 'と';

				break;
				default:
				case 'G':
				case 'O':
				case 'k':
					throw Error('成れない駒を成ろうとした');
			}

			this.moves = moves;
		} else {
			this.nari = false;
			this.moves = [...piecePrimitives[this.type].moves];
			this.repr = piecePrimitives[this.type].repr;
		}

		return this;
	}

	clone(ghost?:boolean) {
		return new Piece(this.type, this.allegiance, ghost);
	}

}




export { piecePrimitives, Piece, };
export type { PieceType };