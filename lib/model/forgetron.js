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
 * Forgetron
 */
export default class Forgetron {
	// Online Learning: A Comprehensive Survey
	// https://arxiv.org/abs/1802.02871
	// The Forgetron: A Kernel-Based Perceptron on a Fixed Budget
	// https://proceedings.neurips.cc/paper/2005/file/c0f971d8cd24364f2029fcb9ac7b71f5-Paper.pdf
	// https://github.com/LIBOL/KOL
	/**
	 * @param {number} b Budget parameter
	 * @param {'gaussian' | 'polynomial' | { name: 'gaussian', s?: number } | { name: 'polynomial', d?: number } | function (number[], number[]): number} [kernel] Kernel name
	 */
	constructor(b, kernel = 'gaussian') {
		this._b = b
		if (typeof kernel === 'function') {
			this._kernel = kernel
		} else {
			if (typeof kernel === 'string') {
				kernel = { name: kernel }
			}
			this._kernel = kernels[kernel.name](kernel)
		}

		this._i = []
		this._q = 0
		this._m = 0
		this._sigma = []
	}

	/**
	 * Fit model parameters.
	 * @param {Array<Array<number>>} x Training data
	 * @param {Array<1 | -1>} y Target values
	 */
	fit(x, y) {
		for (let i = 0; i < x.length; i++) {
			let s = 0
			for (let k = 0; k < this._i.length; k++) {
				const j = this._i[k]
				s += this._sigma[k] * j.y * this._kernel(x[i], j.x)
			}
			const yh = s < 0 ? -1 : 1
			if (yh * y[i] <= 0) {
				this._m += 1
				this._i.push({ x: x[i], y: y[i] })

				if (this._i.length < this._b) {
					this._sigma.push(1)
				} else {
					const r = this._i[0]
					const s = this._sigma[0]
					let myu = y[i] * this._kernel(r.x, x[i])
					for (let k = 0; k < this._i.length; k++) {
						const j = this._i[k]
						myu += j.y * this._kernel(r.x, j.x)
					}
					myu *= r.y
					const a2 = s ** 2 - 2 * s * myu
					const a1 = 2 * s
					const a0 = this._q - (15 / 32) * this._m
					let phi = 0
					if (a2 === 0) {
						phi = Math.max(0, Math.min(1, -a0 / a1))
					} else if (a2 > 0) {
						phi = (-a1 + Math.sqrt(a1 ** 2 - 4 * a2 * a0)) / (2 * a2)
					} else {
						phi = (-a1 - Math.sqrt(a1 ** 2 - 4 * a2 * a0)) / (2 * a2)
					}
					if (isNaN(phi)) {
						phi = 1
					}
					this._sigma.push(1)
					this._sigma = this._sigma.map(v => v * phi)
					this._q += (s * phi) ** 2 + 2 * s * phi * (1 - phi * myu)
					this._i.shift()
					this._sigma.shift()
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
			for (let k = 0; k < this._i.length; k++) {
				const j = this._i[k]
				s += this._sigma[k] * j.y * this._kernel(data[i], j.x)
			}
			pred[i] = s < 0 ? -1 : 1
		}
		return pred
	}
}
