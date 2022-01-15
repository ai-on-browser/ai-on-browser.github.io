import { Matrix } from '../util/math.js'

/**
 * Mahalanobis Taguchi method
 */
export default class MT {
	constructor() {
		this._Ri = null
		this._mean = null
		this._std = null
	}

	/**
	 * Fit model.
	 *
	 * @param {Array<Array<number>>} data
	 */
	fit(data) {
		const n = data.length
		if (n === 0) {
			return
		}
		const x = Matrix.fromArray(data)
		this._mean = x.mean(0)
		x.sub(this._mean)
		this._std = x.std(0)
		x.div(this._std)

		const R = x.cov()
		this._Ri = R.inv()
	}

	/**
	 * Returns anomaly degrees.
	 *
	 * @param {Array<Array<number>>} data
	 * @returns {number[]}
	 */
	predict(data) {
		const outliers = []
		for (let i = 0; i < data.length; i++) {
			let d = 0
			const x = []
			for (let j = 0; j < data[i].length; j++) {
				x[j] = (data[i][j] - this._mean.value[j]) / this._std.value[j]
			}
			for (let j = 0; j < x.length; j++) {
				for (let k = 0; k < x.length; k++) {
					d += x[k] * this._Ri.at(k, j) * x[j]
				}
			}
			outliers.push(d / 2)
		}
		return outliers
	}
}
