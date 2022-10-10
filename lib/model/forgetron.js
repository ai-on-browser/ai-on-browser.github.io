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
	 * @param {'gaussian' | 'polynomial'} [kernel=gaussian] Kernel name
	 */
	constructor(b, kernel = 'gaussian') {
		this._b = b
		switch (kernel) {
			case 'gaussian':
				this._s = 1
				this._kernel = (a, b) => Math.exp(-(a.reduce((s, v, i) => s + (v - b[i]) ** 2, 1) ** 2) / this._s ** 2)
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

		this._i = []
		this._q = 0
		this._m = 0
		this._sigma = []
	}

	/**
	 * Fit model parameters.
	 */
	fit() {
		for (let i = 0; i < this._x.length; i++) {
			let s = 0
			for (let k = 0; k < this._i.length; k++) {
				const j = this._i[k]
				s += this._sigma[k] * this._y[j] * this._kernel(this._x[i], this._x[j])
			}
			const yh = s < 0 ? -1 : 1
			if (yh * this._y[i] <= 0) {
				this._m += 1
				this._i.push(i)

				if (this._i.length < this._b) {
					this._sigma.push(1)
				} else {
					const r = this._i[0]
					const s = this._sigma[0]
					let myu = this._y[i] * this._kernel(this._x[r], this._x[i])
					for (let k = 0; k < this._i.length; k++) {
						const j = this._i[k]
						myu += this._y[j] * this._kernel(this._x[r], this._x[j])
					}
					myu *= this._y[r]
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
				s += this._sigma[k] * this._y[j] * this._kernel(data[i], this._x[j])
			}
			pred[i] = s < 0 ? -1 : 1
		}
		return pred
	}
}
