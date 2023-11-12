import type { Piece as _Piece } from "../resources/pieces"
import './Piece.css'

interface Props {
	piece: _Piece;
	rotate?: number;
	x?:number;
	y?: number;
	onMouseEnter?: ()=>void;
	onClick?: ()=>void;
	className?:string;
	scale?:number;
}


function Piece({ piece, rotate, x, y, onClick, onMouseEnter, className:classes, scale, }: Props) {
	
	const className = ['piece']
	const { type, nari, repr, ghost, } = piece;
	let squeeze = 1;
	if (type === 'o') {
		rotate = rotate ?? 0;
		switch (piece.direction) {
			case '-j':
				rotate -= 60;
				squeeze = 0.96;
			break;
			case '-k':
				rotate += 60;
				squeeze = 0.96;
			break;
		}
	}

	scale = scale ?? 1

	let fontFamily;
	if (classes)
		className.push(classes);
	if (ghost)
		className.push('ghost');
	if (nari) {
		className.push('nari');
		if (type === 'g' || type === 'e')
			fontFamily = 'hkgyos'
	}
	return (
		<g 
			className={className.join(' ')}
			transform={`rotate(${rotate??0}) translate(${x??0},${y??0}) scale(${squeeze*scale},${scale})`}
			{...{onClick, onMouseEnter}}
			>
			<polygon points='25,22 20,-19 0,-30 -20,-19 -25,22' />
			<text textAnchor="middle" dominantBaseline='center' fill='black' fontSize={20} style={{fontFamily}}>{repr}</text>
		</g>);
}

export default Piece;