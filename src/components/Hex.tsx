import { useState } from "react";
import { Color, TileAttributes } from "../resources/types";

type Props = {
	turn:Color,
  q:number,
  r:number,
  highlight:(q:number, r:number, ...moves:string[])=>void,
  move:(q:number,r:number)=>void,
  clear:()=>void
}
 & TileAttributes;

function Hex(props:Props) {
	const {q, r, turn, highlight, move, clear, highlighted} = props;

	const cradius = 40;
	const iradius = Math.sin(Math.PI/3)*cradius;

	let x = q * 3/2 * cradius;
	let y = 2*iradius * r + iradius * q;;

	if (turn === Color.black){
		x = -x; y = -y}

	let points = [];

	for (let i = 0; i < 6; i++){
		let angle = i*Math.PI/3;

		let x = Math.cos(angle)*cradius;
		let y = Math.sin(angle)*cradius;

		points.push([x, y]);
	}

  let c = (r - q) % 3;
  if (c < 0)
	 c = 3 + c;

  let saturation = 0;
  let light;
  const [hover, setHover] = useState<boolean>(false);

  if (hover)
	 saturation+= 30;
  if (highlighted)
	 saturation+= 50;
  switch (c){
	 case 0:
		light = 50;
	 break;
	 case 1:
		if (hover || highlighted)
		  light = 30;
		else
		  light = 20;
		
	 break;
	 case 2:
		if (hover || highlighted)
		  light = 70;
		else
		  light = 95;
		
	 break;
  }

  let {piece} = props;

  return (
	 <g transform={`translate(${x},${y})`} >
		<polygon 
		  points={points.map(([x,y]) => `${x},${y}`).join(' ')}
		  style={{
			 fill: `hsl(60, ${saturation}%, ${light}%)`,
			 stroke:'black',
			 strokeWidth:2,
		  }}
		  onMouseEnter={() => {
			 setHover(true);
		  }}
		  onMouseLeave={() => {
			 setHover(false);
		  }}
		  onClick={() => {
			 if (highlighted)
				move(q,r);
			 else if (piece?.color === turn)
				highlight(q, r, ...piece.moves);
			 else
				clear();
		  }}
		  />
		  {piece?
		  <g style={{pointerEvents:'none', height:'100%', width:'100%'}}>
			 <circle r='25' fill={Color[piece.color]} style={{pointerEvents:'none'}}/>
			 <text x='-9' dominantBaseline='central' style={{pointerEvents:'none', fontFamily:'LigatureSymbols'}} fill={Color[Number(!piece.color)]} fontSize={40} transform='translate(-11,6)'>{piece.repr}</text>
		  </g>:<></>}
	 </g>
	 );
}

export default Hex;