import Matrix from '../util/matrix.js'

/**
 * Budgeted Stochastic Gradient Descent
 */
export default class BSGD {
	// Breaking the Curse of Kernelization: Budgeted Stochastic Gradient Descent for Large-Scale SVM Training
	// https://www.jmlr.org/papers/volume13/wang12b/wang12b.pdf
	/**
	 * @param {number} [b=10] Budget size
	 * @param {number} [eta=1] Learning rate
	 * @param {number} [lambda=1] Regularization parameter
	 * @param {'removal' | 'projection' | 'merging'} [maintenance=removal] Maintenance type
	 * @param {'gaussian' | 'polynomial' | function (number[], number[]): number} [kernel=gaussian] Kernel name
	 */
	constructor(b = 10, eta = 1, lambda = 1, maintenance = 'removal', kernel = 'gaussian') {
		this._b = b
		this._eta = eta
		this._lambda = lambda
		this._maintenance = maintenance
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

		this._sv = []
		this._alpha = []
	}

	/**
	 * Fit model.
	 */
	fit() {
		const phi = (1 + Math.sqrt(5)) / 2
		for (let t = 0; t < this._x.length; t++) {
			let s = 0
			for (let k = 0; k < this._sv.length; k++) {
				s += this._alpha[k] * this._kernel(this._x[t], this._sv[k])
			}
			this._alpha = this._alpha.map(a => a * (1 - this._eta * this._lambda))
			if (s * this._y[t] < 1) {
				this._alpha.push(this._eta * this._y[t])
				this._sv.push(this._x[t])
				if (this._sv.length > this._b) {
					let minv = Infinity
					let p = -1
					for (let k = 0; k < this._sv.length; k++) {
						const v = this._alpha[k] ** 2 * this._kernel(this._sv[k], this._sv[k])
						if (v < minv) {
							minv = v
							p = k
						}
					}
					if (this._maintenance === 'projection') {
						const svp = this._sv.splice(p, 1)[0]
						const ap = this._alpha.splice(p, 1)[0]
						const K = new Matrix(this._b, this._b)
						const k = new Matrix(this._b, 1)
						for (let i = 0; i < this._b; i++) {
							K.set(i, i, this._kernel(this._sv[i], this._sv[i]))
							for (let j = i; j < this._b; j++) {
								const kij = this._kernel(this._sv[i], this._sv[j])
								K.set(i, j, kij)
								K.set(j, i, kij)
							}
							k.set(i, 0, this._kernel(svp, this._sv[i]))
						}
						const norm = K.norm() / 1000
						for (let i = 0; i < this._b; i++) {
							K.addAt(i, i, norm)
						}
						const da = K.solve(k)
						for (let k = 0; k < this._b; k++) {
							this._alpha[k] += ap * da.at(k, 0)
						}
					} else if (this._maintenance === 'merging') {
						let minwd = Infinity
						let minq = 0
						let minaz = 0
						let minz = null
						for (let q = 0; q < this._sv.length; q++) {
							if (q === p) {
								continue
							}
							const m = this._alpha[p] / (this._alpha[p] + this._alpha[q])
							const fh = h =>
								m *
									this._kernel(
										this._sv[p].map(v => (1 - h) * v),
										this._sv[q].map(v => (1 - h) * v)
									) +
								(1 - m) *
									this._kernel(
										this._sv[p].map(v => h * v),
										this._sv[q].map(v => h * v)
									)
							let low = [0, fh(0)]
							let high = [1, fh(1)]
							let mid = [1 / (1 + phi), fh(1 / (1 + phi))]
							while (high[0] - low[0] > 1.0e-4) {
								const mid2 = low[0] + (high[0] - mid[0])
								const mid2h = fh(mid2)
								if (mid2 < mid[0]) {
									if (mid2h < mid[1]) {
										low = [mid2, mid2h]
									} else {
										high = mid
										mid = [mid2, mid2h]
									}
								} else {
									if (mid2h < mid[1]) {
										low = mid
										mid = [mid2, mid2h]
									} else {
										high = [mid2, mid2h]
									}
								}
							}
							const h = (low[0] + high[0]) / 2
							const z = this._sv[p].map((v, d) => h * v + (1 - h) * this._sv[q][d])
							const az =
								this._alpha[p] * this._kernel(this._sv[p], z) +
								this._alpha[q] * this._kernel(this._sv[q], z)
							const wd =
								this._alpha[p] ** 2 * this._kernel(this._sv[p], this._sv[p]) +
								this._alpha[q] ** 2 * this._kernel(this._sv[q], this._sv[q]) +
								az ** 2 +
								this._kernel(z, z) +
								this._alpha[p] * this._alpha[q] * this._kernel(this._sv[p], this._sv[q]) -
								this._alpha[p] * az * this._kernel(this._sv[p], z) -
								this._alpha[q] * az * this._kernel(this._sv[q], z)
							if (wd < minwd) {
								minwd = wd
								minq = q
								minaz = az
								minz = z
							}
						}
						this._sv.splice(Math.max(p, minq), 1)
						this._alpha.splice(Math.max(p, minq), 1)
						this._sv.splice(Math.min(p, minq), 1)
						this._alpha.splice(Math.min(p, minq), 1)
						this._sv.push(minz)
						this._alpha.push(minaz)
					} else {
						this._sv.splice(p, 1)
						this._alpha.splice(p, 1)
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
		for (let i = 0; i < data.length; i++) {
			let s = 0
			for (let k = 0; k < this._sv.length; k++) {
				s += this._alpha[k] * this._kernel(data[i], this._sv[k])
			}
			pred[i] = s < 0 ? -1 : 1
		}
		return pred
	}
}
