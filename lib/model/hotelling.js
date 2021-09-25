import { Matrix } from '../util/math.js'

/**
 * Hotelling T-square Method
 */
export default class Hotelling {
	// https://qiita.com/MasafumiTsuyuki/items/2677576849abf633e412
	// https://en.wikipedia.org/wiki/Hotelling%27s_T-squared_distribution
	/**
	 * Constructor
	 */
	constructor() {
		this._Ri = null
		this._mean = null
		this._std = null
	}

	/**
	 * Fit model.
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

		const R = x.cov(1)
		this._Ri = R.inv()
	}

	/**
	 * Returns abnormality values.
	 * @param {Array<Array<number>>} data
	 * @returns {number[]}
	 */
	predict(data) {
		const outliers = []
		for (let i = 0; i < data.length; i++) {
			let d = 0
			const x = []
			for (let j = 0; j < data[i].length; j++) {
				x[j] = data[i][j] - this._mean.value[j]
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
