/**
 * Passing-Bablok method
 */
export default class PassingBablok {
	// https://oceanone.hatenablog.com/entry/2020/04/03/031040
	constructor() {}

	/**
	 * Fit model.
	 * @param {number[]} x Training data
	 * @param {number[]} y Target values
	 */
	fit(x, y) {
		const n = x.length
		const a = []
		for (let i = 0; i < n; i++) {
			for (let j = i + 1; j < n; j++) {
				let t = Math.atan2(y[j] - y[i], x[j] - x[i])
				if (t < (-45 / 180) * Math.PI) {
					t += Math.PI
				}
				a.push(t)
			}
		}
		a.sort((a, b) => a - b)
		if (a.length % 2 === 1) {
			this._d = a[(a.length - 1) / 2]
		} else {
			this._d = (a[a.length / 2] + a[a.length / 2 - 1]) / 2
		}
		this._d = Math.tan(this._d)
		const b = []
		for (let i = 0; i < n; i++) {
			b[i] = y[i] - this._d * x[i]
		}
		b.sort((a, b) => a - b)
		if (b.length % 2 === 1) {
			this._c = b[(b.length - 1) / 2]
		} else {
			this._c = (b[b.length / 2] + b[b.length / 2 - 1]) / 2
		}
	}

	/**
	 * Returns predicted values.
	 * @param {number[]} x Sample data
	 * @returns {number[]} Predicted values
	 */
	predict(x) {
		return x.map(v => this._d * v + this._c)
	}
}
