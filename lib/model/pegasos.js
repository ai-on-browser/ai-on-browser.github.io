/**
 * Primal Estimated sub-GrAdientSOlver for SVM
 */
export default class Pegasos {
	// https://www.slideshare.net/hirsoshnakagawa3/ss-32274089
	// Pegasos: Primal Estimated sub-GrAdient SOlver for SVM
	// https://home.ttic.edu/~nati/Publications/PegasosMPB.pdf
	/**
	 * @param {number} rate Learning rate
	 * @param {number} [k] Batch size
	 */
	constructor(rate, k = 1) {
		this._r = rate
		this._k = k
		this._itr = 100
		this._do_projection = false
	}

	/**
	 * Initialize this model.
	 *
	 * @param {Array<Array<number>>} train_x Training data
	 * @param {Array<1 | -1>} train_y Target values
	 */
	init(train_x, train_y) {
		this._x = train_x
		this._y = train_y
		this._t = 0

		this._w = Array(this._x[0].length).fill(0)
		this._b = 0
	}

	/**
	 * Update model parameters with some data.
	 *
	 * @param {Array<Array<number>>} x Training data
	 * @param {Array<1 | -1>} y Target value
	 */
	update(x, y) {
		this._t++
		const eta = 1 / (this._r * this._t)
		const n = x.length

		const wt = Array(this._w.length).fill(0)
		let bt = 0
		for (let i = 0; i < n; i++) {
			const m = x[i].reduce((s, v, j) => s + v * this._w[j], 0) + this._b
			if (m < 1) {
				for (let j = 0; j < x[i].length; j++) {
					wt[j] += y[i] * x[i][j]
				}
				bt += y[i]
			}
		}
		this._w = this._w.map((v, j) => (1 - eta * this._r) * v + (eta * wt[j]) / n)
		this._b = (1 - eta * this._r) * this._b + (eta * bt) / n
		if (this._do_projection) {
			const r = 1 / (Math.sqrt(this._r) * Math.sqrt(this._w.reduce((s, v) => s + v ** v, this._b ** 2)))
			if (r < 1) {
				this._w = this._w.map(v => v * r)
				this._b *= r
			}
		}
	}

	/**
	 * Fit model parameters.
	 */
	fit() {
		const n = this._x.length
		for (let i = 0; i < this._itr; i++) {
			const x = []
			const y = []
			for (let k = 0; k < this._k; k++) {
				const r = Math.floor(Math.random() * n)
				x.push(this._x[r])
				y.push(this._y[r])
			}
			this.update(x, y)
		}
	}

	/**
	 * Returns predicted values.
	 *
	 * @param {Array<Array<number>>} data Sample data
	 * @returns {(1 | -1)[]} Predicted values
	 */
	predict(data) {
		const p = []
		for (let i = 0; i < data.length; i++) {
			const m = data[i].reduce((s, v, j) => s + v * this._w[j], 0)
			p.push(m + this._b <= 0 ? -1 : 1)
		}
		return p
	}
}
