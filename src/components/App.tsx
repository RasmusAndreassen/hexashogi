import { useState } from 'react';
import './App.css';
import Board from './Board';
import { BoardState, Color, History } from '../resources/types';
import MoveLog from './MoveLog';

function App() {
  const [turn, setTurn] = useState<Color>(Color.white);
  const [history, setHistory] = useState<History>([]);

  function nextTurn (move:string, state:BoardState) {
    switch (turn) {
      case Color.black:
        setTurn(Color.white);
      break;
      case Color.white:
        setTurn(Color.black);
      break;
    }
    setHistory([
      ...history,
      {move, state}
    ])
  }

  return (
    <div className='App'
    style={{alignItems:'center',display:'flex', height:'100%'}}>
      <Board size={5} {...{turn, nextTurn}}/>
      <MoveLog {...{history}}/>
    </div>
  );
}



export default App;
