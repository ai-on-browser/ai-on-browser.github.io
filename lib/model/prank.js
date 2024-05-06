/**
 * Perceptron ranking
 */
export default class PRank {
	// Pranking with Ranking
	// https://proceedings.neurips.cc/paper_files/paper/2001/file/5531a5834816222280f20d1ef9e95f69-Paper.pdf
	/**
	 * @param {number} [rate] Learning rate
	 */
	constructor(rate = 0.1) {
		this._w = null
		this._a = rate

		this._b = [0, Infinity]
		this._min = 1
	}

	/**
	 * Fit model.
	 * @param {Array<Array<number>>} x Training data
	 * @param {Array<number>} y Target values
	 */
	fit(x, y) {
		if (!this._w) {
			this._w = Array(x[0].length).fill(0)
		}

		for (let k = 0; k < x.length; k++) {
			if (y[k] < this._min) {
				this._b.splice(0, 0, ...Array(this._min - y[k]).fill(this._b[0]))
				this._min = y[k]
			} else if (y[k] >= this._min + this._b.length) {
				this._b.splice(
					this._b.length - 1,
					0,
					...Array(y[k] - (this._min + this._b.length) + 1).fill(this._b[this._b.length - 2])
				)
			}

			const p = this._w.reduce((s, v, i) => s + v * x[k][i], 0)
			let r = 0
			for (; r < this._b.length; r++) {
				if (p - this._b[r] < 0) break
			}
			const yh = r + this._min
			if (y[k] === yh) continue
			let t = 0
			for (let i = 0; i < this._b.length - 1; i++) {
				const yt = y[k] <= i + this._min ? -1 : 1
				if ((p - this._b[i]) * yt <= 0) {
					t += yt
					this._b[i] -= this._a * yt
				}
			}
			for (let m = 0; m < this._w.length; m++) {
				this._w[m] += this._a * t * x[k][m]
			}
		}
	}

	/**
	 * Returns predicted values.
	 * @param {Array<Array<number>>} x Sample data
	 * @returns {Array<number>} Predicted values
	 */
	predict(x) {
		const p = []
		for (let k = 0; k < x.length; k++) {
			const v = this._w.reduce((s, v, i) => s + v * x[k][i], 0)
			let r = 0
			for (; r < this._b.length; r++) {
				if (v - this._b[r] < 0) break
			}
			p[k] = r + this._min
		}
		return p
	}
}
