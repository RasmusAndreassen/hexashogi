import { Coord, Player, Move, } from "../resources/types";

import './Board.css';
import Hex from "./Hex";
import Piece from "./Piece";
import * as P from "../resources/pieces";
import { useDispatch, useSelector } from "react-redux";
import { State } from "./App";
import { useContext, useMemo, } from "react";
import { GameContext } from "./GameContext";
import { pieceActions } from "../store/slices/pieceSlice";
import { arrayEq, jin, mutate, } from "../resources/util";
// import { BoardContext } from "./BoardContext";
import { blocked, outeCheck, placable, territory } from "./memo";
import { useImmer } from "use-immer";

interface HexProps {
	key: string;
	q: number;
	r: number;
	classNames: Status[];
	onClick?: () => void;
};

interface PieceProps {
	piece: P.Piece;
	position: Coord;
	classNames: Status[];
	onClick?: () => void;
}

interface Props {
	setMove: (producer:((move:Move)=>Move|void))=>void;
	nextTurn: ()=>void;
	finish: ()=>void;
}

const mode = {
	0: 'selecting',
	1: 'moving',
	4: 'nari'
} as const;

enum Hiatus {
	none,
	nari,
	direction,
}

type Status = 'highlighted'|'canMove'|'threatening'|'selected'|'threatened';

type HiatusState<T extends Hiatus = Hiatus> = 
	T extends Hiatus.none? {
	type: T;
} : T extends Hiatus.nari? {
	type: T;
	piece: P.type.Nari;
} : {
	type: T;
	direction: 'i'|'-j'|'-k';
}

