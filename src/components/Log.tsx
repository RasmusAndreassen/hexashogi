import './Log.css';
import { useDispatch, useSelector } from 'react-redux';
import { State } from './App';
import { logActions } from '../store/slices/logSlice';
import { useState } from 'react';

function useCap(init:number, cap:number) {
	const { min, } = Math;

	const [ val, setVal ] = useState(init);


	function _setVal(newVal:number) {
		setVal(min(newVal, cap));
	}

	return [min(val, cap), _setVal] as const;
}


export function Log () {
	const log = useSelector<State, State['log']>(state => state.log);
	const dispatch = useDispatch();

	const [cursor, setCursor] = useCap(0, log.length);

	return (
		<div id="log">
			<div className="log-bar">
				<button 
					onClick={e => {
						setCursor(cursor-1);
						e.preventDefault();
						e.stopPropagation();
					}}
					type='button'
					disabled={log.length === 0 || cursor === 0}
					>⎌</button>
				<button 
					onClick={e => {
						setCursor(cursor+1);
						e.preventDefault();
						e.stopPropagation();
					}}
					type='button'
					disabled={log.length === 0 || cursor === log.length-1}
					>⎌</button>
			</div>
			<div className='scroll-box'>
				<ol>{log.toSpliced(0,1).map((state, i) =>
					<li
						key={i}
						className={i === cursor?'current':''}
						onClick={e => {
							dispatch({type:'override', state});
							e.preventDefault();
							e.stopPropagation();
						}}
						>
						{state.moveCode}
					</li>
				)}</ol>
			</div>
		</div>
	)
}