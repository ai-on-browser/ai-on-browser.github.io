import Matrix from '../util/matrix.js'

const kernels = {
	gaussian:
		({ s = 1 }) =>
		(a, b) =>
			Math.exp(-(a.reduce((s, v, i) => s + (v - b[i]) ** 2, 0) ** 2) / s ** 2),
	polynomial:
		({ d = 2 }) =>
		(a, b) =>
			(1 + a.reduce((s, v, i) => s + v * b[i])) ** d,
}

/**
 * Budgeted Stochastic Gradient Descent
 */
export default class BSGD {
	// Breaking the Curse of Kernelization: Budgeted Stochastic Gradient Descent for Large-Scale SVM Training
	// https://www.jmlr.org/papers/volume13/wang12b/wang12b.pdf
	/**
	 * @param {number} [b] Budget size
	 * @param {number} [eta] Learning rate
	 * @param {number} [lambda] Regularization parameter
	 * @param {'removal' | 'projection' | 'merging'} [maintenance] Maintenance type
	 * @param {'gaussian' | 'polynomial' | { name: 'gaussian', s?: number } | { name: 'polynomial', d?: number } | function (number[], number[]): number} [kernel] Kernel name
	 */
	constructor(b = 10, eta = 1, lambda = 1, maintenance = 'removal', kernel = 'gaussian') {
		this._b = b
		this._eta = eta
		this._lambda = lambda
		this._maintenance = maintenance
		if (typeof kernel === 'function') {
			this._kernel = kernel
		} else {
			if (typeof kernel === 'string') {
				kernel = { name: kernel }
			}
			this._kernel = kernels[kernel.name](kernel)
		}

		this._sv = []
		this._alpha = []
	}

