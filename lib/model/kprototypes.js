/**
 * k-prototypes model
 */
export default class KPrototypes {
	// https://citeseerx.ist.psu.edu/viewdoc/download?doi=10.1.1.15.4028&rep=rep1&type=pdf
	/**
	 * @param {number} gamma Weight for categorical data
	 * @param {boolean[]} categoryPositions Category column position
	 */
	constructor(gamma, categoryPositions) {
		this._modes = []
		this._iscat = categoryPositions
		this._gamma = gamma
		this._categories = null
	}

	/**
	 * Number of clusters.
	 *
	 * @type {number}
	 */
	get size() {
		return this._modes.length
	}

	/**
	 * Add a new cluster.
	 *
	 * @param {Array<Array<*>>} datas Training data
	 */
	add(datas) {
		if (!this._categories) {
			this._categories = []
			for (let i = 0; i < datas[0].length; i++) {
				if (this._iscat[i]) {
					this._categories[i] = [...new Set(datas.map(v => v[i]))]
				}
			}
		}
		const mode = []
		for (let i = 0; i < datas[0].length; i++) {
			if (this._iscat[i]) {
				const r = Array(this._categories[i].length)
				let s = 0
				for (let k = 0; k < r.length; k++) {
					r[k] = Math.random()
					s += r[k]
				}
				mode[i] = r.map(v => v / s)
			} else {
				mode[i] = datas[Math.floor(Math.random() * datas.length)][i]
			}
		}
		this._modes.push(mode)
	}

	/**
	 * Clear all clusters.
	 */
	clear() {
		this._modes = []
	}

	/**
	 * Returns predicted categories.
	 *
	 * @param {Array<Array<*>>} datas Sample data
	 * @returns {number[]} Predicted values
	 */
	predict(datas) {
		if (this._modes.length === 0) {
			throw new Error('Call fit before predict.')
		}
		return datas.map(value => {
			let min_d = Infinity
			let min_k = -1
			for (let k = 0; k < this._modes.length; k++) {
				let dist = 0
				for (let d = 0; d < value.length; d++) {
					if (this._iscat[d]) {
						for (let p = 0; p < this._modes[k][d].length; p++) {
							if (this._categories[d][p] === value[d]) {
								dist += this._gamma * (this._modes[k][d][p] - 1) ** 2
							} else {
								dist += this._gamma * this._modes[k][d][p] ** 2
							}
						}
					} else {
						dist += (this._modes[k][d] - value[d]) ** 2
					}
				}
				if (dist < min_d) {
					min_d = dist
					min_k = k
				}
			}
			return min_k
		})
	}

	/**
	 * Fit model and returns total distance the modes has moved.
	 *
	 * @param {Array<Array<*>>} datas Training data
	 * @returns {number} Total distance the modes has moved
	 */
	fit(datas) {
		if (this._modes.length === 0 || datas.length === 0) {
			return 0
		}
		const pred = this.predict(datas)
		let diff = 0
		for (let k = 0; k < this._modes.length; k++) {
			const newMode = []
			for (let d = 0; d < this._modes[k].length; d++) {
				if (this._iscat[d]) {
					newMode[d] = Array(this._modes[k][d].length).fill(0)
					let c = 0
					for (let i = 0; i < pred.length; i++) {
						if (pred[i] !== k) {
							continue
						}
						newMode[d][this._categories[d].indexOf(datas[i][d])]++
						c++
					}
					newMode[d] = newMode[d].map(v => (v === 0 ? 0 : v / c))

					diff +=
						this._gamma * Math.sqrt(this._modes[k][d].reduce((s, v, i) => s + (v - newMode[d][i]) ** 2, 0))
				} else {
					let m = 0
					let c = 0
					for (let i = 0; i < pred.length; i++) {
						if (pred[i] !== k) {
							continue
						}
						m += datas[i][d]
						c++
					}
					newMode[d] = m / c

					diff += Math.abs(this._modes[k][d] - newMode[d])
				}
			}
			this._modes[k] = newMode
		}
		return diff
	}
}
