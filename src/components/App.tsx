import './App.css';
import Board from './Board';
import { Log, } from './Log';
import { Move, Player } from '../resources/types';
import { locale } from '../resources/locale';
import { Provider } from 'react-redux'
import store from '../store/store';
import { useState } from 'react';
import { GameContext } from './GameContext';
import { useImmer } from 'use-immer';


function usePair<T>(initial:T):[T, T, ()=>void] {
	const [ [a, b], setValue ] = useState([!!initial, !initial]);
	const switcher = () => setValue([b, a]);

	const t = typeof initial === 'number'? Number : Boolean;

	return [ t(a) as T, t(b) as T, switcher ];
}

type State = ReturnType<typeof store['getState']>

enum Lang {
	JA = 'ja',
	EN = 'en',
}

function App() {
	const [ lang, setLang ] = useState(Lang.JA);
	const [ finished, setFinished ] = useState(false);
	const finish = () => setFinished(true);
	const [ turn, opposing, nextTurn] = usePair(Player.ou);
	const [ move, setMove ] = useImmer([] as Move);

	const boardProps = {
		setMove,
		nextTurn,
		finish,
	}
	const logProps = {
		setLang,
	}

	return (
		<GameContext.Provider value={{turn, opposing, move}}>
			<Provider store={store}>
				<div className='App'>
					{finished?<div id='wincard'>
						{locale[lang].victor(locale[lang][Player[turn] as 'black'|'white'])}
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
