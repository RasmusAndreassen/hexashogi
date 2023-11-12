function arraycmp (a0:any[], a1:any[]): boolean {
	if (a0.length !== a1.length)
		return false;

	for (let i in a0) {
		if (a0[i] !== a1[i])
			return false;
	}

	return true;
}

class Enum {
	static values<T> (e:{[keys:string]:string|T}): T[] {
		return Object
			.values(e).filter((i):i is T =>
				!Object.keys(e).includes(i as string))
	}
}

export {arraycmp, Enum};