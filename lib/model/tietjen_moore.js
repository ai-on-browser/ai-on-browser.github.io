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
		const d = x[0].length
		if (this._mode === 'both') {
			const mean = Array(d).fill(0)
			for (let j = 0; j < d; j++) {
				for (let i = 0; i < n; i++) {
					mean[j] += x[i][j]
				}
				mean[j] /= n
			}
			const z = []
			for (let i = 0; i < n; i++) {
				z[i] = [-Infinity, i]
				for (let j = 0; j < d; j++) {
					const v = Math.abs(x[i][j] - mean[j])
					z[i][0] = Math.max(v, z[i][0])
				}
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
	 * @param {Array<Array<number>>} data Training data
	 * @returns {boolean[]} Predicted values
	 */
	predict(data) {
		const n = data.length
		const d = data[0].length
		const [e, oi] = this._test_static(data)

		const t = Array.from({ length: 10000 }, () => [])
		for (let j = 0; j < d; j++) {
			let v = 0
			let v2 = 0
			for (let i = 0; i < n; i++) {
				v += data[i][j]
				v2 += data[i][j] ** 2
			}
			const vars = v2 / n - (v / n) ** 2
			for (let i = 0; i < t.length; i++) {
				t[i][j] = normal_random() * vars
			}
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
