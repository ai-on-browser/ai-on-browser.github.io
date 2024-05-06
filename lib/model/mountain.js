import Matrix from '../util/matrix.js'

/**
 * Mountain method
 */
export default class Mountain {
	// Approximate Clustering Via the Mountain Method
	// https://www.uni-konstanz.de/bioml/bioml2/publications/Papers2005/BeWP05_ng_fss/smcMoutainClustering.pdf
	/**
	 * @param {number} r Resolution of grid
	 * @param {number} alpha Tuning parameter
	 * @param {number} beta Tuning parameter
	 */
	constructor(r, alpha, beta) {
		this._resolution = r
		this._alpha = alpha
		this._beta = beta
		this._centroids = []
	}

	_distance(a, b) {
		return Math.sqrt(a.reduce((s, v, i) => s + (v - b[i]) ** 2, 0))
	}

	_max(arr) {
		let max = -Infinity
		let idx = -1
		for (let i = 0; i < arr.length; i++) {
			if (arr[i] > max) {
				max = arr[i]
				idx = i
			}
		}
		return [max, idx]
	}

	/**
	 * Initialize model.
	 * @param {Array<Array<number>>} datas Training data
	 */
	init(datas) {
		this._x = datas
		const n = datas.length
		const s = datas[0].length

		const x = Matrix.fromArray(datas)
		const min = x.min(0)
		const max = x.max(0)
		const pad = Matrix.sub(max, min)
		pad.div(this._resolution * 2)
		min.sub(pad)
		max.add(pad)

		this._grid = []
		const p = Array(s).fill(0)
		do {
			this._grid.push(
				p.map((v, i) => (v / (this._resolution - 1)) * (max.at(0, i) - min.at(0, i)) + min.at(0, i))
			)
			for (let i = 0; i < s; i++) {
				p[i]++
				if (p[i] < this._resolution) {
					break
				}
				p[i] = 0
			}
		} while (p.reduce((s, v) => s + v, 0) > 0)

		this._m = []
		for (let i = 0; i < this._grid.length; i++) {
			let mv = 0
			for (let j = 0; j < n; j++) {
				mv += Math.exp(-this._alpha * this._distance(this._x[j], this._grid[i]))
			}
			this._m[i] = mv
		}

		this._centroids = []
		this._mh = 0
	}

	/**
	 * Fit model.
	 */
	fit() {
		if (this._centroids.length > 0) {
			const nh = this._centroids[this._centroids.length - 1]
			for (let i = 0; i < this._m.length; i++) {
				this._m[i] -= this._mh * Math.exp(-this._beta * this._distance(nh, this._grid[i]))
				this._m[i] = Math.max(0, this._m[i])
			}
		}
		const [mh, idx] = this._max(this._m)
		this._mh = mh
		this._centroids.push(this._grid[idx])
	}

	/**
	 * Returns predicted categories.
	 * @param {Array<Array<number>>} data Sample data
	 * @returns {number[]} Predicted values
	 */
	predict(data) {
		return data.map(v => {
			let min_d = Infinity
			let min_i = -1
			for (let i = 0; i < this._centroids.length; i++) {
				const d = this._distance(v, this._centroids[i])
				if (d < min_d) {
					min_d = d
					min_i = i
				}
			}
			return min_i
		})
	}
}
