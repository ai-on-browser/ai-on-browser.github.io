/**
 * Kernelized Primal Estimated sub-GrAdientSOlver for SVM
 */
export default class KernelizedPegasos {
	// Pegasos: Primal Estimated sub-GrAdient SOlver for SVM
	// https://home.ttic.edu/~nati/Publications/PegasosMPB.pdf
	// https://sandipanweb.wordpress.com/2018/04/29/implementing-pegasos-primal-estimated-sub-gradient-solver-for-svm-using-it-for-sentiment-classification-and-switching-to-logistic-regression-objective-by-changing-the-loss-function-in-python/
	/**
	 * @param {number} rate Learning rate
	 * @param {'gaussian' | 'polynomial'} [kernel=gaussian] Kernel name
	 */
	constructor(rate, kernel = 'gaussian') {
		this._r = rate
		switch (kernel) {
			case 'gaussian':
				this._s = 1
				this._kernel = (a, b) => Math.exp(-(a.reduce((s, v, i) => s + (v - b[i]) ** 2, 0) ** 2) / this._s ** 2)
				break
			case 'polynomial':
				this._d = 2
				this._kernel = (a, b) => (1 + a.reduce((s, v, i) => s + v * b[i])) ** this._d
				break
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
		this._t = 0

		this._a = Array(this._x.length).fill(0)
	}

	/**
	 * Fit model parameters.
	 */
	fit() {
		for (let i = 0; i < this._x.length; i++) {
			this._t++
			const eta = 1 / (this._r * this._t)

			let p = 0
			for (let j = 0; j < this._x.length; j++) {
				p += this._a[j] * this._y[j] * this._kernel(this._x[i], this._x[j])
			}
			if (this._y[i] * eta * p < 1) {
				this._a[i]++
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
