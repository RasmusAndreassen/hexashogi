import { createContext } from "react";
import { Coord } from "../resources/types";

interface Context {
	threatening: Coord[];
	movable: Coord[];
}

export const BoardContext = createContext<Context>(undefined as any);