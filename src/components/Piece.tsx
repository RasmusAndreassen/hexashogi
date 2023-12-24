import type { Piece as _Piece } from "../resources/pieces"
import './Piece.css'
import { GameContext } from './GameContext';
import { useContext } from "react";
import { Coord, Player } from "../resources/types";
import { BoardContext } from "./BoardContext";
import { arrayEq } from "../resources/util";

interface Props {
	position: Coord|number;
	piece: _Piece;
	onMouseEnter?: ()=>void;
	onClick?: (p:Coord|number)=>void;
	classNames?:string[];
	i?: number;
}


function Piece({ piece, onClick, onMouseEnter, classNames, i, position, }: Props) {
	classNames = ['piece', ...classNames??[]];
	const { owner, type, nari, repr, } = piece;
	let { turn, move } = useContext(GameContext);
	let { threatening, movable, } = useContext(BoardContext);
	if (type === 'o' && piece.direction) {
		classNames.push(piece.direction);
	}

	let fontFamily;
	classNames.push(Player[owner])
	if (nari)
		classNames.push('nari');
	// if (move)
	// 	classNames.push('selected');
	if (piece.owner === turn && !movable.some(pos => arrayEq(pos, position as Coord)))
		classNames.push('immovable');
	else if (threatening.includes(piece as any))
		classNames.push('oute');

	return (
		<g 
			style={{'--i':i} as any}
			className={classNames.join(' ')}
			onClick={e => {
				if (onClick) {
					e.stopPropagation();
					onClick(position);
				}
				}}
			{...{onMouseEnter, type, }}
			>
			<polygon points='20,18 15,-15 0,-23 -15,-15 -20,18' />
			<text textAnchor="middle" dominantBaseline='center' fill='black' fontSize={17} style={{fontFamily}}>{repr}</text>
		</g>);
}

export default Piece;