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
	 * @param {number} [n] Cachs size
	 * @param {'gaussian' | 'polynomial' | { name: 'gaussian', s?: number } | { name: 'polynomial', d?: number } | function (number[], number[]): number} [kernel] Kernel name
	 */
	constructor(n = 10, kernel = 'gaussian') {
		this._n = n
		if (typeof kernel === 'function') {
			this._kernel = kernel
		} else {
			if (typeof kernel === 'string') {
				kernel = { name: kernel }
			}
			switch (kernel.name) {
				case 'gaussian':
					this._s = kernel.s ?? 1
					this._kernel = (a, b) =>
						Math.exp(-(a.reduce((s, v, i) => s + (v - b[i]) ** 2, 0) ** 2) / this._s ** 2)
					break
				case 'polynomial':
					this._d = kernel.d ?? 2
					this._kernel = (a, b) => (1 + a.reduce((s, v, i) => s + v * b[i])) ** this._d
					break
			}
		}

		this._i = []
	}

	/**
	 * Fit model.
	 * @param {Array<Array<number>>} x Training data
	 * @param {Array<1 | -1>} y Target values
	 */
	fit(x, y) {
		for (let i = 0; i < x.length; i++) {
			if (this._i.length > this._n) {
				return
			}
			let s = 0
			for (let k = 0; k < this._i.length; k++) {
				const j = this._i[k]
				s += j.y * this._kernel(x[i], j.x)
			}
			const yh = s < 0 ? -1 : 1
			if (yh !== y[i]) {
				this._i.push({ x: x[i], y: y[i] })
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
			for (let k = 0; k < this._i.length; k++) {
				const j = this._i[k]
				s += j.y * this._kernel(data[i], j.x)
			}
			pred[i] = s < 0 ? -1 : 1
		}
		return pred
	}
}
