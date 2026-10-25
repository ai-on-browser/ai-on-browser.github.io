const normal_random = (m = 0, s = 1) => {
	const std = Math.sqrt(s)
	const x = Math.random()
	const y = Math.random()
	const X = Math.sqrt(-2 * Math.log(x)) * Math.cos(2 * Math.PI * y)
	return X * std + m
}

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
		const n = x.length
		if (this._mode === 'both') {
			const mean = x.reduce((s, v) => s + v, 0) / n
			const z = []
			for (let i = 0; i < n; i++) {
				z[i] = [Math.abs(x[i] - mean), i]
			}
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
	 * @param {number[]} data Training data
	 * @returns {boolean[]} Predicted values
	 */
	predict(data) {
		const n = data.length
		const [e, oi] = this._test_static(data)

		const t = []
		let v = 0
		let v2 = 0
		for (let i = 0; i < n; i++) {
			v += data[i]
			v2 += data[i] ** 2
		}
		const vars = v2 / n - (v / n) ** 2
		for (let i = 0; i < 10000; i++) {
			t[i] = normal_random() * vars
		}
		const [_et] = this._test_static(t)

		const outliers = Array(data.length).fill(false)
		if (e < this._threshold) {
			for (let i = 0; i < oi.length; i++) {
				outliers[oi[i]] = true
			}
		}
		return outliers
	}
}
