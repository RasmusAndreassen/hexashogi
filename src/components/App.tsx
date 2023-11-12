import { useState } from 'react';
import './App.css';
import Board from './Board';
import { BoardState, Player, History, } from '../resources/types';
import MoveLog from './MoveLog';
import { Piece } from '../resources/pieces';

function App() {
  const [turn, setTurn] = useState<Player>(Player.ou);
  const [history, setHistory] = useState<History>([]);

  function nextTurn (move:string, board:BoardState, hands:{[P in Player]:Piece[]}) {
    switch (turn) {
      case Player.gyoku:
        setTurn(Player.ou);
      break;
      case Player.ou:
        setTurn(Player.gyoku);
      break;
    }
    setHistory([
      ...history,
      {move, state:{board, hands}}
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
