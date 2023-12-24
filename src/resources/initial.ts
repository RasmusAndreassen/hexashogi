import { PieceType } from './pieces';
import { Player } from './types';
const initial: {
	[q: number]: {
		[r: number]: {
			piece: PieceType,
			owner: Player,
		}
	}
} = {
	[-5]: {
		0: {
			piece: 'f',
			owner: Player.gyoku
		},
		5: {
			piece: 'f',
			owner: Player.ou
		}
	},
	[-4]: {
		[-1]: {
			piece: 'e',
			owner: Player.gyoku
		},
		0: {
			piece: 'f',
			owner: Player.gyoku,
		},
		4: {
			piece: 'f',
			owner: Player.ou,
		},
		5: {
			piece: 'e',
			owner: Player.ou
		}
	},
	[-3]: {
		[-2]: {
			piece: 'o',
			owner: Player.gyoku
		},
		0: {
			piece: 'f',
			owner: Player.gyoku,
		},
		3: {
			piece: 'f',
			owner: Player.ou,
		},
		5: {
			piece: 'o',
			owner: Player.ou
		}
	},
	[-2]: {
		[-3]: {
			piece: 'g',
			owner: Player.gyoku
		},
		[-1]: {
			piece: 'f',
			owner: Player.gyoku,
		},
		3: {
			piece: 'f',
			owner: Player.ou,
		},
		5: {
			piece: 'g',
			owner: Player.ou,
		},
	},
	[-1]: {
		[-4]: {
			piece: 'k',
			owner: Player.gyoku
		},
		[-1]: {
			piece: 'f',
			owner: Player.gyoku,
		},
		2: {
			piece: 'f',
			owner: Player.ou,
		},
		5: {
			piece: 'k',
			owner: Player.ou,
		}
	},
	0: {
		[-5]: {
			piece: 'G',
			owner: Player.gyoku,
		},
		[-4]: {
			piece: 'H',
			owner: Player.gyoku,
		},
		[-3]: {
			piece: 'K',
			owner: Player.gyoku,
		},
		[-2]: {
			piece: 'f',
			owner: Player.gyoku,
		},
		2: {
			piece: 'f',
			owner: Player.ou,
		},
		3: {
			piece: 'K',
			owner: Player.ou,
		},
		4: {
			piece: 'H',
			owner: Player.ou,
		},
		5: {
			piece: 'O',
			owner: Player.ou,
		}
	},
	1: {
		[-5]: {
			piece: 'k',
			owner: Player.gyoku
		},
		[-2]: {
			piece: 'f',
			owner: Player.gyoku,
		},
		1: {
			piece: 'f',
			owner: Player.ou,
		},
		4: {
			piece: 'k',
			owner: Player.ou,
		}
	},
	2: {
		[-5]: {
			piece: 'g',
			owner: Player.gyoku
		},
		[-3]: {
			piece: 'f',
			owner: Player.gyoku,
		},
		1: {
			piece: 'f',
			owner: Player.ou,
		},
		3: {
			piece: 'g',
			owner: Player.ou,
		}
	},
	3: {
		[-5]: {
			piece: 'o',
			owner: Player.gyoku
		},
		[-3]: {
			piece: 'f',
			owner: Player.gyoku,
		},
		0: {
			piece: 'f',
			owner: Player.ou,
		},
		2: {
			piece: 'o',
			owner: Player.ou
		}
	},
	4: {
		[-5]: {
			piece: 'e',
			owner: Player.gyoku
		},
		[-4]: {
			piece: 'f',
			owner: Player.gyoku,
		},
		0: {
			piece: 'f',
			owner: Player.ou,
		},
		1: {
			piece: 'e',
			owner: Player.ou,
		}
	},
	5: {
		[-5]: {
			piece: 'f',
			owner: Player.gyoku,
		},
		0: {
			piece: 'f',
			owner: Player.ou,
		}
	}
}

export default initial;