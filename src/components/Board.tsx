import initial from "../resources/initial";
import { BoardState, Coord, TileAttributes, Color } from "../resources/types";
import { pieces } from "../resources/pieces";
import { useState } from "react";
import Hex from "./Hex";

type NQ = [r: number, attrs: Partial<TileAttributes>]

type Change = [
	q: number,
	nq: NQ | NQ[],
]



function mutate<T extends {}, S>(o: T, f: (arg: [keyof T, T[keyof T]]) => [keyof T, S]): { [key in keyof T]: S } {
	return Object.fromEntries(Object.entries(o).map(f)) as { [key in keyof T]: S }
}

function ijk(move: string): [vectors: Coord[], conditions: { rep: number, attack: -1 | 0 | 1 }] {
	let d: Coord = [0, 0],
		dx: Coord[] | undefined,
		inc = 1,
		rep = 1,
		attack: -1 | 0 | 1 = 0,
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
			case 'a':
				attack = 1;
				break;
			case 'p':
				attack = -1;
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

	return [dx, { rep, attack }];
}

function Board(props: { size: number, turn: Color, nextTurn: (move: string, state: BoardState) => void }) {
	const { size, turn, nextTurn, } = props;
	const start: BoardState = {}
	for (let q = -size; q <= size; q++) {
		start[q] = {};
		for (let r = Math.max(-size - q, -size); r <= Math.min(size - q, size); r++) {
			try {
				const { piece: p, color } = initial[q][r];

				start[q][r] = { piece: { ...pieces[p], color, hasMoved: false } };
				
			} catch {
				start[q][r] = { piece: null };
			}
		}
	}
	const [boardState, setBoardState] = useState<BoardState>(start);
	const [focus, setFocus] = useState<Coord | null>(null);

	function update(...changes: Change[]) {
		const unHighlighted = mutate(
			boardState,
			([q, nq]) => [
				q,
				mutate(nq, ([r, attrs]) => [
					r,
					{
						...attrs,
						highlighted: false,
					}
				])
			]
		) as unknown as BoardState;

		setBoardState({
			...unHighlighted,
			...Object.fromEntries(
				changes.map(([q, nq]) => {
					if (!Array.isArray(nq[0]))
						nq = [nq as NQ];
					return [q, {
						...unHighlighted[q],
						...Object.fromEntries(
							(nq as NQ[]).map(([r, attrs]) => {
								console.log(q, r, attrs);
								return [r, { ...unHighlighted[q][r], ...attrs }]
							})
						)
					}]
				})
			),
		});
	}

	function highlight(q: number, r: number) {
		q = Number(q); r = Number(r);
		setFocus([q, r]);
		const highlighted = true;


		update(...Object.entries(territory(q, r)).map(([q, rs]) => [
			q,
			rs.map(r => [
				r,
				{
					...boardState[q][r],
					highlighted
				}
			] as NQ)
		] as Change))
	}

	function territory(q: number, r: number): { [key: number]: number[] } {
		let territory: { [key: number]: number[] } = {
			[q]: [r,]
		};

		const
			enemy = (nq: number, nr: number) => !empty(nq, nr) && diff(nq, nr),
			empty = (nq: number, nr: number) => boardState[nq][nr].piece === null,
			diff  = (nq: number, nr: number) => boardState[nq][nr].piece!.color !== boardState[q][r].piece!.color;

		const conditions = {
			[-1]: empty,
			0: diff,
			1: enemy,
		};

		for (let move of boardState[q][r].piece!.moves) {
			let [vectors, { rep, attack }] = ijk(move);
			if (boardState[q][r].piece?.color === Color.black)
				vectors.forEach(([q, r], i) => { vectors[i] = [-q, -r] })


			for (let [dq, dr] of vectors) {
				for (let nq = q + dq, nr = r + dr, step = 1;
					!oob(nq, nr)
					&& conditions[attack](nq, nr)
					&& step <= rep;
					nq += dq, nr += dr, step++) {
					if (territory[nq] === undefined)
						territory[nq] = [nr];
					else
						territory[nq].push(nr);

					if (boardState[nq][nr].piece !== null)
						break;
				}
			}
		}

		return territory;
	}

	function clear() {
		update();
	}

	function move(q: number, r: number) {
		q = Number(q); r = Number(r);
		let u: Change[] = [];
		let sq, sr;
		if (focus !== null && ([sq, sr] = focus) && !(q === sq && r === sr)) {
			let { piece } = boardState[sq][sr];
			// if (!piece!.hasMoved) {
			// 	let moves = [];
			// 	for (let move of piece!.moves) {
			// 		if (!move.endsWith('f'))
			// 			moves.push(move)
			// 	}
			// 	piece = {
			// 		...piece!,
			// 		moves,
			// 		hasMoved: true,
			// 	}
			// }
			if (sq === q)
				u.push([q, [[sr, { piece: null }], [r, { piece: piece! }]]]);
			else
				u.push([sq, [sr, { piece: null }]], [q, [r, { piece: piece! }]]);

			nextTurn(`${piece?.repr}${q},${r}`, boardState);
		}

		update(...u);
		setFocus(null);
	}

	function oob(q: number, r: number) {
		return (Math.abs(q) > size
			|| Math.abs(r) > size
			|| Math.abs(q + r) > size)
	}

	return (
		<svg viewBox='-400 -400 800 800' style={{ background: 'brown' }}>
			{Object.entries(boardState)
				.map(([q, item]) => {
					return Object.entries(item)
						.map(([r, attrs]) => {
							return <Hex key={String([q, r])} {...{ turn, q, r, highlight, move, clear, ...attrs }} />;
						});
				}).flat()}
		</svg>);
}

export default Board;