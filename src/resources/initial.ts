import { PieceType } from './pieces';
import { Player } from './types';
const initial: {
	[q: number]: {
		[r: number]: {
			piece: PieceType,
			allegiance: Player,
		}
	}
} = {
	[-5]: {
		0: {
			piece: 'f',
			allegiance: Player.gyoku
		},
		5: {
			piece: 'f',
			allegiance: Player.ou
		}
	},
	[-4]: {
		[-1]: {
			piece: 'e',
			allegiance: Player.gyoku
		},
		0: {
			piece: 'f',
			allegiance: Player.gyoku,
		},
		4: {
			piece: 'f',
			allegiance: Player.ou,
		},
		5: {
			piece: 'e',
			allegiance: Player.ou
		}
	},
	[-3]: {
		[-2]: {
			piece: 'o',
			allegiance: Player.gyoku
		},
		0: {
			piece: 'f',
			allegiance: Player.gyoku,
		},
		3: {
			piece: 'f',
			allegiance: Player.ou,
		},
		5: {
			piece: 'o',
			allegiance: Player.ou
		}
	},
	[-2]: {
		[-3]: {
			piece: 'g',
			allegiance: Player.gyoku
		},
		[-1]: {
			piece: 'f',
			allegiance: Player.gyoku,
		},
		3: {
			piece: 'f',
			allegiance: Player.ou,
		},
		5: {
			piece: 'g',
			allegiance: Player.ou,
		},
	},
	[-1]: {
		[-4]: {
			piece: 'k',
			allegiance: Player.gyoku
		},
		[-1]: {
			piece: 'f',
			allegiance: Player.gyoku,
		},
		2: {
			piece: 'f',
			allegiance: Player.ou,
		},
		5: {
			piece: 'k',
			allegiance: Player.ou,
		}
	},
	0: {
		[-5]: {
			piece: 'G',
			allegiance: Player.gyoku,
		},
		[-4]: {
			piece: 'H',
			allegiance: Player.gyoku,
		},
		[-3]: {
			piece: 'K',
			allegiance: Player.gyoku,
		},
		[-2]: {
			piece: 'f',
			allegiance: Player.gyoku,
		},
		2: {
			piece: 'f',
			allegiance: Player.ou,
		},
		3: {
			piece: 'K',
			allegiance: Player.ou,
		},
		4: {
			piece: 'H',
			allegiance: Player.ou,
		},
		5: {
			piece: 'O',
			allegiance: Player.ou,
		}
	},
	1: {
		[-5]: {
			piece: 'k',
			allegiance: Player.gyoku
		},
		[-2]: {
			piece: 'f',
			allegiance: Player.gyoku,
		},
		1: {
			piece: 'f',
			allegiance: Player.ou,
		},
		4: {
			piece: 'k',
			allegiance: Player.ou,
		}
	},
	2: {
		[-5]: {
			piece: 'g',
			allegiance: Player.gyoku
		},
		[-3]: {
			piece: 'f',
			allegiance: Player.gyoku,
		},
		1: {
			piece: 'f',
			allegiance: Player.ou,
		},
		3: {
			piece: 'g',
			allegiance: Player.ou,
		}
	},
	3: {
		[-5]: {
			piece: 'o',
			allegiance: Player.gyoku
		},
		[-3]: {
			piece: 'f',
			allegiance: Player.gyoku,
		},
		0: {
			piece: 'f',
			allegiance: Player.ou,
		},
		2: {
			piece: 'o',
			allegiance: Player.ou
		}
	},
	4: {
		[-5]: {
			piece: 'e',
			allegiance: Player.gyoku
		},
		[-4]: {
			piece: 'f',
			allegiance: Player.gyoku,
		},
		0: {
			piece: 'f',
			allegiance: Player.ou,
		},
		1: {
			piece: 'e',
			allegiance: Player.ou,
		}
	},
	5: {
		[-5]: {
			piece: 'f',
			allegiance: Player.gyoku,
		},
		0: {
			piece: 'f',
			allegiance: Player.ou,
		}
	}
}

export default initial;