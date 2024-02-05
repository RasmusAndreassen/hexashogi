import './App.css';
import Board from './Board';
import { Log, } from './Log';
import { Move, Player } from '../resources/types';
import { locale } from '../resources/locale';
import { Provider } from 'react-redux'
import store from '../store/store';
import { useState } from 'react';
import { GameContext } from './GameContext';
import { produce } from 'immer';


function usePair<A,B>(initial:[A,B]):[[A,B]|[B,A], ()=>void] {
	const [ [a, b], setValue ] = useState<[A,B]|[B,A]>(initial);
	const switcher = () => setValue([b, a] as [A,B]|[B,A]);

	return [ [a, b] as [A,B]|[B,A], switcher ];
}

type State = ReturnType<typeof store['getState']>

enum Lang {
	JA = 'ja',
	EN = 'en',
}

function useImmediate<T>(initial:T) {
	const [ value, setValue ] = useState(initial);

	const ref = {
		current: value,
	};

	function updateRef (producer:(draft:T) => T|void) {
		const newValue = produce(ref.current, producer);
		ref.current = newValue;
		setValue(newValue);
	}

	return [ref, updateRef] as const;

}

function App() {
	const [ lang, setLang ] = useState(Lang.JA);
	const [ finished, setFinished ] = useState(false);
	const finish = () => setFinished(true);
	const [ turn, nextTurn] = usePair([Player.ou, Player.gyoku]);
	const [ current, ] = turn;
	const [ move, setMove ] = useImmediate([] as Move);

	const boardProps = {
		setMove,
		nextTurn,
		finish,
	}
	const logProps = {
		setLang,
	}

	return (
		<GameContext.Provider value={{turn, move}}>
			<Provider store={store}>
				<div className='App'>
					{finished?<div id='wincard'>
						{locale[lang].victor(locale[lang][Player[current] as 'black'|'white'])}
					</div>:null}
					<Board {...boardProps}/>
					<Log {...logProps}/>
				</div>
			</Provider>
		</GameContext.Provider>
	);
}



export default App;
export type {State};
