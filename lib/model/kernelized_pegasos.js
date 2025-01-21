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
 * Kernelized Primal Estimated sub-GrAdientSOlver for SVM
 */
export default class KernelizedPegasos {
	// Pegasos: Primal Estimated sub-GrAdient SOlver for SVM
	// https://home.ttic.edu/~nati/Publications/PegasosMPB.pdf
	// https://sandipanweb.wordpress.com/2018/04/29/implementing-pegasos-primal-estimated-sub-gradient-solver-for-svm-using-it-for-sentiment-classification-and-switching-to-logistic-regression-objective-by-changing-the-loss-function-in-python/
	/**
	 * @param {number} rate Learning rate
	 * @param {'gaussian' | 'polynomial' | { name: 'gaussian', s?: number } | { name: 'polynomial', d?: number } | function (number[], number[]): number} [kernel] Kernel name
	 */
	constructor(rate, kernel = 'gaussian') {
		this._r = rate
		this._itr = 100
		if (typeof kernel === 'function') {
			this._kernel = kernel
		} else {
			if (typeof kernel === 'string') {
				kernel = { name: kernel }
			}
			this._kernel = kernels[kernel.name](kernel)
		}
	}

	/**
	 * Initialize this model.
	 * @param {Array<Array<number>>} train_x Training data
	 * @param {Array<1 | -1>} train_y Target values
	 */
	init(train_x, train_y) {
		this._x = train_x
		this._y = train_y
		this._t = 0

		this._a = Array(this._x.length).fill(0)
		const n = this._x.length
		this._k = []
		for (let i = 0; i < n; i++) {
			this._k[i] = []
			this._k[i][i] = this._kernel(this._x[i], this._x[i])
			for (let j = 0; j < i; j++) {
				this._k[i][j] = this._k[j][i] = this._kernel(this._x[i], this._x[j])
			}
		}
	}

	/**
	 * Fit model parameters.
	 */
	fit() {
		for (let i = 0; i < this._itr; i++) {
			const r = Math.floor(Math.random() * this._x.length)
			this._t++
			const eta = 1 / (this._r * this._t)

			let p = 0
			for (let j = 0; j < this._x.length; j++) {
				p += this._a[j] * this._y[j] * this._k[r][j]
			}
			if (this._y[r] * eta * p < 1) {
				this._a[r]++
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
			let m = 0
			for (let j = 0; j < this._x.length; j++) {
				m += this._a[j] * this._y[j] * this._kernel(data[i], this._x[j])
			}
			p.push(m <= 0 ? -1 : 1)
		}
		return p
	}
}
