
export const locale = {
	en: {
		black: 'Black',
		white: 'White',
		victor: (v:string) => `${v} wins!`
	},
	ja: {
		black: '黒',
		white: '白',
		victor: (v:string) => `勝者: ${v}`
	}
} as const;