	/**
	 * Fit model.
	 * @param {Array<Array<number>>} x Training data
	 * @param {Array<1 | -1>} y Target values
	 */
	fit(x, y) {
		const phi = (1 + Math.sqrt(5)) / 2
		for (let t = 0; t < x.length; t++) {
			let s = 0
			for (let k = 0; k < this._sv.length; k++) {
				s += this._alpha[k] * this._kernel(x[t], this._sv[k])
			}
			this._alpha = this._alpha.map(a => a * (1 - this._eta * this._lambda))
			if (s * y[t] < 1) {
				this._alpha.push(this._eta * y[t])
				this._sv.push(x[t])
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

/**
 * Multiclass Budgeted Stochastic Gradient Descent
 */
export class MulticlassBSGD {
	// Breaking the Curse of Kernelization: Budgeted Stochastic Gradient Descent for Large-Scale SVM Training
	// https://www.jmlr.org/papers/volume13/wang12b/wang12b.pdf
	/**
	 * @param {number} [b] Budget size
	 * @param {number} [eta] Learning rate
	 * @param {number} [lambda] Regularization parameter
	 * @param {'removal' | 'projection' | 'merging'} [maintenance] Maintenance type
	 * @param {'gaussian' | 'polynomial' | { name: 'gaussian', s?: number } | { name: 'polynomial', d?: number } | function (number[], number[]): number} [kernel] Kernel name
	 */
	constructor(b = 10, eta = 1, lambda = 1, maintenance = 'removal', kernel = 'gaussian') {
		this._b = b
		this._eta = eta
		this._lambda = lambda
		this._maintenance = maintenance
		if (typeof kernel === 'function') {
			this._kernel = kernel
		} else {
			if (typeof kernel === 'string') {
				kernel = { name: kernel }
			}
			this._kernel = kernels[kernel.name](kernel)
		}

		this._classes = []
		this._sv = []
		this._alpha = []
	}

	/**
	 * Fit model.
	 * @param {Array<Array<number>>} x Training data
	 * @param {*[]} y Target values
	 */
	fit(x, y) {
		const phi = (1 + Math.sqrt(5)) / 2
		for (let t = 0; t < x.length; t++) {
			let cidx = this._classes.indexOf(y[t])
			if (cidx < 0) {
				cidx = this._classes.length
				this._classes.push(y[t])
				this._sv.push([])
				this._alpha.push([])
			}
			let max_s = -Infinity
			let max_c = -1
			for (let c = 0; c < this._classes.length; c++) {
				let s = 0
				for (let k = 0; k < this._sv[c].length; k++) {
					s += this._alpha[c][k] * this._kernel(x[t], this._sv[c][k])
				}
				if (max_s < s) {
					max_s = s
					max_c = c
				}
			}
			for (let c = 0; c < this._classes.length; c++) {
				this._alpha[c] = this._alpha[c].map(a => a * (1 - this._eta * this._lambda))
			}
			if (cidx !== max_c) {
				this._alpha[cidx].push(this._eta)
				this._sv[cidx].push(x[t])
				this._alpha[max_c].push(-this._eta)
				this._sv[max_c].push(x[t])
				for (const c of [cidx, max_c]) {
					if (this._sv[c].length <= this._b) {
						continue
					}
					let minv = Infinity
					let p = -1
					for (let k = 0; k < this._sv[c].length; k++) {
						const v = this._alpha[c][k] ** 2 * this._kernel(this._sv[c][k], this._sv[c][k])
						if (v < minv) {
							minv = v
							p = k
						}
					}
					if (this._maintenance === 'projection') {
						const svp = this._sv[c].splice(p, 1)[0]
						const ap = this._alpha[c].splice(p, 1)[0]
						const K = new Matrix(this._b, this._b)
						const k = new Matrix(this._b, 1)
						for (let i = 0; i < this._b; i++) {
							K.set(i, i, this._kernel(this._sv[c][i], this._sv[c][i]))
							for (let j = i; j < this._b; j++) {
								const kij = this._kernel(this._sv[c][i], this._sv[c][j])
								K.set(i, j, kij)
								K.set(j, i, kij)
							}
							k.set(i, 0, this._kernel(svp, this._sv[c][i]))
						}
						const norm = K.norm() / 1000
						for (let i = 0; i < this._b; i++) {
							K.addAt(i, i, norm)
						}
						const da = K.solve(k)
						for (let k = 0; k < this._b; k++) {
							this._alpha[c][k] += ap * da.at(k, 0)
						}
					} else if (this._maintenance === 'merging') {
						let minwd = Infinity
						let minq = 0
						let minaz = 0
						let minz = null
						for (let q = 0; q < this._sv[c].length; q++) {
							if (q === p) {
								continue
							}
							const m = this._alpha[c][p] / (this._alpha[c][p] + this._alpha[c][q])
							const fh = h =>
								m *
									this._kernel(
										this._sv[c][p].map(v => (1 - h) * v),
										this._sv[c][q].map(v => (1 - h) * v)
									) +
								(1 - m) *
									this._kernel(
										this._sv[c][p].map(v => h * v),
										this._sv[c][q].map(v => h * v)
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
							const z = this._sv[c][p].map((v, d) => h * v + (1 - h) * this._sv[c][q][d])
							const az =
								this._alpha[c][p] * this._kernel(this._sv[c][p], z) +
								this._alpha[c][q] * this._kernel(this._sv[c][q], z)
							const wd =
								this._alpha[c][p] ** 2 * this._kernel(this._sv[c][p], this._sv[c][p]) +
								this._alpha[c][q] ** 2 * this._kernel(this._sv[c][q], this._sv[c][q]) +
								az ** 2 +
								this._kernel(z, z) +
								this._alpha[c][p] * this._alpha[c][q] * this._kernel(this._sv[c][p], this._sv[c][q]) -
								this._alpha[c][p] * az * this._kernel(this._sv[c][p], z) -
								this._alpha[c][q] * az * this._kernel(this._sv[c][q], z)
							if (wd < minwd) {
								minwd = wd
								minq = q
								minaz = az
								minz = z
							}
						}
						this._sv[c].splice(Math.max(p, minq), 1)
						this._alpha[c].splice(Math.max(p, minq), 1)
						this._sv[c].splice(Math.min(p, minq), 1)
						this._alpha[c].splice(Math.min(p, minq), 1)
						this._sv[c].push(minz)
						this._alpha[c].push(minaz)
					} else {
						this._sv[c].splice(p, 1)
						this._alpha[c].splice(p, 1)
					}
				}
			}
		}
	}

	/**
	 * Returns predicted values.
	 * @param {Array<Array<number>>} data Sample data
	 * @returns {*[]} Predicted values
	 */
	predict(data) {
		const pred = []
		for (let i = 0; i < data.length; i++) {
			let max_s = -Infinity
			pred[i] = null
			for (let c = 0; c < this._classes.length; c++) {
				let s = 0
				for (let k = 0; k < this._sv[c].length; k++) {
					s += this._alpha[c][k] * this._kernel(data[i], this._sv[c][k])
				}
				if (max_s < s) {
					max_s = s
					pred[i] = this._classes[c]
				}
			}
		}
		return pred
	}
}
