import Matrix from '../util/matrix.js'

/**
 * Tietjen-Moore Test
 */
export default class TietjenMoore {
	// https://www.itl.nist.gov/div898/handbook/eda/section3/eda35h2.htm
	/**
	 * @param {number} k Number of outliers
	 * @param {number} threshold Threshold
	 */
	constructor(k, threshold) {
		this._k = k
		this._threshold = threshold
		this._mode = 'both'
	}

	_test_static(x) {
		x = x.copy()
		if (this._mode === 'both') {
			x.sub(x.mean(0))
			x.abs()
			const z = x.max(1).value.map((v, i) => [v, i])
			z.sort((a, b) => b[0] - a[0])

			let zmean = 0,
				zkmean = 0
			for (let i = 0; i < z.length; i++) {
				zmean += z[i][0]
				if (i >= this._k) {
					zkmean += z[i][0]
				}
			}
			zmean /= z.length
			zkmean /= z.length - this._k

			let zvar = 0,
				zkvar = 0
			for (let i = 0; i < z.length; i++) {
				zvar += (z[i][0] - zmean) ** 2
				if (i >= this._k) {
					zkvar += (z[i][0] - zkmean) ** 2
				}
			}
			return [zkvar / zvar, z.slice(0, this._k).map(v => v[1])]
		}
	}

	/**
	 * Returns a list of the data predicted as outliers or not.
	 *
	 * @param {Array<Array<number>>} data Training data
	 * @returns {boolean[]} Predicted values
	 */
	predict(data) {
		const x = Matrix.fromArray(data)
		const [e, oi] = this._test_static(x)

		const t = Matrix.randn(10000, x.cols)
		t.mult(x.variance(0))
		const [et] = this._test_static(t)

		const outliers = Array(x.rows).fill(false)
		if (e < this._threshold) {
			for (let i = 0; i < oi.length; i++) {
				outliers[oi[i]] = true
			}
		}
		return outliers
	}
}
