class L2 {
	constructor(beta = 0.5) {
		this._beta = beta
	}

	similarity(p, x) {
		return 1 / (Math.sqrt(x.reduce((s, v, i) => s + (v - p[i]) ** 2, 0)) + 1.0e-12)
	}

	update(x, prev) {
		if (!prev) {
			return x.concat()
		}
		return prev.map((v, i) => this._beta * v + (1 - this._beta) * x[i])
	}
}

/**
 * Adaptive resonance theory
 */
export default class ART {
	// https://en.wikipedia.org/wiki/Adaptive_resonance_theory
	// https://qiita.com/ground0state/items/704a24aea75eef4403ac
	/**
	 * @param {number} [t=1]
	 * @param {'l2'} [method='l2']
	 */
	constructor(t = 1, method = 'l2') {
		if (method === 'l2') {
			this._method = new L2()
		}
		this._t = t

		this._protos = []
	}

	/**
	 * Number of clusters
	 * @type {number}
	 */
	get size() {
		return this._protos.length
	}

	/**
	 * Fit model and returns predicted categories.
	 * @param {Array<Array<number>>} datas
	 */
	fit(datas) {
		const p = []
		for (let i = 0; i < datas.length; i++) {
			if (this._protos.length === 0) {
				this._protos[0] = this._method.update(datas[i], null)
				p[i] = 0
			} else {
				const sims = this._protos.map(p => this._method.similarity(p, datas[i]))
				const max = Math.max(...sims)
				if (max >= this._t) {
					const idx = sims.indexOf(max)
					this._protos[idx] = this._method.update(datas[i], this._protos[idx])
					p[i] = idx
				} else {
					p[i] = this.size
					this._protos[this.size] = this._method.update(datas[i], null)
				}
			}
		}
		return p
	}

	/**
	 * Returns predicted categories.
	 * @param {Array<Array<number>>} datas
	 * @returns {number[]}
	 */
	predict(datas) {
		const p = []
		for (let i = 0; i < datas.length; i++) {
			const sims = this._protos.map(p => this._method.similarity(p, datas[i]))
			const max = Math.max(...sims)
			if (max >= this._t) {
				const idx = sims.indexOf(max)
				p[i] = idx
			} else {
				p[i] = -1
			}
		}
		return p
	}
}
