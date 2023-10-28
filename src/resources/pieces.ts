import { BasePiece, Color } from './types';
const pieces = {
	K: {
		repr: '♔',
		moves: ['ih', 'i-jh'],
	} as BasePiece,
	Q: {
		repr: '♕',
		moves: ['ih+', 'i-jh+'],
	} as BasePiece,
	b: {
		repr: '♗',
		moves: ['i-jh+'],
	} as BasePiece,
	r: {
		repr: '♖',
		moves: ['ih+'],
	} as BasePiece,
	k: {
		repr: '♘',
		moves: ['ii-jh', 'ii-kh'],
	} as BasePiece,
	p: {
		repr: '♙',
		moves: ['ip', '-ja', '-ka', 'i2pf'],
	} as BasePiece,
}

type PieceKey = keyof typeof pieces;

interface Piece extends BasePiece {
	hasMoved: boolean;
	color: Color;
}

export { pieces };
export type { PieceKey, Piece };