function Board({setMove, nextTurn,}:Props) {
	const { board, players } = useSelector<State, State['piece']>(state => state.piece);
	const { turn, move, } = useContext(GameContext);
	const [ hiatus, setHiatus ] = useImmer<HiatusState>({type:Hiatus.none});
	const [ current, opposing, ] = turn;
	const dispatch = useDispatch();
	
	const threatening = useMemo(() => 
		outeCheck(players[current].king, players[opposing], board),
	// eslint-disable-next-line react-hooks/exhaustive-deps
	[players, turn, board]);

	const oute = threatening.length > 0;

	const movable = useMemo(() =>
		players[current].board.filter(pos => territory(board, pos, oute, turn, players)?.length > 0),
	// eslint-disable-next-line react-hooks/exhaustive-deps
	[oute, players, turn, board]);

	const range = useMemo(() => {
		if (move.current.length !== 1)
			return [];
		const [current, opposing] = turn;

		if (typeof move.current[0] === 'number') {
			const i = move.current[0] as number;
			const type = players[current].hand[i];

			let predicate = (_:Coord) => true;

			if (type === 'f') {
				const __predicate = predicate;
				predicate = (pos) => Object.values(board[pos[0]]).some(piece => !(piece?.owner === current && piece.type === 'f')) && __predicate(pos);
			}
			if (oute) {
				const __predicate = predicate;
				predicate = (pos) => outeCheck(players[current].king, players[opposing], board).length === 0 && __predicate(pos);
			}
			return placable(board, predicate);
		} else {

			const pos = move.current[0] as Coord;

			return territory(board, pos, oute, turn, players);
		}

	}, [move, board, turn, oute, players]);

	const richBoard = useMemo(() => {
		const rB = mutate(board, (_, col) => 
			mutate(col, (_, piece) =>
				({piece, stati:[] as Status[]})
			));

		range.forEach(([q,r]) => {
			rB[q][r].stati.push('highlighted');
		});
		movable.forEach(([q,r]) => {
			rB[q][r].stati.push('canMove')
		});
		threatening.forEach(([q,r]) => {
			rB[q][r].stati.push('threatening')
		});

		if (move.current[0] instanceof Array) {
			const [q,r] = move.current[0];
			rB[q][r].stati.push('selected')
		}
		if (threatening.length > 0) {
			const [q,r] = players[current].king;
			rB[q][r].stati.push('threatened');
		}
		return rB;

	// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [range, movable, threatening, move]);

	function makeHex(q:number, r:number, piece:P.Piece|null, stati:Status[]) {
		const hexProps:HexProps = {
			key:`${q},${r}`,
			q,
			r,
			classNames: stati,
		};

		const pieceProps:PieceProps = {
			piece: piece!,
			position: [q,r] as Coord,
			classNames: stati,
		};

		 if (hiatus.type) {
			return hiatusHex(q,r,hexProps,pieceProps);
		} else if (stati.includes('highlighted')) {
			hexProps.onClick = () => {
				actions.setDst(q,r);
				const src = move.current[0]!;

				if (typeof src === "number") {
					const type = players[current].hand[src];
					
					if (type === 'o') {
						setHiatus({
							type: Hiatus.direction,
							direction: 'i',
						});
						return;
					}

					actions.place();
				} else {
					const [sq, sr] = src;
					const piece = board[sq][sr]!;

					if (P.operations.notNari(piece)
					 && P.operations.canNari(piece)) {
						if (blocked(board, [q,r], piece)) {
							actions.move(P.operations.naru(piece));
							return;
						} else if
							( jin(opposing, q, r)
							||jin(opposing, sq, sr)) {
							setHiatus({
								type:Hiatus.nari,
								piece:piece.type
							});
							return;
						}
					}

					actions.move();
				}
			}
		
		} else if (stati.includes('canMove')) {
			pieceProps.onClick = () => actions.setSrc(q,r);
		} else {
			hexProps.onClick = actions.clear;
		}

		return (
			<Hex 
				{...hexProps}>
				{piece?
				<Piece
					{...pieceProps}/>
					:<></>}
			</Hex>
		);
	}

	function hiatusHex(q:number, r:number, hexProps:HexProps, pieceProps:PieceProps) {
		const pieceRepr = pieceProps.piece? <Piece {...pieceProps}/>: undefined
		/** This is the tile preventing the move from being completed */
		if (arrayEq([q,r], move.current[1]!)) {
			switch (hiatus.type) {
				case Hiatus.nari:{
					const piece = P.operations.newPiece(hiatus.piece, current);
					const nari = P.operations.naru(piece);
					hexProps.classNames.push('selected');
					return (
						<Hex {...hexProps}>
							<Piece
								piece={piece}
								position={[q,r]}
								classNames={['left']}
								onClick={() => actions.nari(false)}
								/>
							<Piece
								piece={nari}
								position={[q,r]}
								classNames={['right']}
								onClick={() => actions.nari(true)}
								/>
						</Hex>
					);
				}
				case Hiatus.direction: {
					const piece = P.operations.newPiece('o', current);
					piece.direction = hiatus.direction;
					return (
						<Hex {...hexProps}>
							<Piece
								piece={piece}
								position={[q,r]}
								/>
						</Hex>
					);
				}
			}
		} else if (hiatus.type === Hiatus.direction) {
			let direction: 'i'|'-j'|'-k'|undefined;
			const [pq, pr] = move.current[1]!;

			const s = -1 + current * 2;

			switch (`${q-pq},${r-pr}`) {
				case  s+','+0 : direction = '-j'; break;
				case  0+','+s: direction =  'i'; break;
				case -s+','+s: direction = '-k'; break;
			}

			if (direction) {
				hexProps.classNames.push('highlighted')
				return (
					<Hex 
						{...hexProps}
						onHover={() => actions.updateDirection(direction!)}
						onClick = {() => {
							const piece = P.operations.newPiece('o', current);
							piece.direction = hiatus.direction;
							actions.place(piece);
							actions.resolveHiatus();
						}}
						>
						{pieceRepr}
					</Hex>
				);
			}
		}
		return (
			<Hex {...hexProps}>
				{pieceRepr}
			</Hex>
		);
	}

	const actions = {
		setSrc(q_i:number,r?:number) {
			let pos:number|Coord;
			if (r === undefined) {
				pos = q_i;
			} else {
				pos = [q_i,r] as Coord;
			}
			setMove(()=>[pos]);
		},

		setDst(q:number, r:number) {
			setMove(move => {
				move[1] = [q,r];
				move[2] = board[q][r];
			});
		},

		move(piece?:P.Piece) {
			const [src, dst] = move.current;
			dispatch(pieceActions.move({
				src: src as Coord,
				dst: dst!,
				piece,
			}));
			nextTurn();
		},

		place(piece?:P.Piece) {
			const [src, dst] = move.current;
			dispatch(pieceActions.place({
				player: current,
				src: src as number,
				dst: dst!,
				piece,
			}));
			nextTurn();
		},

		nari(choice:boolean) {
			const [q,r] = move.current[0] as Coord;
			const piece = board[q][r] as P.Piece<false>;
			actions.move(choice? P.operations.naru(piece): piece);
			actions.resolveHiatus()
		},

		updateDirection(direction:'i'|'-j'|'-k') {
			setHiatus(hiatus => {
				(hiatus as HiatusState<Hiatus.direction>).direction = direction;
			});
		},

		clear() {
			setMove(()=>[]);
		},

		resolveHiatus() {
			setHiatus({type: Hiatus.none})
		}
	}

	let selection = move.current[0];

	let classNames:string[] = [];
	if (hiatus.type)
		classNames.push(Hiatus[hiatus.type]);
	classNames.push(Player[current]);
	classNames.push(mode[move.current.length as 0|1|4]);

	return (
	<svg
		id='board'
		className={classNames.join(' ')}
		viewBox='-380 -450 760 900'
		onClick={actions.clear}
		>
		{/* <BoardContext.Provider value={{threatening, movable}}> */}
			<g id="content">
				{Object.entries(richBoard)
					.flatMap(([q, col]) => {
						q = Number(q);
						return Object.entries(col)
							.map(([r, {piece, stati}]) => {
								r = Number(r);

								return makeHex(q, r, piece, stati);
							});
				})}
				<g className={`hand ${Player[opposing]}`}>{
					players[opposing]
						.hand.map((type, i) => 
							<Piece 
								key={i}
								position={i}
								piece={P.operations.newPiece(type, opposing)}
								/>
						)
				}</g>
				<g className={`hand ${Player[current]}`}>{
					players[current]
						.hand.map((type, i) => 
							<Piece
								key={i}
								position={i}
								onClick={() => actions.setSrc(i)}
								classNames={i === selection?['selected']:undefined}
								piece={P.operations.newPiece(type, current)}
								/>
						)
				}</g>
			</g>
		{/* </BoardContext.Provider> */}
	</svg>);

}

export default Board;