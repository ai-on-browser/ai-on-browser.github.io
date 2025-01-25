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
 * Kernelized perceptron
 */
export default class KernelizedPerceptron {
	// Online Learning: A Comprehensive Survey
	// https://arxiv.org/abs/1802.02871
	// Large Margin Classification Using the Perceptron Algorithm
	// https://cseweb.ucsd.edu/~yfreund/papers/LargeMarginsUsingPerceptron.pdf
	/**
	 * @param {number} [rate] Learning rate
	 * @param {'gaussian' | 'polynomial' | { name: 'gaussian', s?: number } | { name: 'polynomial', d?: number } | function (number[], number[]): number} [kernel] Kernel name
	 */
	constructor(rate = 1, kernel = 'gaussian') {
		this._r = rate
		if (typeof kernel === 'function') {
			this._kernel = kernel
		} else {
			if (typeof kernel === 'string') {
				kernel = { name: kernel }
			}
			this._kernel = kernels[kernel.name](kernel)
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
			if (this._i.length === 0) {
				this._i.push({ x: x[i], y: y[i] })
				continue
			}
			let s = 0
			for (let k = 0; k < this._i.length; k++) {
				const j = this._i[k]
				s += this._r * j.y * this._kernel(x[i], j.x)
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
				s += this._r * j.y * this._kernel(data[i], j.x)
			}
			pred[i] = s < 0 ? -1 : 1
		}
		return pred
	}
}
