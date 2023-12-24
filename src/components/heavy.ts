import { Coord, PieceState, Player, Territory, } from "../resources/types";
import { produce, } from 'immer';

export function territory (board:PieceState['board'], [q, r]:Coord, oute=false, legality?:(board:PieceState['board'])=>boolean): Territory {
	let area = new Map<number, number|number[]>();
	const piece = board[q][r];
	let obstructed = false;
	if (!piece)
		return {area, obstructed};

	for (let moveCode of piece.moves) {
		let [vectors, rep, ] = ijk(moveCode);
		if (piece!.owner === Player.gyoku)
			vectors.forEach(([q, r], i) => { vectors[i] = [-q, -r] })

		for (let [dq, dr] of vectors) {
			for (let step = 0,
				nq = q + dq, nr = r + dr;
				!oob(nq, nr)
				&& step < rep;
				nq += dq, nr += dr, step++) {
				if (board[nq][nr]?.owner === piece.owner) {
					obstructed = true;
					break;
				}

				if (legality && (oute || step === 0)) {
					// eslint-disable-next-line no-loop-func
					if (legality(produce(board, board => {
						board[q][r] = null;
						board[nq][nr] = piece;
					}))) {
						if (!oute)
							break;
						
						continue;
					}
				}
				
				let e = area.get(nq);

				if (Array.isArray(e)) {
					e.push(nr);
				} else if (e !== undefined) {
					area.set(nq, [e, nr])
				} else {
					area.set(nq, nr)
				}

				if (board[nq][nr] !== null)
					break;
			}
		}
	}

	return {area, obstructed};
}

export function outeCheck (pos:Coord, opponent:PieceState['players'][0], board:PieceState['board'], thorough:boolean=true) {
	
	return opponent.board
		.filter(([q,r]) => 
			(thorough
			|| board[q][r]!.moves.some(s => s.endsWith('+')))
			&& contains(territory(board, [q,r], false).area, pos));
}

	function contains(area:Territory['area'], [q, r]:Coord) {
		
		const col = area.get(q);

		switch (typeof col) {
			case 'number':
				return col === r;
			case 'object':
				return col.includes(r)
			default:
				return false;
		}
	}


function oob(q: number, r: number) {
	return (Math.abs(q) > 5
		|| Math.abs(r) > 5
		|| Math.abs(q + r) > 5)
}

function ijk(move: string): [vectors: Coord[], rep: number, ] {
	let d: Coord = [0, 0],
		dx: Coord[] | undefined,
		inc = 1,
		rep = 1,
		number = '';
	for (let c of move) {
		switch (c) {
			case 'i':
				d[1] -= inc;
				break;
			case 'j':
				d[0] += inc;
				break;
			case 'k':
				d[0] -= inc; d[1] += inc;
				break;
			case 'h':
				let [dq, dr] = d;
				let ds = -(dq + dr);

				dx = [
					[dq, dr],
					[-ds, -dq],
					[dr, ds],
					[-dq, -dr],
					[ds, dq],
					[-dr, -ds]
				];
				break;
			case '-':
				inc = -1;
				continue;
			case '+':
				rep = Infinity;
				break;
			case 'f': break;
			default:
				if (c.match(/\d/)) {
					number += c;
					break;
				}
				throw new Error('Invalid char in move string');
		}

		inc = 1;
	}

	if (dx === undefined)
		dx = [d];
	if (number.match(/\d+/))
		rep = Number(number);

	return [dx, rep, ];
}
