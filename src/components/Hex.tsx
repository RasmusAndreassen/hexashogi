import { useContext } from 'react';
import { jin } from '../resources/util';
import './Hex.css';
import { GameContext } from './GameContext';

interface Props {
	q: number,
	r: number,
	onClick?: () => void,
	onHover?: () => void,
	children?:JSX.Element|JSX.Element[],
	classNames?: string[]
}

function Hex(props: Props) {
	let { q, r, onClick, onHover, classNames, children } = props;

	const { cos, sin, PI } = Math

	const cradius = 40;
	const iradius = sin(PI / 3) * cradius;

	let x = (q * 3 / 2 * cradius).toPrecision(6);
	let y = (2 * iradius * r + iradius * q).toPrecision(6);


	let points = [];

	for (let i = 0; i < 6; i++) {
		let angle = i * PI / 3;

		let x = cos(angle) * cradius;
		let y = sin(angle) * cradius;

		points.push([x, y]);
	}

	const { turn, } = useContext(GameContext);

	let color
	if (jin(turn[1], q, r))
		color = 'cadetblue';

	classNames = ['tile', ...classNames??[]];

	return (
		<g className={classNames.join(' ')} style={{translate: `${x}px ${y}px`, '--base-fill':color}} >
			<polygon
				points={points.map(([x, y]) => `${x},${y}`).join(' ')}
				onMouseEnter={() => {
					if (onHover)
						onHover();
				}}
				onClick={e => {
					e.stopPropagation();

					if (onClick)
						onClick();
				}}
			/>
			{children}
		</g>
	);
}

export default Hex;