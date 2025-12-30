const metrics = {
	euclid: () => (a, b) => Math.sqrt(a.reduce((s, v, i) => s + (v - b[i]) ** 2, 0)),
	manhattan: () => (a, b) => a.reduce((s, v, i) => s + Math.abs(v - b[i]), 0),
	chebyshev: () => (a, b) => Math.max(...a.map((v, i) => Math.abs(v - b[i]))),
	minkowski:
		({ p = 2 } = {}) =>
		(a, b) =>
			a.reduce((s, v, i) => s + (v - b[i]) ** p, 0) ** (1 / p),
}

/**
 *  Natural Neighborhood Based Classification Algorithm
 */
export default class NNBCA {
	// Natural Neighborhood-Based Classification Algorithm Without Parameter k
	// https://ieeexplore.ieee.org/stamp/stamp.jsp?arnumber=8400443
	/**
	 * @param {'euclid' | 'manhattan' | 'chebyshev' | 'minkowski' | function (number[], number[]): number} [metric] Metric name
	 */
	constructor(metric = 'euclid') {
		this._metric = metric
		if (typeof this._metric === 'function') {
			this._d = this._metric
		} else {
			this._d = metrics[this._metric]()
		}
	}

	/**
	 * Add datas.
	 * @param {Array<Array<number>>} datas Training data
	 * @param {*[]} targets Target values
	 */
	fit(datas, targets) {
		this._x = datas
		this._y = targets
		this._classes = [...new Set(targets)]

		const n = this._x.length

		this._distances = Array.from({ length: n }, () => [])
		for (let i = 0; i < n; i++) {
			this._distances[i][i] = { i, d: 0 }
			for (let j = i + 1; j < n; j++) {
				const dij = this._d(this._x[i], this._x[j])
				this._distances[i][j] = { i: j, d: dij }
				this._distances[j][i] = { i, d: dij }
			}
			this._distances[i].sort((a, b) => a.d - b.d)
		}

		this._g = Array.from({ length: n }, () => [])
		this._r = 1
		const knn = Array.from({ length: n }, () => [])
		let lastCnt = [-1, 0]
		while (true) {
			for (let i = 0; i < n; i++) {
				const nn = this._distances[i][this._r + 1].i
				knn[i].push(nn)
				if (knn[nn].includes(i) && !this._g[i][nn]) {
					this._g[i].push(nn)
					this._g[nn].push(i)
				}
			}
			const c = this._g.reduce((s, v) => s + (v.length === 0 ? 1 : 0), 0)
			if (lastCnt[0] !== c) {
				lastCnt = [c, 1]
			} else {
				lastCnt[1]++
			}

			if (c === 0 || (this._r > 2 && lastCnt[1] >= Math.sqrt(this._r - lastCnt[1]))) {
				break
			}
			this._r++
		}

		this._t = []
		for (let k = 0; k < this._classes.length; k++) {
			this._t[k] = { s: 0, c: 0 }
			const ck = this._classes[k]
			for (let i = 0; i < this._x.length; i++) {
				if (this._y[i] !== ck) {
					continue
				}
				this._t[k].c++
				if (this._g[i].length === 0) {
					continue
				}
				this._t[k].s += this._g[i].reduce((s, v) => (s + this._y[v] === ck ? 1 : 0), 0) / this._g[i].length
			}
		}
	}

	/**
	 * Returns predicted categories.
	 * @param {Array<Array<number>>} datas Sample data
	 * @returns {(* | null)[]} Predicted values
	 */
	predict(datas) {
		const p = Array(datas.length).fill(null)
		for (let i = 0; i < datas.length; i++) {
			const d = this._x.map((v, k) => ({ i: k, d: this._d(v, datas[i]) }))
			d.sort((a, b) => a.d - b.d)

			const nn = []
			for (let k = 0; k < this._r; k++) {
				if (d[k].d < this._distances[d[k].i][this._r + 1].d) {
					nn.push(d[k].i)
				}
			}
			if (nn.length === 0) {
				continue
			}

			let maxt = 0
			let maxs = -1
			for (let s = 0; s < this._classes.length; s++) {
				const ck = this._classes[s]
				let theta = 0
				for (let k = 0; k < this._classes.length; k++) {
					if (s === k) {
						const r = nn.reduce((s, v) => s + (this._y[v] === ck ? 1 : 0), 0) / nn.length
						theta += (this._t[k].s + r) / (this._t[k].c + 1)
					} else if (this._t[k].c > 0) {
						theta += this._t[k].s / this._t[k].c
					}
				}
				if (maxt < theta) {
					maxt = theta
					maxs = ck
				}
			}
			p[i] = maxs
		}
		return p
	}
}
