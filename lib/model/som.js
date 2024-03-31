import Matrix from '../util/matrix.js'

/**
 * Self-Organizing Map
 */
export default class SOM {
	// https://qiita.com/tohru-iwasaki/items/e51864269767ccc07254
	/**
	 * @param {number} input_size Input size
	 * @param {number} output_size Output size
	 * @param {number} [resolution] Resolution of output
	 */
	constructor(input_size, output_size, resolution = 20) {
		this.in_size = input_size
		this.out_size = output_size

		this.resolution = resolution
		this._sigma0 = 1

		this._init_method = 'PCA'

		this._epoch = 0
		this._z = []
		const z0 = Array(output_size).fill(0)
		do {
			this._z.push([].concat(z0))
			for (let i = output_size - 1; i >= 0; i--) {
				z0[i]++
				if (z0[i] < this.resolution) break
				z0[i] = 0
			}
		} while (z0.reduce((a, v) => a + v, 0) > 0)
		this._y = null
	}

	get _sigma() {
		return Math.max(this._sigma0 * (1 - this._epoch / 20), 0.2)
	}

	_z_distance(i, j) {
		let d = 0
		for (let k = 0; k < this.out_size; k++) {
			d += (this._z[i][k] - this._z[j][k]) ** 2
		}
		return d
	}

	_find_near_idx(x) {
		const n = x.length
		const dim = this.in_size
		const near_idx = []
		for (let i = 0; i < n; i++) {
			let min_d = Infinity
			let min_idx = -1
			for (let k = 0; k < this._y.length; k++) {
				let d = 0
				for (let j = 0; j < dim; j++) {
					d += (x[i][j] - this._y[k][j]) ** 2
				}
				if (d < min_d) {
					min_d = d
					min_idx = k
				}
			}
			near_idx.push(min_idx)
		}
		return near_idx
	}

	/**
	 * Fit model.
	 *
	 * @param {Array<Array<number>>} data Training data
	 */
	fit(data) {
		const x = data
		const n = x.length
		const dim = this.in_size
		if (!this._y) {
			if (this._init_method === 'random') {
				this._y = Matrix.randn(this._z.length, dim).toArray()
			} else if (this._init_method === 'PCA') {
				const x0 = new Matrix(n, dim, data)
				const xd = x0.cov()
				const [l, pca] = xd.eigen()
				const expl = new Matrix(
					1,
					l.length,
					l.map(v => Math.sqrt(v))
				)
				expl.repeat(this._z.length, 0)
				expl.mult(x0.block(0, 0, this._z.length, l.length))
				this._y = expl.dot(pca.t).toArray()
			}
		}
		const near_idx = this._find_near_idx(x)

		const r = []
		for (let i = 0; i < n; i++) {
			r[i] = []
			for (let k = 0; k < this._z.length; k++) {
				let d = this._z_distance(near_idx[i], k)
				r[i][k] = Math.exp(-d / (2 * this._sigma ** 2))
			}
		}

		for (let k = 0; k < this._y.length; k++) {
			let num = Array(dim).fill(0),
				den = 0
			for (let i = 0; i < n; i++) {
				den += r[i][k]
				for (let j = 0; j < dim; j++) {
					num[j] += r[i][k] * x[i][j]
				}
			}
			for (let j = 0; j < dim; j++) {
				this._y[k][j] = num[j] / den
			}
		}
		this._epoch++
	}

	/**
	 * Returns predicted categories.
	 *
	 * @param {Array<Array<number>>} x Sample data
	 * @returns {Array<Array<number>>} Predicted values
	 */
	predict(x) {
		const near_idx = this._find_near_idx(x)
		return near_idx.map(i => this._z[i])
	}
}
