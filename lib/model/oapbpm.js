/**
 * Online Aggregate Prank-Bayes Point Machine
 */
export default class OAPBPM {
	// Online Ranking/Collaborative filtering using the Perceptron Algorithm
	// https://cdn.aaai.org/ICML/2003/ICML03-035.pdf
	/**
	 * @param {number} n Number of PRank models
	 * @param {number} tau Probability to learn
	 * @param {number} [rate] Learning rate
	 */
	constructor(n, tau, rate = 0.1) {
		this._n = n
		this._tau = tau
		this._wh = null
		this._w = []
		this._a = rate

		this._bh = [0, Infinity]
		this._b = Array.from({ length: n }, () => [0, Infinity])
		this._min = 1
	}

	/**
	 * Fit model.
	 *
	 * @param {Array<Array<number>>} x Training data
	 * @param {Array<number>} y Target values
	 */
	fit(x, y) {
		if (!this._wh) {
			for (let i = 0; i < this._n; i++) {
				this._w[i] = Array(x[0].length).fill(0)
			}
		}

		for (let k = 0; k < x.length; k++) {
			if (y[k] < this._min) {
				for (let j = 0; j < this._b.length; j++) {
					this._b[j].splice(0, 0, ...Array(this._min - y[k]).fill(this._b[j][0]))
				}
				this._min = y[k]
			} else if (y[k] >= this._min + this._b[0].length) {
				for (let j = 0; j < this._b.length; j++) {
					this._b[j].splice(
						this._b[j].length - 1,
						0,
						...Array(y[k] - (this._min + this._b[j].length) + 1).fill(this._b[j][this._b[j].length - 2])
					)
				}
			}

			for (let j = 0; j < this._n; j++) {
				const p = this._w[j].reduce((s, v, i) => s + v * x[k][i], 0)
				let r = 0
				for (; r < this._b[j].length; r++) {
					if (p - this._b[j][r] < 0) break
				}
				const yh = r + this._min
				if (Math.random() < this._tau && y[k] !== yh) {
					let t = 0
					for (let i = 0; i < this._b[j].length - 1; i++) {
						const yt = y[k] <= i + this._min ? -1 : 1
						if ((p - this._b[j][i]) * yt <= 0) {
							t += yt
							this._b[j][i] -= this._a * yt
						}
					}
					for (let m = 0; m < this._w[j].length; m++) {
						this._w[j][m] += this._a * t * x[k][m]
					}
				}
			}
		}
		this._wh = Array(this._w[0].length).fill(0)
		this._bh = Array(this._b[0].length).fill(0)
		for (let j = 0; j < this._n; j++) {
			for (let m = 0; m < this._wh.length; m++) {
				this._wh[m] += this._w[j][m] / this._n
			}
			for (let i = 0; i < this._bh.length; i++) {
				this._bh[i] += this._b[j][i] / this._n
			}
		}
	}

	/**
	 * Returns predicted values.
	 *
	 * @param {Array<Array<number>>} x Sample data
	 * @returns {Array<number>} Predicted values
	 */
	predict(x) {
		const p = []
		for (let k = 0; k < x.length; k++) {
			const v = this._wh.reduce((s, v, i) => s + v * x[k][i], 0)
			let r = 0
			for (; r < this._bh.length; r++) {
				if (v - this._bh[r] < 0) break
			}
			p[k] = r + this._min
		}
		return p
	}
}
