import Matrix from '../util/matrix.js'

/**
 * Linde-Buzo-Gray algorithm
 */
export default class LBG {
	// http://www.spcom.ecei.tohoku.ac.jp/~aito/patternrec/slides3.pdf
	// https://seesaawiki.jp/a-i/d/Linde-Buzo-Gray%20algorithm
	constructor() {
		this._centroids = []
	}

	/**
	 * Centroids
	 * @type {Array<Array<number>>}
	 */
	get centroids() {
		return this._centroids
	}

	/**
	 * Number of clusters.
	 * @type {number}
	 */
	get size() {
		return this._centroids.length
	}

	_distance(a, b) {
		return Math.sqrt(a.reduce((acc, v, i) => acc + (v - b[i]) ** 2, 0))
	}

	/**
	 * Clear all clusters.
	 */
	clear() {
		this._centroids = []
	}

	/**
	 * Fit model.
	 * @param {Array<Array<number>>} datas Training data
	 */
	fit(datas) {
		const x = Matrix.fromArray(datas)
		if (this._centroids.length === 0) {
			this._centroids = x.mean(0).toArray()
			return
		}

		const new_centroids = []
		const e = Matrix.div(Matrix.sub(x.max(0), x.min()), 100).value
		for (const c of this._centroids) {
			const cp = c.concat()
			const cn = c.concat()
			for (let i = 0; i < e.length; i++) {
				cp[i] += e[i]
				cn[i] -= e[i]
			}
			new_centroids.push(cp, cn)
		}

		this._centroids = new_centroids
		let d = 0
		do {
			const p = this.predict(datas)

			const size = this._centroids.length
			const c = this._centroids.map(p => Array.from(p, () => 0))
			const count = Array(size).fill(0)
			const n = datas.length
			for (let i = 0; i < n; i++) {
				for (let j = 0; j < datas[i].length; j++) {
					c[p[i]][j] += datas[i][j]
				}
				count[p[i]]++
			}
			d = 0
			for (let k = 0; k < size; k++) {
				const mc = c[k].map(v => v / count[k])
				d += this._centroids[k].reduce((s, v, j) => s + (v - mc[j]) ** 2, 0)
				this._centroids[k] = c[k].map(v => v / count[k])
			}
		} while (d > 0)
	}

	/**
	 * Returns predicted categories.
	 * @param {Array<Array<number>>} datas Sample data
	 * @returns {number[]} Predicted values
	 */
	predict(datas) {
		if (this._centroids.length === 0) {
			throw new Error('Call fit before predict.')
		}
		return datas.map(value => {
			let mind = Infinity
			let mini = -1
			for (let i = 0; i < this._centroids.length; i++) {
				const d = this._distance(value, this._centroids[i])
				if (d < mind) {
					mind = d
					mini = i
				}
			}
			return mini
		})
	}
}
