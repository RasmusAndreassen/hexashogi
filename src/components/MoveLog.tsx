import { BoardState } from "../resources/types";

interface Props {
	history: {
	move:string;
	state:BoardState;
	}[]
}

function MoveLog ({history}:Props) {
	return (
		<ol style={{width:'10%', textJustify: 'inter-character', paddingLeft:'4%'}}>
			{history.map(({move}) => <li>{move}</li>)}
		</ol>
	)
}
export default MoveLog;