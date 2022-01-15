import { Matrix } from '../util/math.js'

/**
 * Maximum likelihood estimator
 */
export default class MaximumLikelihoodEstimator {
	// https://home.hiroshima-u.ac.jp/tkurita/lecture/prnn/node7.html
	/**
	 * @param {'normal'} distribution
	 */
	constructor(distribution = 'normal') {
		this._distribution = distribution
	}

	/**
	 * Fit model.
	 *
	 * @param {Array<Array<number>>} x
	 */
	fit(x) {
		x = Matrix.fromArray(x)
		if (this._distribution === 'normal') {
			this._m = x.mean(0)
			this._s = x.cov()
		}
	}

	/**
	 * Returns probability of the data.
	 *
	 * @param {Array<Array<number>>} x
	 * @returns {number[]}
	 */
	probability(x) {
		x = Matrix.fromArray(x)
		if (this._distribution === 'normal') {
			const d = Math.sqrt((2 * Math.PI) ** x.cols * this._s.det())
			x.sub(this._m)
			const v = x.dot(this._s.inv())
			v.mult(x)
			const s = v.sum(1)
			s.map(v => Math.exp(-v / 2) / d)
			return s.value
		}
	}

	/**
	 * Returns probability of the data.
	 *
	 * @param {Array<Array<number>>} x
	 * @returns {number[]}
	 */
	predict(x) {
		return this.probability(x)
	}
}
