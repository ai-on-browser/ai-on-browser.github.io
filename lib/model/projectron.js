/**
 * Projectron
 */
export class Projectron {
	// Online Learning: A Comprehensive Survey
	// https://arxiv.org/abs/1802.02871
	// Bounded kernel-based online learning
	// https://francesco.orabona.com/papers/09jmlr.pdf
	// https://github.com/LIBOL/KOL
	/**
	 * @param {number} [eta=0] Threshold
	 * @param {'gaussian' | 'polynomial' | function (number[], number[]): number} [kernel=gaussian] Kernel name
	 */
	constructor(eta = 0, kernel = 'gaussian') {
		this._eta = eta
		if (typeof kernel === 'function') {
			this._kernel = kernel
		} else {
			switch (kernel) {
				case 'gaussian':
					this._s = 1
					this._kernel = (a, b) =>
						Math.exp(-(a.reduce((s, v, i) => s + (v - b[i]) ** 2, 0) ** 2) / this._s ** 2)
					break
				case 'polynomial':
					this._d = 2
					this._kernel = (a, b) => (1 + a.reduce((s, v, i) => s + v * b[i])) ** this._d
					break
			}
		}
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

		this._S = []
		this._a = []
		this._kinv = []
	}

	/**
	 * Fit model parameters.
	 */
	fit() {
		for (let t = 0; t < this._x.length; t++) {
			const kv = []
			for (let k = 0; k < this._S.length; k++) {
				const j = this._S[k]
				kv[k] = this._kernel(this._x[t], this._x[j])
			}
			let s = 0
			for (let k = 0; k < this._S.length; k++) {
				s += this._a[k] * kv[k]
			}
			const yh = s < 0 ? -1 : 1
			if (yh * this._y[t] <= 0) {
				const dstar = []
				for (let k = 0; k < this._kinv.length; k++) {
					dstar[k] = 0
					for (let j = 0; j < this._kinv[k].length; j++) {
						dstar[k] += this._kinv[k][j] * kv[j]
					}
				}
				let d2 = this._kernel(this._x[t], this._x[t])
				for (let k = 0; k < dstar.length; k++) {
					d2 -= kv[k] * dstar[k]
				}

				if (d2 <= this._eta ** 2) {
					for (let k = 0; k < dstar.length; k++) {
						this._a[k] += this._y[t] * dstar[k]
					}
				} else {
					this._S.push(t)
					this._a.push(this._y[t])
					const kinv = []
					for (let i = 0; i < dstar.length + 1; i++) {
						kinv[i] = []
						for (let j = 0; j < dstar.length + 1; j++) {
							if (i < this._kinv.length && j < this._kinv[i].length) {
								kinv[i][j] = this._kinv[i][j] + (dstar[i] * dstar[j]) / d2
							} else if (i < this._kinv.length) {
								kinv[i][j] = -dstar[i] / d2
							} else if (j < this._kinv.length) {
								kinv[i][j] = -dstar[j] / d2
							} else {
								kinv[i][j] = 1 / d2
							}
						}
					}
					this._kinv = kinv
				}
			}
		}
	}

	/**
	 * Returns predicted values.
	 *
	 * @param {Array<Array<number>>} data Sample data
	 * @returns {(1 | -1)[]} Predicted values
	 */
	predict(data) {
		const pred = []
		for (let t = 0; t < data.length; t++) {
			const kv = []
			for (let k = 0; k < this._S.length; k++) {
				const j = this._S[k]
				kv[k] = this._kernel(data[t], this._x[j])
			}
			let s = 0
			for (let k = 0; k < this._S.length; k++) {
				s += this._a[k] * kv[k]
			}
			pred[t] = s < 0 ? -1 : 1
		}
		return pred
	}
}

/**
 * Projectron++
 */
