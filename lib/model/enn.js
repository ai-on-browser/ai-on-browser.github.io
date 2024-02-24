/**
 * Extended Nearest Neighbor
 */
export default class ENN {
	// https://www.ele.uri.edu/faculty/he/PDFfiles/ENN_lecturenotes.pdf
	// Enn: Extended Nearest Neighbor Method for Pattern Recognition
	// http://citeseerx.ist.psu.edu/viewdoc/download?doi=10.1.1.722.3087&rep=rep1&type=pdf
	/**
	 * @param {0 | 1 | 2} [version=1] Version
	 * @param {number} [k=5] Number of neighborhoods
	 * @param {'euclid' | 'manhattan' | 'chebyshev' | 'minkowski' | function (number[], number[]): number} [metric=euclid] Metric name
	 */
	constructor(version = 1, k = 5, metric = 'euclid') {
		this._k = k
		this._v = version

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

		if (this._v >= 1) {
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
			if (this._v === 0) {
				p[i] = this._predict0(datas[i])
			} else if (this._v === 1) {
				p[i] = this._predict1(datas[i])
			} else if (this._v === 2) {
				p[i] = this._predict2(datas[i])
			}
		}
		return p
	}

	_predict0(data) {
		const tn = []
		const ti = [{ d: 0, idx: -1 }]
		for (let j = 0; j < this._x.length; j++) {
			const d = this._d(data, this._x[j])
			ti.push({ d, idx: j })
			tn[j] = []
			let isPushed = false
			for (let k = 0; k < this._nears[j].length; k++) {
				if (!isPushed && d < this._nears[j][k].d) {
					tn[j].push({ d, idx: -1 })
					isPushed = true
				}
				tn[j].push(this._nears[j][k])
			}
		}
		ti.sort((a, b) => a.d - b.d)
		tn.push(ti)

		let maxc = -1
		let maxt = 0
		for (let uc = 0; uc < this._classes.length; uc++) {
			let theta = 0
			for (let c = 0; c < this._classes.length; c++) {
				let t = 0
				for (let j = 0; j < tn.length; j++) {
					if (j < this._c.length) {
						if (this._c[j] !== this._classes[c]) {
							continue
						}
					} else if (uc !== c) {
						continue
					}
					for (let k = 1; k <= this._k; k++) {
						if (tn[j][k].idx < 0) {
							if (uc === c) {
								t++
							}
						} else if (this._c[tn[j][k].idx] === this._classes[c]) {
							t++
						}
					}
				}
				const n = this._n[c] + (uc === c ? 1 : 0)
				theta += t / (n * this._k)
			}
			if (maxt < theta) {
				maxt = theta
				maxc = uc
			}
		}
		return this._classes[maxc]
	}

	_predict1(data) {
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
			let theta = 0
			for (let c = 0; c < this._classes.length; c++) {
				let ki = 0
				for (let k = 1; k <= this._k; k++) {
					if (this._c[ti[k].idx] === this._classes[c]) {
						ki++
					}
				}
				let dn = 0
				for (let j = 0; j < this._nears.length; j++) {
					if (dist[j] < this._nears[j][this._k].d) {
						if (uc === c && this._c[this._nears[j][this._k].idx] !== this._classes[c]) {
							dn++
						} else if (uc !== c && this._c[this._nears[j][this._k].idx] === this._classes[c]) {
							dn++
						}
					}
				}
				if (uc === c) {
					theta += (dn + ki - this._k * this._t[c]) / ((this._n[c] + 1) * this._k)
				} else {
					theta -= dn / (this._n[c] * this._k)
				}
			}
			if (maxt < theta) {
				maxt = theta
				maxc = uc
			}
		}
		return this._classes[maxc]
	}

	_predict2(data) {
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
