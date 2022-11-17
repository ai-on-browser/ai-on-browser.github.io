/**
 * Stoptron
 */
export default class Stoptron {
	// Online Learning: A Comprehensive Survey
	// https://arxiv.org/abs/1802.02871
	// The Projectron: a Bounded Kernel-Based Perceptron
	// https://citeseerx.ist.psu.edu/viewdoc/download?doi=10.1.1.399.1701&rep=rep1&type=pdf
	// Breaking the Curse of Kernelization: Budgeted Stochastic Gradient Descent for Large-Scale SVM Training
	// https://www.jmlr.org/papers/volume13/wang12b/wang12b.pdf
	/**
	 * @param {number} [n=10] Cachs size
	 * @param {'gaussian' | 'polynomial' | function (number[], number[]): number} [kernel=gaussian] Kernel name
	 */
	constructor(n = 10, kernel = 'gaussian') {
		this._n = n
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
		this._epoch = 0

		this._i = []
	}

	/**
	 * Fit model.
	 */
	fit() {
		for (let i = 0; i < this._x.length; i++) {
			if (this._i.length > this._n) {
				return
			}
			let s = 0
			for (let k = 0; k < this._i.length; k++) {
				const j = this._i[k]
				s += this._y[j] * this._kernel(this._x[i], this._x[j])
			}
			const yh = s < 0 ? -1 : 1
			if (yh !== this._y[i]) {
				this._i.push(i)
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
			for (let k = 0; k < this._i.length; k++) {
				const j = this._i[k]
				s += this._y[j] * this._kernel(data[i], this._x[j])
			}
			pred[i] = s < 0 ? -1 : 1
		}
		return pred
	}
}
