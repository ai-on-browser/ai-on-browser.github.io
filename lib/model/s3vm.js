import Matrix from '../util/matrix.js'

const Kernel = {
	gaussian:
		(d = 1) =>
		(a, b) => {
			let r = a.reduce((acc, v, i) => acc + (v - b[i]) ** 2, 0)
			return Math.exp(-r / (2 * d * d))
		},
	linear: () => (a, b) => a.reduce((acc, v, i) => acc + v * b[i], 0),
}

/**
 * Semi-Supervised Support Vector Machine
 */
export default class S3VM {
	// https://citeseerx.ist.psu.edu/viewdoc/download?doi=10.1.1.79.1969&rep=rep1&type=pdf
	// https://is.mpg.de/fileadmin/user_upload/files/publications/SSL-spam_4162[0].pdf
	// http://www.fabiangieseke.de/pdfs/neucom2013_draft.pdf
	/**
	 * @param {'gaussian' | 'linear' | { name: 'gaussian', d?: number } | { name: 'linear' } | function (number[], number[]): number} kernel Kernel name
	 */
	constructor(kernel) {
		this._b = 0
		this._s = 3
		this._gammas = null
		this._rate = 0.1

		this._C = 1
		this._Cs = 1
		if (typeof kernel === 'function') {
			this._kernel = kernel
		} else {
			if (typeof kernel === 'string') {
				kernel = { name: kernel }
			}
			if (kernel.name === 'gaussian') {
				this._kernel = Kernel.gaussian(kernel.d)
			} else {
				this._kernel = Kernel.linear()
			}
		}
	}

	/**
	 * Initialize model.
	 * @param {Array<Array<number>>} x Training data
	 * @param {(1 | -1 | null)[]} y Target values
	 */
	init(x, y) {
		this._x = x.map(r => r.concat())
		this._t = y
		const n = this._x.length
		this._a = Matrix.randn(n, 1).value

		this._m = Array(this._x[0].length).fill(0)
		let us = 0
		for (let i = 0; i < n; i++) {
			if (this._t[i]) {
				this._b += this._t[i]
			} else {
				for (let d = 0; d < this._x[i].length; d++) {
					this._m[d] += this._x[i][d]
				}
				us++
			}
		}
		this._m = this._m.map(v => v / us)
		for (let i = 0; i < n; i++) {
			for (let d = 0; d < this._x[i].length; d++) {
				this._x[i][d] -= this._m[d]
			}
		}
		this._b /= this._x.length - us

		this._k = []
		for (let i = 0; i < n; this._k[i++] = []);
		for (let i = 0; i < n; i++) {
			for (let j = i; j < n; j++) {
				this._k[i][j] = this._k[j][i] = this._kernel(this._x[i], this._x[j])
			}
		}
	}

	/**
	 * Fit model.
	 */
	fit() {
		this._fit_continuation()
	}

	_fit_continuation() {
		const n = this._x.length
		if (!this._gammas) {
			const ux = Matrix.zeros(n, n)
			let xnmax = 0
			for (let i = 0; i < n; i++) {
				if (this._t[i]) {
					continue
				}
				const xi = new Matrix(n, 1, this._k[i])
				const xx = xi.dot(xi.t)
				const xn = xi.norm()
				xx.div(xn ** 3)
				ux.add(xx)
				if (xnmax < xn) {
					xnmax = xn
				}
			}
			const [lmax] = ux.eigenPowerIteration()
			const g0 = Math.cbrt((this._Cs * lmax) ** 2 / (2 * this._s))
			const gend = 1 / (20 * this._s * xnmax ** 2)

			this._gammas = []
			const gn = 11
			for (let i = 0; i <= 10; i++) {
				this._gammas[i] = (gend / g0) ** (i / (gn - 1)) * g0
			}
			this._gamma_idx = 0
		}

		const gamma = this._gammas[this._gamma_idx]

		const pred = []
		const a = []
		const e = []
		for (let i = 0; i < n; i++) {
			const xn2 = this._k[i].reduce((s, v) => s + v ** 2, 0)
			pred[i] = this._k[i].reduce((s, v, j) => s + this._a[j] * v, 0) + this._b
			a[i] = 1 + 2 * gamma * this._s * xn2
			if (this._t[i]) {
				e[i] = (this._t[i] * pred[i] - 1) / Math.sqrt(2 * gamma * xn2)
			}
		}

		const newa = this._a.concat()
		for (let i = 0; i < n; i++) {
			let d
			if (this._t[i]) {
				d = (this._C / 2) * this._erfc(e[i]) * this._t[i]
			} else {
				d = this._Cs * ((2 * this._s * pred[i]) / a[i] ** (3 / 2)) * Math.exp((-this._s * pred[i] ** 2) / a[i])
			}
			for (let k = 0; k < n; k++) {
				newa[k] -= d * this._k[i][k]
			}
		}

		const err = newa.reduce((s, v) => s + v ** 2, 0)
		this._a = this._a.map((v, i) => v - this._rate * newa[i])
		if (err < 1.0e-4 && this._gamma_idx < this._gammas.length - 1) {
			this._gamma_idx++
		}
	}

	_erfc(z) {
		const p = 0.3275911
		const a1 = 0.254829592
		const a2 = -0.284496736
		const a3 = 1.421413741
		const a4 = -1.453152027
		const a5 = 1.061405429

		const sign = z < 0 ? -1 : 1
		const x = Math.abs(z)
		const t = 1 / (1 + p * x)
		const erf = 1 - ((((a5 * t + a4) * t + a3) * t + a2) * t + a1) * t * Math.exp(-x * x)
		return 1 - sign * erf
	}

	/**
	 * Returns predicted values.
	 * @param {Array<Array<number>>} data Sample data
	 * @returns {number[]} Predicted values
	 */
	predict(data) {
		const n = this._x.length
		return data.map(v => {
			v = v.map((v, d) => v - this._m[d])
			let y = 0
			for (let k = 0; k < n; k++) {
				y += this._a[k] * this._kernel(v, this._x[k])
			}
			return y + this._b
		})
	}
}
