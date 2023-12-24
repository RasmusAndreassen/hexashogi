import { Coord, Player, Move, TileAttributes, PieceState, } from "../resources/types";

import './Board.css';
import Hex from "./Hex";
import Piece from "./Piece";
import { PieceNari, Piece as PieceT, operations } from "../resources/pieces";
import { useDispatch, useSelector } from "react-redux";
import { State } from "./App";
import { useContext, useMemo } from "react";
import { GameContext } from "./GameContext";
import { pieceActions } from "../store/slices/pieceSlice";
import { useImmer } from "use-immer";
import { arrayEq, } from "../resources/util";
import { BoardContext } from "./BoardContext";
import { outeCheck, territory } from "./heavy";

interface Props {
	setMove: (update:Move|((move:Move)=>void))=>void;
}

const mode = {
	0: 'selecting',
	1: 'moving',
	4: 'nari'
} as const;

enum HiatusType {
	nari,
	direction,
}

type Hiatus<T extends HiatusType> = {
	type: T;
	piece: T extends HiatusType.direction? PieceT<false, 'o'>: PieceT<false, PieceNari>;
	pos: Coord;
}

function Board({setMove}:Props) {
	const { board, players } = useSelector<State, State['piece']>(state => state.piece);
	const { turn, opposing, move, } = useContext(GameContext);
	const dispatch = useDispatch();
	const [ hiatus, setHiatus ] = useImmer<Hiatus<HiatusType>|undefined>(undefined);
	
	const threatening = useMemo(() =>
		outeCheck(players[turn].king, players[opposing], board),
	[players, turn, board]);

	const oute = threatening.length > 0;

	const movable = useMemo(()=>
		players[turn].board.filter(pos => territory(board, pos, oute, legal(pos, players, turn, opposing)).area.size > 0),
	[oute, players, turn, board]);

	const range = useMemo(()=>{
		if (move.length !== 1 || typeof move[0] === 'number')
			return;

		const pos = move[0] as Coord;

		const res:Coord[] = [];
		for (let [q, col] of territory(board, pos, oute, legal(pos, players, turn, opposing)).area.entries()) {
			if (typeof col === 'number')
				res.push([q,col]);
			else
			for (let r of col)
				res.push([q,r]);
		}
		return res;
	}, [move, board, turn, oute, players]);

	function makeHex(q:number, r:number, piece:PieceT|null) {
		const hexProps = {
			key:`${q},${r}`,
			q,
			r,
			classNames: [] as string[],
			onClick: actions.clear as (()=>void)|undefined,
		};
		const pieceProps = {
			piece: piece!,
			position:[q,r] as Coord,
			classNames: [] as string[],
		};

		if (range?.some(pos => arrayEq(pos, [q,r]))) {
			hexProps.onClick = actions.move
			hexProps.classNames.push('highlighted');
		}
		
		if (arrayEq([q,r], move[0]!))
			pieceProps.classNames.push('selected');

		if (hiatus) {
			delete hexProps.onClick;
			if (arrayEq([q,r], move[1]!)) {
				const { piece, } = hiatus;
				switch (hiatus.type) {
					case HiatusType.nari:
						const nari = operations.naru(piece);
						classNames = [...classNames, 'selected'];
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
					case HiatusType.direction:
						return (
							<Hex {...hexProps}>
								<Piece
									piece={piece}
									position={[q,r]}
									/>
							</Hex>
						);
				}
			} else if (hiatus.type === HiatusType.direction) {
				let direction: 'i'|'-j'|'-k'|undefined;
				const [bq, br] = move[1]!;

				switch (`${bq-q},${br-r}`) {
					case '0,-1': case  '0,1': direction =  'i'; break;
					case '-1,0': case  '1,0': direction = '-j'; break;
					case '1,-1': case '-1,1': direction = '-k'; break;
				}

				if (direction) {
					hexProps.onClick = actions.direct
					return (
						<Hex 
							onHover={() => actions.updateDirection(direction!)}
							{...hexProps}
							>
							{piece?<Piece {...pieceProps}/>:<></>}
						</Hex>
					);
				}
			}
			
			return (
				<Hex {...hexProps}>
					{piece?
						<Piece {...pieceProps}/>
						:<></>}
				</Hex>
			);
		
		}

		return (
			<Hex 
				{...hexProps}>
				{piece?
					<Piece 
						onClick={() => {
							if (piece.owner === turn)
								actions.setSrc(q,r);
						}}
						{...pieceProps}/>
					:<></>}
			</Hex>
		);
	}

	const actions = {
		setSrc(q_i:number,r?:number) {
			const pos = r === undefined? q_i: [q_i,r] as Coord;
			setMove([pos]);
		},

		setDst(q:number, r:number) {
			setMove(move => {
				move[1] = [q,r];
				move[2] = board[q][r];
			});
		},

		move() {
			const [src, dst, piece] = move;
			dispatch(pieceActions.move({
				src: src!,
				dst: dst!,
				piece: piece as Exclude<typeof piece, null>,
			}))
		},

		nari(choice:boolean) {
			const src = move[0] as Coord;
			const dst = move[1] as Coord;
			let { piece, } = hiatus as Hiatus<HiatusType.nari>;
			dispatch(pieceActions.move({
				piece: choice? operations.naru(piece): piece,
				src,
				dst,
			}))
		},

		updateDirection(direction:'i'|'-j'|'-k') {
			setHiatus((hiatus) => {
				const { piece, } = hiatus as Hiatus<HiatusType.direction>;
				piece.direction = direction;
			})
		},

		direct() {
			let { piece, } = hiatus as Hiatus<HiatusType.nari>;
			setMove(move => move[2] = piece);
		},

		clear() {
			setMove([]);
		},
	}

	let selection = move[0];

	let classNames:string[] = [];
	classNames.push(Player[turn]);
	classNames.push(mode[move.length as 0|1|4]);

	return (
	<svg
		id='board'
		className={classNames.join(' ')}
		viewBox='-380 -450 760 900'
		onClick={actions.clear}
		>
		<BoardContext.Provider value={{threatening, movable}}>
			<g id="content">
				{Object.entries(board)
					.flatMap(([q, item]) => {
						q = Number(q);
						return Object.entries(item)
							.map(([r, piece]) => {
								r = Number(r);

								return makeHex(q, r, piece);
							});
				})}
				<g className={`hand ${Player[Number(!turn)]}`}>{
					players[opposing]
						.hand.map((piece, i) => 
							<Piece 
								key={i}
								position={i}
								{...{piece}}
								/>
						)
				}</g>
				<g className={`hand ${Player[turn]}`}>{
					players[turn]
						.hand.map((piece, i) => 
							<Piece
								key={i}
								position={i}
								onClick={() => actions.setSrc(i)}
								classNames={i === selection?['selected']:undefined}
								{...{piece}}
								/>
						)
				}</g>
			</g>
		</BoardContext.Provider>
	</svg>);

}
function legal (pos:Coord, players:PieceState['players'], turn:Player, opposing:Player) {
	const [q, r] = pos;
	return (board:PieceState['board']) => outeCheck(
		players[turn].king,
		players[opposing],
		board,
		['O','G'].includes(board[q][r]?.type!)).length > 0;
}

export default Board;