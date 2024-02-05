import { operations, type Piece as _Piece } from "../resources/pieces"
import './Piece.css'
import { Coord, Player } from "../resources/types";

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
	const { owner, type, nari, } = piece;
	if (type === 'o' && piece.direction) {
		classNames.push(piece.direction);
	}

	classNames.push(Player[owner]);
	if (nari)
		classNames.push('nari');

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
			<polygon points='20,20 15,-15 0,-23 -15,-15 -20,20' />
			<text fill='black'>{operations.repr(piece)}</text>
		</g>);
}

export default Piece;