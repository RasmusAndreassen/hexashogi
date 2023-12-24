import { createContext } from "react";
import { Move, Player, } from "../resources/types";

interface Context {
	turn: Player;
	opposing: Player;
	move: Move;
}

export const GameContext = createContext<Context>(undefined as any);