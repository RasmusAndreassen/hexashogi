import initial from "../resources/initial";
import { BoardState, Coord, TileAttributes, Player, PlayerPieces, PlayerState } from "../resources/types";
import { Piece, PieceType } from "../resources/pieces";
import { useRef, useState } from "react";
import PieceRepr from './Piece';
import Hex from "./Hex";
import { arraycmp } from "../resources/common";
import './Board.css';

type NQ = [r: number, attrs: Partial<TileAttributes>]

interface Changes {
	[q: number]: NQ | NQ[],
}


function mutate<T extends {},S>(
	o: T,
	f: (k:keyof T, v:T[keyof T]) => S,
	filter:(arg:[keyof T, S]) => boolean = () => true
	): { [key in keyof T]: S } {
	return Object.fromEntries(Object.entries(o).map(([k,v]) => [k,f(k,v)] as [keyof T, S]).filter(filter)) as { [key in keyof T]: S }
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

enum Mode {
	default,
	placing,
	moving,
	selecting,
	check,
};

function jin (turn:Player, q:number, r:number) {
	const {max, abs} = Math;
	let sign = turn * -2 + 1;
	return (max(abs(q),abs(r),abs(q+r)) >= 3 && -(q+r) * sign >= 0 && r * sign <= 0)
}


function Board(props: { size: number, turn: Player.ou|Player.gyoku, nextTurn: (move: string, state: BoardState, offState: {[P in Player]:PlayerPieces['hand']}) => void }) {
	const { size, turn, nextTurn, } = props;
	const start: BoardState = {};
	let boardPositions:{[P in Player]: {piece:Piece,position:Coord}[]} | undefined = {
		[Player.ou]: [],
		[Player.gyoku]: [],
	};
	for (let q = -size; q <= size; q++) {
		start[q] = {};
		for (let r = Math.max(-size - q, -size); r <= Math.min(size - q, size); r++) {
			try {
				const { piece: p, allegiance } = initial[q][r];

				let piece = new Piece(p, allegiance);
				start[q][r] = { piece };
				
				boardPositions[piece.allegiance].push({ piece, position:[q,r], });

			} catch {
				start[q][r] = { piece: null };
			}
		}
	}


	const [board, setBoard] = useState<BoardState>(start);
	const [focus, setFocus] = useState<number | Coord | Choice | null>(null);
	const mode = useRef(Mode.default);

	
	let t1 = useState<PlayerPieces>({
			board: boardPositions[Player.ou],
			hand: []
		});
	let t2 = useState<PlayerPieces>({
			board: boardPositions[Player.gyoku],
			hand: []
		});

	boardPositions = undefined;

	const players:{[P in Player]: PlayerState} = {
		[Player.ou]: {pieces: t1[0], setPieces: t1[1]},
		[Player.gyoku]: {pieces: t2[0], setPieces: t2[1]},
	};

	let checks:Coord[] = [];
	let immovable:Coord[] = players[turn].pieces.board
		.filter(({piece, position, }) =>
			Object.values(territory(...position, piece).territory).length === 0)
		.map(({position})=>position)

	let field:{[key: number]: Set<number>} = {};
	players[turn].pieces.board
		.forEach(({piece, position, }) => {
			Object.entries(territory(...position, piece).territory).forEach(([q,rs]) => {
				if (field[q] === undefined)
					field[q] = new Set();

				rs.forEach(r => field[q].add(r))

			})
		})

	if (board !== start) {
		checks = check();
		if (checks.length > 0) {
			if (mode.current === Mode.default)
				mode.current = Mode.check;

		}
	}
	abstract class Choice {
		destination;
		piece;
		constructor (destination:Coord, piece:Piece) {
			this.destination = destination;
			this.piece = piece;
			mode.current = Mode.selecting;
		}

		abstract complete (...args:any[]): `${Piece['repr']}${number},${number}`;
		protected _complete (changes:Changes, playerPieces:PlayerPieces = players[turn].pieces): `${Piece['repr']}${number},${number}` {
			const {piece, destination:[q,r]} = this;
			if (changes[q] === undefined)
				changes[q] = [];
			else if (!Array.isArray(changes[q][0]))
				changes[q] = [changes[q] as NQ];
			changes[q].push([r, {piece}]);

			const { board, hand, } = playerPieces;

			players[turn].setPieces({
				board: board.map(v => v.piece === this.piece? {...v, position:[q,r]} : v),
				hand,
			})
			
			this.finalise(changes);
			return `${piece.repr}${q},${r}`;
		}

		cancel (): void {
			this._cancel({})
		}

		protected _cancel (changes:Changes) {
			const [q,r] = this.destination;
			if (changes[q] === undefined)
				changes[q] = [];
			else if (!Array.isArray(changes[q][0]))
				changes[q] = [changes[q] as NQ];
			changes[q].push([r, {piece:null}]);

			this.finalise(changes);
		}

		protected finalise (changes:Changes) {
			setFocus(null);
			update(changes);
			mode.current = Mode.default;
		}

		abstract update (q:number,r:number, ...rest:any[]): void;
	}

	class Direction extends Choice {
		i:number;
		effects:Changes;
		indicator:Piece;
		options:string[];
		p: -1|1;

		constructor(i:number, destination:Coord) {
			const highlighted = true;
			const piece = players[turn].pieces.hand[i];
			super(destination, piece);
			this.i = i;
			this.indicator = piece.clone(true);
		
			const [q, r] = destination;

			this.p = (turn === Player.ou)? 1 : -1;

			const { p, } = this;

			this.effects = {
					[q]: [[r,   { piece:this.indicator }],
							[r-p, { highlighted }]]
			};
			this.options = [`0${-p}`];
			if (p*r <= 0) {
				this.effects[q-p] = [r,   {highlighted}];
				this.options.push(`${-p}0`);
			}
			if (p*(q+r) <= 0) {
				this.effects[q+p] = [r-p, {highlighted}];
				this.options.push(`${p}${-p}`);
			}

			update(this.effects);
		}

		update(q:number,r:number): void {
			let {indicator:piece, destination:[dq,dr]} = this;
			let dir:'i'|'-j'|'-k';

			let rel = `${q-dq}${r-dr}`;
			const { p, } = this;

			if (!this.options.includes(rel))
				return;

			switch (rel) {
				case `0${-p}`:
					dir = 'i';
				break;
				case `${-p}0`:
					dir = '-j';
				break;
				case `${p}${-p}`:
					dir = '-k';
				break;
				default:
					return;
			}

			piece!.direction = dir;
			piece.moves = [dir+'+'];

			update(this.effects);
		}

		

		complete () {
			const {i, destination:[q,r], piece} = this;
			const {board, hand} = mutate(players[turn].pieces, (_,v)=>v.slice()) as PlayerPieces;

			const playerPieces = {
				board: [...board, {piece, position:this.destination}],
				hand: [
					...hand.slice(0,i),
					...hand.slice(i+1)
				],
			};

			piece.direction = this.indicator.direction;
			piece.moves = this.indicator.moves;

			delete piece.ghost;
			return super._complete({[q]: [r, {piece}]}, playerPieces)
		}

	}

	class Nari extends Choice {
		not:Piece;
		nari:Piece;
		origin:Coord;
		effects:Changes;
		tmp:Piece|null;
		upgrade?:boolean;

		constructor(origin:Coord, destination:Coord) {
			let [q, r] = origin;
			let [dq,dr] = destination;
			let piece = board[q][r].piece!;

			super(destination, piece);
			this.nari = piece.clone().naru();
			this.tmp = board[dq][dr].piece;
			this.not = piece.clone();
			this.not.direction = 'i';
			this.piece.ghost = true;
			this.origin = origin;

			this.effects = {[dq]: [dr, {piece:this.not, extra:this.nari, update: this.update.bind(this), highlighted: true}]};
			if (this.effects[q] === undefined)
				this.effects[q] = [];
			
			this.effects[q].push([r, {piece}]);
			
			update(this.effects);
		}


		update(q:number,r:number, nari:boolean): void {
			if (q !== this.destination[0] || r !== this.destination[1])
				return;

			this.upgrade = nari;
		}

		complete() {
			const {origin:[oq,or]} = this;
			
			delete this.piece.ghost;

			if (this.upgrade)
				this.piece.naru();

			if (this.tmp)
				capture(this.tmp);

			return super._complete({
				[oq]:[or,{piece:null}],
			});
		}

		cancel(): void {
			let [dq, dr] = this.destination;
			delete this.piece.ghost;
			this.effects[dq] = [dr, {piece:this.tmp}];

			update(this.effects);
		}
	}

	function update(changes?: Changes) {
		const unHighlighted = mutate(board,
			(_, nq) => 
				mutate(nq,
				(_, attrs) => ({
					...attrs,
					highlighted: false,
				})
			)
		);

		if (changes === undefined) {
			setBoard(unHighlighted)
		}
		else {
			setBoard({
				...unHighlighted,
				...mutate(
					changes,
					(q, nq) => {
						if (!Array.isArray(nq[0]))
							nq = [nq as NQ];
						return {
							...unHighlighted[q],
							...Object.fromEntries(
								(nq as NQ[]).map(([r, attrs]) => {
									return [r, { ...unHighlighted[q][r], ...attrs }]
								})
							)
						};
					}),
			});
		}
	}

	function highlight(territory:{ [key: number]: number[] }) {
		const highlighted = true;

		update(mutate(territory, (q, rs) => 
			rs.map(r => [
				r,
				{
					...board[q][r],
					highlighted
				}
			] as NQ)
		))
	}


	function territory (q: number, r: number, piece?:Piece, shallow:boolean=true): {territory:{ [key: number]: number[] }, blocked:boolean} {
		q = Number(q); r = Number(r);
		let territory: { [key: number]: number[] } = {};
		let blocked = false;
		let strict = false;
		let tmp = board[q][r].piece!;
		board[q][r].piece = null;
		piece = piece ?? (tmp);

		if (piece.type === 'O' || piece.type === 'G')
			strict = true;

		const
			enemy = (q: number, r: number) => !empty(q, r) && diff(q, r),
			empty = (q: number, r: number) => board[q][r].piece === null,
			diff  = (q: number, r: number) => board[q][r].piece?.allegiance !== piece!.allegiance;

		const baseConditions = {
			[-1]: empty,
			0: diff,
			1: enemy,
		};

		for (let move of piece.moves) {
			let [vectors, { rep, attack }] = ijk(move);
			if (piece!.allegiance === Player.gyoku)
				vectors.forEach(([q, r], i) => { vectors[i] = [-q, -r] })

			const condition = baseConditions[attack];

			for (let [dq, dr] of vectors) {
				let nq = q + dq, nr = r + dr;

				for (let step = 1;
					!oob(nq, nr)
					&& condition(nq,nr)
					&& step <= rep;
					nq += dq, nr += dr, step++) {

					if (shallow && (mode.current === Mode.check || step === 1)) {
						let tmp = board[nq][nr].piece;
						let tmpBoard;
						board[nq][nr].piece = piece;
						if (tmp) {
							tmpBoard = players[Number(!turn) as Player].pieces.board
							players[Number(!turn) as Player].pieces.board = tmpBoard.filter(({piece}) => piece !== tmp);
						}

						let illegal = check( strict).length > 0;

						board[nq][nr].piece = tmp;
						if (tmp)
							players[Number(!turn) as Player].pieces.board = tmpBoard!;

						if (illegal) {
							if (mode.current !== Mode.check)
								break;
							else
								continue;
						}
					}
					if (territory[nq] === undefined)
						territory[nq] = [];
					
					territory[nq].push(nr);

					if (board[nq][nr].piece !== null)
						break;
				}
				if (!oob(nq, nr) && board[nq][nr].piece?.allegiance === piece.allegiance)
					blocked = true;
			}
		}

		board[q][r].piece = tmp;

		return {territory, blocked};
	}

	function contains (territory:{ [key: number]: number[] }, types:PieceType|PieceType[]): boolean {
		if (!Array.isArray(types))
			types = [types]
		return Object.entries(territory)
			.some(([q,rs]) =>
				rs.some(r => types.includes(board[q][r].piece?.type!))
			)
	}

	function check (thorough:boolean=true) {
		const opponent = Number(!turn) as Player;
		return players[opponent].pieces.board
			.filter(({piece, position}) => 
			(thorough || ['K','H','o'].includes(piece.type)) && contains(
				territory(...position, piece, false).territory, opponent? 'O' : 'G'))
				.map(({position}) => position!)
	}

	function placable(i: number) {
		const piece = players[turn].pieces.hand[i];
		const placable = {...mutate(board, (q,nq) => Object.entries(nq))}
		const conditions:((q:number,r:number,a:TileAttributes)=>boolean)[] = [
			(q,r,a) => a.piece === null
		];

		if (piece.type === 'f') {
			conditions
				.push((q) => 
					!Object.values(placable[q])
						.some(([_,{piece}]) => 
						   piece?.type === 'f' 
						&& piece?.allegiance === turn))
		}

		if (mode.current === Mode.check) {
			conditions
				.push((q,r) => {
					const tmp = board[q][r].piece;
					board[q][r].piece = piece;
					const legal = check(true).length === 0;
					board[q][r].piece = tmp;

					return legal;
				})
		}

		
		return mutate(placable,
			(q,nq) => nq.filter(([r, a]) => conditions
				.every(condition => condition(q,r,a)))
				.map(([r,_]) => r),
				([_,rs])=>rs.length > 0);
	}

	function hint(q:number, r?:number) {
		q = Number(q);
		if (r !== undefined) {
			r = Number(r);
			setFocus([q,r]);
			highlight(territory(q,r).territory);
			mode.current = Mode.moving;
		}
		else {
			setFocus(q);
			highlight(placable(q));
			mode.current = Mode.placing;
		}
	}

	function clear() {
		update();
		setFocus(null);
		if (checks.length > 0)
			mode.current = Mode.check;
		else
			mode.current = Mode.default;
	}

	function action (q:number, r:number) {
		const {piece, highlighted} = board[q][r];

		if (highlighted) {
			let res: `${Piece['repr']}${number},${number}`|undefined;
			switch (mode.current) {
				case Mode.moving:
					res = move(focus as Coord, [q, r]);
				break;
				case Mode.placing:
					res = place(q,r);
				break;
				case Mode.selecting:
					if (!validMode<Choice>(focus))
						throw Error('invalid state');
					res = focus.complete();
				break;
				default:
					return;
			}

			if (res === undefined)
				return;

			mode.current = Mode.default;
			nextTurn(res, board, mutate(players, (p, s) => s.pieces.hand));
			setFocus(null);
			

		} else if (piece?.allegiance === turn && (mode.current === Mode.default || mode.current === Mode.check)) {
			hint(q, r);
		} else if (mode.current === Mode.selecting) {
			if (!validMode<Choice>(focus))
				throw Error('invalid state')
			focus.cancel();
		} else {
			clear();
		}
	}

	function capture(target:Piece, playerState:PlayerState = players[turn]) {
		let opponent = players[Number(!turn) as Player]
		opponent.pieces.board = opponent.pieces.board.filter(({piece}) => piece !== target)
		opponent.setPieces({
			...opponent.pieces,
		})
		if (target.nari)
			target.naru();
		target.allegiance = turn;
		playerState.pieces.hand.push(target)
	}

	function move(origin:Coord, destination:Coord, playerMove:boolean = true): `${Piece['repr']}${number},${number}`|undefined {
		let [ oq, or, ] = origin;
		const [q, r] = destination;
		if (q === oq && r === or)
			return;

		const piece = board[oq][or].piece!;
		let u:Changes = {[q]: []};
		u[oq] = [];

		if (playerMove && !piece.nari) {
			let res = territory(q,r, piece);

			if (Object.keys(res.territory).length === 0 && !res.blocked) {
				piece.naru();
			} else if ((jin(turn, q, r) || jin(turn, oq, or))) {
				setFocus(new Nari([oq, or], [q, r]));
				mode.current = Mode.selecting;
				return;
			}
		}

		const captured = board[q][r].piece

		u[q].push([r, { piece }]);
		u[oq].push([or, { piece: null }]);

		const player = players[turn]

		player.pieces.board.forEach(({piece:bPiece},i) => {
			if (bPiece === piece)
				player.pieces.board[i] = {piece, position:destination}
		})

		if (captured !== null) {
			capture(captured, player);
		}


		update(u);
		return `${piece.repr}${q},${r}`;
	}

	function place (q:number, r:number): `${Piece['repr']}${number},${number}`|undefined {
		q = Number(q); r = Number(r);
		if (typeof focus !== 'number')
			throw Error('invalid state');

		const pieces = mutate(players[turn].pieces, (_, v) => v.slice()) as PlayerState['pieces']

		const piece = pieces.hand[focus];
		pieces.hand = [...pieces.hand.slice(0,focus), ...pieces.hand.slice(focus+1)];
		pieces.board.push({piece, position:[q,r]})

		let s = turn?-1:1;

		if (piece.type === 'o' && !(s*r > 0 && s*(q+r) > 0)) {
			setFocus(new Direction(focus, [q,r]));
			return;
		}

		players[turn].setPieces(pieces);

		update({[q]: [r, { piece: piece! }]});
		return `${piece!.repr}${q},${r}`;
	}

	function validMode<FocusType=number> (focus:any): focus is FocusType {
		switch (mode.current) {
			case Mode.selecting:
				if (!Object.hasOwn(focus,'destination'))
					return false;
			break;
			case Mode.default:
				if (focus !== null)
					return false;
			break;
			case Mode.moving:
				if (!Array.isArray(focus) || Array.isArray(focus[0]))
					return false;
			break;
			case Mode.placing:
				if (typeof focus !== 'number')
					return false;
			break;
		}
		return true;
	}

	function hover (q: number, r: number, ...rest:any[]) {
		q = Number(q); r = Number(r);
		if (mode.current === Mode.selecting) {
			if (!validMode<Choice>(focus))
				throw Error('invalid state');
			focus.update(q,r, ...rest);
		}
	}

	function oob(q: number, r: number) {
		return (Math.abs(q) > size
			|| Math.abs(r) > size
			|| Math.abs(q + r) > size)
	}



	return (
	<svg id='board' viewBox='-400 -500 800 1000' >
		{Object.entries(board)
			.map(([q, item]) => {
				q = Number(q);
				return Object.entries(item)
					.map(([r, attrs]) => {
						r = Number(r);
						const classNames = [];
						const coord = [q,r];
						if (Array.isArray(focus) && arraycmp(focus,coord))
							classNames.push('focus');
						if (field[q] && field[q].has(r))
							classNames.push('field');
						if (immovable.some(e => arraycmp(e,coord)))
							classNames.push('immovable');
						if (checks.some(e => arraycmp(e,coord)))
							classNames.push('checking');
						if (checks.length > 0 && attrs.piece?.type === (turn?'G':'O'))
							classNames.push('check');
						

						return (
						<Hex 
							className={classNames.join(' ')}
							key={String(coord)} 
							onClick={() => action(q,r)}
							onHover={hover}
							{...{ turn, q, r, highlight, move, clear, ...attrs }}
							/>);
					});
			}).flat()}
		{players[Number(!turn) as Player]
			.pieces.hand.map((piece, i) => 
				<PieceRepr 
					key={i}
					x={-300 + 55*i}
					y={420}
					rotate={180}
					{...{piece, }}
					/>
			)}
		{players[turn]
			.pieces.hand.map((piece, i) => 
				<PieceRepr
					key={i}
					className={i===focus? 'highlight':''}
					x={-300 + 55*i}
					y={420}
					onClick={i===focus?clear:
					() => hint(i)}
					{...{piece, }}
					/>
			)}
	</svg>);
}

export default Board;