import { Player, TileAttributes } from "../resources/types";
import './Hex.css';
import Piece from "./Piece";

type Props = {
	className?:string,
	turn: Player,
	q: number,
	r: number,
	onClick: () => void,
	onHover: (q:number,r:number) => void
}
	& TileAttributes;

function Hex(props: Props) {
	let { q, r, turn, highlighted, onClick, onHover, className } = props;

	const cradius = 40;
	const iradius = Math.sin(Math.PI / 3) * cradius;

	let x = q * 3 / 2 * cradius;
	let y = 2 * iradius * r + iradius * q;

	if (turn === Player.gyoku) {
		x = -x; y = -y;
	}

	let points = [];

	for (let i = 0; i < 6; i++) {
		let angle = i * Math.PI / 3;

		let x = Math.cos(angle) * cradius;
		let y = Math.sin(angle) * cradius;

		points.push([x, y]);
	}

	let { piece, extra, update, } = props;
	let rotate = ((Array.isArray(piece)? piece[0].allegiance : piece?.allegiance) === turn)? 0 : 180;
	
	const classNames = ['tile']
	if (className)
		classNames.push(className);
	if (highlighted)
		classNames.push('highlight');

	
	
	return (
		<g className={classNames.join(' ')} transform={`translate(${x},${y})`} >
			<polygon
				points={points.map(([x, y]) => `${x},${y}`).join(' ')}
				onMouseEnter={() => {
					onHover(q,r);
				}}
				{...{onClick}}
			/>
			{!!extra && !!piece? 
			<>
				<Piece 
					className="choosing left"
					onMouseEnter={()=> update!(q,r,false)}
					{...{
						onClick,
						piece,
						rotate,
					}}/>
				<Piece 
					className="choosing right"
					onMouseEnter={()=> update!(q,r,true)}
					{...{
						onClick,
						piece:extra,
						rotate,
					}}/>
			</>:
			!!piece? 
				<Piece 
					{...{
					piece,
					rotate,
					}}/>:
				null}
		</g>
	);
}

export default Hex;