import { Coord, Player } from "./types";

function arrayEq (a0:any, a1:any): boolean {
	if (!(a0 instanceof Array && a1 instanceof Array))
		return false;
	if (a0.length !== a1.length)
		return false;

	for (let i in a0) {
		if (a0[i] !== a1[i])
			return false;
	}

	return true;
}

function asArray<T> (arg:T|T[]):T[] {
	if (Array.isArray(arg))
		return arg;
	else
		return [arg];
}

function mutate<T extends {},S>(
	o: T,
	f: (k:keyof T, v:T[keyof T]) => S,
	filter?:(arg:[keyof T, S]) => boolean,
	): { [key in keyof T]: S } {
	if (filter === undefined)
		filter = () => true;
	return Object.fromEntries(Object.entries(o).map(([k,v]) => [k,f(k,v)] as [keyof T, S]).filter(filter)) as { [key in keyof T]: S }
}

class Enum {
	static values<T> (e:{[keys:string]:string|T}): T[] {
		return Object
			.values(e).filter((i):i is T =>
				!Object.keys(e).includes(i as string))
	}
}

function jin (turn:Player, q:number, r:number) {
	const {max, abs} = Math;
	let sign = turn * -2 + 1;
	return (max(abs(q),abs(r),abs(q+r)) >= 3 && -(q+r) * sign >= 0 && r * sign <= 0)
}

type DeepWritable<O> =
	O extends {}?
		{ -readonly [key in keyof O]: DeepWritable<O[key]>}:
	O extends Array<infer E>
		| ReadonlyArray<infer E>?
			Array<DeepWritable<E>>:
	O extends ReadonlyMap<infer K, infer V>
		| Map<infer K, infer V>?
			Map<K, DeepWritable<V>>:
	O extends ReadonlySet<infer E> |
		Set<infer E>?
		Set<DeepWritable<E>>:
	O;

type DeepReadonly<O> =
	O extends {}?
		{ readonly [key in keyof O]: DeepReadonly<O[key]>}:
	O extends Array<infer E>?
			ReadonlyArray<DeepReadonly<E>>:
	O extends Map<infer K, infer V>?
			ReadonlyMap<K, DeepReadonly<V>>:
	O extends Set<infer E>?
		ReadonlySet<DeepReadonly<E>>:
	O;

function deepCopy<O> (o:O): DeepWritable<O> {
	if (Array.isArray(o))
		return o.map(deepCopy) as DeepWritable<O>;
	else if (o && typeof o === 'object')
		return mutate(o, (_, v) => deepCopy(v)) as DeepWritable<O>;
	else 
		return o as DeepWritable<O>;
}

export { mutate, arrayEq, asArray, deepCopy, Enum, jin };
export type { DeepReadonly, DeepWritable, };