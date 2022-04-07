class SetKeyMap {
	constructor() {
		this._map = new Map()

		this._keymap = {}
	}

	get size() {
		return this._map.size
	}

	_getsamekey(key) {
		key = key.concat()
		key.sort()
		let keymap = this._keymap
		for (let i = 0; i < key.length - 1; i++) {
			const km = keymap[key[i]]
			if (!km) {
				return undefined
			}
			keymap = km.c
		}
		return keymap[key[key.length - 1]]?.v
	}

	clear() {
		this._keymap = {}
		return this._map.clear()
	}

	delete(key) {
		const k = this._getsamekey(key)
		if (k) {
			let keymap = this._keymap
			for (let i = 0; i < k.length; i++) {
				if (!keymap[k[i]]) {
					break
				} else if (i < k.length - 1) {
					keymap = keymap[k[i]].c
				} else {
					if (Object.keys(keymap[k[k.length - 1]].c).length === 0) {
						delete keymap[k[k.length - 1]]
					} else {
						keymap[k[k.length - 1]].v = undefined
					}
				}
			}
			return this._map.delete(k)
		}
		return false
	}

	get(key) {
		const k = this._getsamekey(key)
		if (k) {
			return this._map.get(k)
		}
	}

	has(key) {
		const k = this._getsamekey(key)
		return !!k
	}

	set(key, value) {
		let k = this._getsamekey(key)
		if (!k) {
			k = key.concat()
			k.sort()
			let keymap = this._keymap
			for (let i = 0; i < k.length - 1; i++) {
				if (!keymap[k[i]]) {
					keymap[k[i]] = {
						v: undefined,
						c: {},
					}
				}
				keymap = keymap[k[i]].c
			}
			keymap[k[k.length - 1]] = {
				v: k,
				c: keymap[k[k.length - 1]]?.c || {},
			}
		}
		this._map.set(k, value)
	}

	*[Symbol.iterator]() {
		yield* this._map
	}

	keys() {
		return this._map.keys()
	}

	values() {
		return this._map.values()
	}

	entries() {
		return this._map.entries()
	}

	forEach(callback, thisArg) {
		this._map.forEach(callback, thisArg)
	}
}

/**
 * Apriori algorithm
 */
class Apriori {
	// https://en.wikipedia.org/wiki/Apriori_algorithm
	// http://www.cs.t-kougei.ac.jp/SSys/Apriori.htm
	/**
	 * @param {number} minsup Minimum support
	 */
	constructor(minsup) {
		this._minsup = minsup
	}

	/**
	 * Returns predicted sets.
	 *
	 * @param {Array<Array<*>>} x Training data
	 * @returns {Array<SetKeyMap>} Predicted values
	 */
	predict(x) {
		const n = x.length * this._minsup
		let L1 = new SetKeyMap()
		for (let i = 0; i < x.length; i++) {
			for (const v of x[i]) {
				const lst = L1.get([v]) || new Set()
				lst.add(i)
				L1.set([v], lst)
			}
		}
		for (const key of L1.keys()) {
			if (L1.get(key).size < n) {
				L1.delete(key)
			}
		}
		const ret = [L1]
		let k = 1
		while (++k) {
			const L2 = new SetKeyMap()
			const keys = [...L1.keys()]
			for (let i = 0; i < keys.length; i++) {
				const p = keys[i]
				for (let j = i + 1; j < keys.length; j++) {
					const q = keys[j]
					let diffs = 0
					let diffItem = null
					for (let i = 0; i < p.length; i++) {
						if (p[i] !== q[i]) {
							diffItem = q[i]
							diffs++
						}
					}
					if (diffs === 1) {
						const c = [...p, diffItem]
						const s = new Set()
						const pelms = L1.get(p)
						for (let e of L1.get(q)) {
							if (pelms.has(e)) {
								s.add(e)
							}
						}
						if (s.size >= n) {
							L2.set(c, s)
						}
					}
				}
			}
			if (L2.size === 0) {
				break
			}
			L1 = L2
			ret.push(L1)
		}
		return ret
	}
}

/**
 * Association analysis
 */
export default class AssociationAnalysis {
	// https://bdm.change-jp.com/?p=1341
	/**
	 * @param {number} support Minimum support
	 */
	constructor(support) {
		this._support = support
	}

	/**
	 * Fit model.
	 *
	 * @param {Array<Array<*>>} x Training data
	 */
	fit(x) {
		this._x = x
		const apriori = new Apriori(this._support)
		this._commons = apriori.predict(this._x)
	}

	/**
	 * Returns appearing keys.
	 *
	 * @param {number} n Length of key
	 * @returns {Iterator<string[]>} Appearing keys
	 */
	items(n = 1) {
		return this._commons[n - 1]?.keys() || []
	}

	/**
	 * Returns support value.
	 *
	 * @param {...*} a Keys
	 * @returns {number} Support value
	 */
	support(...a) {
		const n = this._commons[a.length - 1].get(a)
		return (n?.size || 0) / this._x.length
	}

	/**
	 * Returns confidence value.
	 *
	 * @param {*} a Key
	 * @param {*} b Key
	 * @returns {number} Confidence value
	 */
	confidence(a, b) {
		const cc = this._commons[1].get([a, b])
		const ac = this._commons[0].get([a])
		return (cc?.size || 0) / (ac?.size || 1)
	}

	/**
	 * Returns lift value.
	 *
	 * @param {*} a Key
	 * @param {*} b Key
	 * @returns {number} Lift value
	 */
	lift(a, b) {
		return this.confidence(a, b) / this.support(b)
	}
}