export class Projectronpp {
	// Online Learning: A Comprehensive Survey
	// https://arxiv.org/abs/1802.02871
	// Bounded kernel-based online learning
	// https://francesco.orabona.com/papers/09jmlr.pdf
	// https://github.com/LIBOL/KOL
	/**
	 * @param {number} [eta=0] Threshold
	 * @param {'gaussian' | 'polynomial' | function (number[], number[]): number} [kernel=gaussian] Kernel name
	 */
	constructor(eta = 0, kernel = 'gaussian') {
		this._eta = eta
		if (typeof kernel === 'function') {
			this._kernel = kernel
		} else {
			switch (kernel) {
				case 'gaussian':
					this._s = 1
					this._kernel = (a, b) =>
						Math.exp(-(a.reduce((s, v, i) => s + (v - b[i]) ** 2, 0) ** 2) / this._s ** 2)
					break
				case 'polynomial':
					this._d = 2
					this._kernel = (a, b) => (1 + a.reduce((s, v, i) => s + v * b[i])) ** this._d
					break
			}
		}
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

		this._S = []
		this._a = []
		this._kinv = []
	}

	/**
	 * Fit model parameters.
	 */
	fit() {
		for (let t = 0; t < this._x.length; t++) {
			const kv = []
			for (let k = 0; k < this._S.length; k++) {
				const j = this._S[k]
				kv[k] = this._kernel(this._x[t], this._x[j])
			}
			let s = 0
			for (let k = 0; k < this._S.length; k++) {
				s += this._a[k] * kv[k]
			}
			const yh = s < 0 ? -1 : 1

			const dstar = []
			for (let k = 0; k < this._kinv.length; k++) {
				dstar[k] = 0
				for (let j = 0; j < this._kinv[k].length; j++) {
					dstar[k] += this._kinv[k][j] * kv[j]
				}
			}
			let d2 = this._kernel(this._x[t], this._x[t])
			for (let k = 0; k < dstar.length; k++) {
				d2 -= kv[k] * dstar[k]
			}

			if (yh * this._y[t] <= 0) {
				if (d2 <= this._eta ** 2) {
					for (let k = 0; k < dstar.length; k++) {
						this._a[k] += this._y[t] * dstar[k]
					}
				} else {
					this._S.push(t)
					this._a.push(this._y[t])
					const kinv = []
					for (let i = 0; i < dstar.length + 1; i++) {
						kinv[i] = []
						for (let j = 0; j < dstar.length + 1; j++) {
							if (i < this._kinv.length && j < this._kinv[i].length) {
								kinv[i][j] = this._kinv[i][j] + (dstar[i] * dstar[j]) / d2
							} else if (i < this._kinv.length) {
								kinv[i][j] = -dstar[i] / d2
							} else if (j < this._kinv.length) {
								kinv[i][j] = -dstar[j] / d2
							} else {
								kinv[i][j] = 1 / d2
							}
						}
					}
					this._kinv = kinv
				}
			} else if (this._y[t] * s <= 1) {
				const loss = Math.max(0, 1 - s * this._y[t])
				if (loss >= Math.sqrt(d2) / this._eta) {
					let pk2 = 0
					for (let k = 0; k < dstar.length; k++) {
						pk2 += kv[k] * dstar[k]
					}
					const tau = Math.min(loss / pk2, (2 * (loss - Math.sqrt(d2) / this._eta)) / pk2, 1)
					for (let k = 0; k < dstar.length; k++) {
						this._a[k] += this._y[t] * tau * dstar[k]
					}
				}
			}
		}
	}

	/**
	 * Returns predicted values.
	 *
	 * @param {Array<Array<number>>} data Sample data
	 * @returns {(1 | -1)[]} Predicted values
	 */
	predict(data) {
		const pred = []
		for (let t = 0; t < data.length; t++) {
			const kv = []
			for (let k = 0; k < this._S.length; k++) {
				const j = this._S[k]
				kv[k] = this._kernel(data[t], this._x[j])
			}
			let s = 0
			for (let k = 0; k < this._S.length; k++) {
				s += this._a[k] * kv[k]
			}
			pred[t] = s < 0 ? -1 : 1
		}
		return pred
	}
}
