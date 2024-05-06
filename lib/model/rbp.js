/**
 * Randomized Budget Perceptron
 */
export default class RBP {
	// Tracking the Best Hyperplane with a Simple Budget Perceptron
	// https://citeseerx.ist.psu.edu/viewdoc/download?doi=10.1.1.107.6201&rep=rep1&type=pdf
	/**
	 * @param {number} b Number of support vectors
	 */
	constructor(b) {
		this._b = b

		this._w = null
		this._c = 0
		this._s = []
	}

	/**
	 * Fit model parameters.
	 * @param {Array<Array<number>>} x Training data
	 * @param {Array<1 | -1>} y Target values
	 */
	fit(x, y) {
		if (!this._w) {
			this._w = Array(x[0].length).fill(0)
		}
		for (let i = 0; i < x.length; i++) {
			const pt = x[i].reduce((s, v, j) => s + v * this._w[j], this._c)
			const yh = pt <= 0 ? -1 : 1
			if (y[i] !== yh) {
				for (let j = 0; j < x[i].length; j++) {
					this._w[j] += y[i] * x[i][j]
				}
				this._c += y[i]
				if (this._s.length >= this._b) {
					const idx = Math.floor(Math.random() * this._s.length)
					const r = this._s[idx]
					for (let j = 0; j < r.x.length; j++) {
						this._w[j] -= r.y * r.x[j]
					}
					this._c -= r.y
					this._s.splice(idx, 1)
				}
				this._s.push({ x: x[i], y: y[i] })
			}
		}
	}

	/**
	 * Returns predicted values.
	 * @param {Array<Array<number>>} data Sample data
	 * @returns {(1 | -1)[]} Predicted values
	 */
	predict(data) {
		const p = []
		for (let i = 0; i < data.length; i++) {
			const m = data[i].reduce((s, v, j) => s + v * this._w[j], this._c)
			p.push(m <= 0 ? -1 : 1)
		}
		return p
	}
}
