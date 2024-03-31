/**
 * Extended Natural Neighbor
 */
export default class ENaN {
	// Extend natural neighbor: a novel classification method with self-adaptive neighborhood parameters in different stages
	// https://arxiv.org/ftp/arxiv/papers/1612/1612.02310.pdf
	/**
	 * @param {'euclid' | 'manhattan' | 'chebyshev' | 'minkowski' | function (number[], number[]): number} [metric] Metric name
	 */
	constructor(metric = 'euclid') {
		this._p = []
		this._c = []

		this._metric = metric
		if (typeof this._metric === 'function') {
			this._d = this._metric
		} else {
			switch (this._metric) {
				case 'euclid':
					this._d = (a, b) => Math.sqrt(a.reduce((s, v, i) => s + (v - b[i]) ** 2, 0))
					break
				case 'manhattan':
					this._d = (a, b) => a.reduce((s, v, i) => s + Math.abs(v - b[i]), 0)
					break
				case 'chebyshev':
					this._d = (a, b) => Math.max(...a.map((v, i) => Math.abs(v - b[i])))
					break
				case 'minkowski':
					this._dp = 2
					this._d = (a, b) =>
						Math.pow(
							a.reduce((s, v, i) => s + (v - b[i]) ** this._dp, 0),
							1 / this._dp
						)
					break
			}
		}
	}

	/**
	 * Add datas.
	 *
	 * @param {Array<Array<number>>} datas Training data
	 * @param {*[]} targets Target values
	 */
	fit(datas, targets) {
		this._x = datas
		this._c = targets
		this._classes = [...new Set(this._c)]

		this._nears = []
		this._n = Array(this._classes.length).fill(0)
		for (let i = 0; i < this._x.length; i++) {
			const ps = this._x.map((p, k) => ({ d: this._d(this._x[i], p), idx: k }))
			ps.sort((a, b) => a.d - b.d)
			this._nears[i] = ps
			this._n[this._classes.indexOf(this._c[i])]++
		}

		this._k = 2
		for (let k = 2; k < this._x.length; k++) {
			let all_exist_nn = true
			for (let i = 0; i < this._nears.length && all_exist_nn; i++) {
				let exist_nn = false
				for (let s = 1; s < k && !exist_nn; s++) {
					const j = this._nears[i][s].idx
					for (let t = 1; t < k && !exist_nn; t++) {
						exist_nn = this._nears[j][t].idx === i
					}
				}
				all_exist_nn &&= exist_nn
			}
			if (all_exist_nn) {
				this._k = k
				break
			}
		}

		this._t = []
		for (let c = 0; c < this._classes.length; c++) {
			let t = 0
			for (let j = 0; j < this._nears.length; j++) {
				if (this._c[j] !== this._classes[c]) {
					continue
				}
				for (let k = 1; k <= this._k; k++) {
					if (this._c[this._nears[j][k].idx] === this._classes[c]) {
						t++
					}
				}
			}
			this._t[c] = t / (this._n[c] * this._k)
		}
	}

	/**
	 * Returns predicted categories.
	 *
	 * @param {Array<Array<number>>} datas Sample data
	 * @returns {*[]} Predicted values
	 */
	predict(datas) {
		const p = []
		for (let i = 0; i < datas.length; i++) {
			p[i] = this._predict(datas[i])
		}
		return p
	}

	_predict(data) {
		const ti = [{ d: 0, idx: -1 }]
		const dist = []
		for (let j = 0; j < this._x.length; j++) {
			const d = this._d(data, this._x[j])
			ti.push({ d, idx: j })
			dist[j] = d
		}
		ti.sort((a, b) => a.d - b.d)

		let maxt = -Infinity
		let maxc = -1
		for (let uc = 0; uc < this._classes.length; uc++) {
			let ki = 0
			for (let k = 1; k <= this._k; k++) {
				if (this._c[ti[k].idx] === this._classes[uc]) {
					ki++
				}
			}
			let dn = 0
			for (let j = 0; j < this._nears.length; j++) {
				if (dist[j] < this._nears[j][this._k].d) {
					dn++
				}
			}
			const theta = dn + ki - this._k * this._t[uc]
			if (maxt < theta) {
				maxt = theta
				maxc = uc
			}
		}
		return this._classes[maxc]
	}
}
