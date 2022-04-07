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
 * One-class support vector machine
 */
export default class OCSVM {
	// A Fast Learning Algorithm for One-Class Support Vector Machine
	// Estimating the Support of a High-Dimensional Distribution
	// http://citeseerx.ist.psu.edu/viewdoc/download?doi=10.1.1.39.9421&rep=rep1&type=pdf
	/**
	 * @param {number} nu Nu
	 * @param {'gaussian' | 'linear'} kernel Kernel name
	 * @param {*[]} [kernelArgs] Arguments for kernel
	 */
	constructor(nu, kernel, kernelArgs = []) {
		this._kernel = Kernel[kernel](...kernelArgs)

		this._nu = nu
		this._eps = 0.001
	}

	/**
	 * Initialize model.
	 *
	 * @param {Array<Array<number>>} x Training data
	 */
	init(x) {
		this._x = x

		const n = this._x.length
		this._nl = n * this._nu
		this._a = Array(n).fill(1 / this._nl)
		this._b = 0
		this._alldata = true

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
		const changed = this._fitOnce(this._alldata)
		if (this._alldata) {
			this._alldata = false
			if (changed === 0) {
				return
			}
		} else if (changed === 0) {
			this._alldata = true
		}
	}

	_fitOnce() {
		let change = 0
		const n = this._x.length

		for (let i = 0; i < n; i++) {
			const o = []
			this._rho = -Infinity
			for (let j = 0; j < n; j++) {
				o[j] = 0
				for (let k = 0; k < n; k++) {
					o[j] += this._a[j] * this._k[j][k]
				}
				if (this._rho < o[j]) {
					this._rho = o[j]
				}
			}

			if (!this._alldata) {
				const between_eps = v => (o[i] - this._rho) * v > 0 || (this._rho - o[i]) * (1 / this._nl - v) > 0
				if (!between_eps(this._a[i])) {
					continue
				}

				if (this._a[i] >= 1 / this._nl - this._eps || this._a[i] <= this._eps) {
					continue
				}
			}

			let j = -1
			let max_od = -Infinity
			for (let k = 0; k < n; k++) {
				if (k === i) {
					continue
				}

				if (this._a[k] >= 1 / this._nl - this._eps || this._a[k] <= this._eps) {
					continue
				}

				if (max_od < Math.abs(o[i] - o[k])) {
					j = k
					max_od = Math.abs(o[i] - o[k])
				}
			}
			if (j < 0 || j === i) {
				const offset = Math.floor(Math.random() * (n + 1))
				for (let k = 0; k < n; k++) {
					const p = (k + offset) % n
					if (p === i) {
						continue
					}
					j = p
					break
				}
			}

			let d = 1
			for (let k = 0; k < n; k++) {
				if (k === i || k === j) {
					continue
				}
				d -= this._a[k]
			}

			this._a[j] += (o[i] - o[j]) / (this._k[i][i] + this._k[j][j] - 2 * this._k[i][j])
			this._a[j] = Math.max(0, Math.min(1 / this._nl, this._a[j]))
			this._a[i] = Math.max(0, Math.min(1 / this._nl, d - this._a[j]))

			change++
		}

		this._rho = -Infinity
		for (let j = 0; j < n; j++) {
			let o = 0
			for (let k = 0; k < n; k++) {
				o += this._a[j] * this._k[j][k]
			}
			if (this._rho < o) {
				this._rho = o
			}
		}

		return change
	}

	/**
	 * Returns anomaly degrees.
	 *
	 * @param {Array<Array<number>>} x Sample data
	 * @returns {number[]} Predicted values
	 */
	predict(x) {
		return x.map(v => {
			let y = 0
			for (let n = 0; n < this._x.length; n++) {
				if (this._a[n]) y += this._a[n] * this._kernel(v, this._x[n])
			}
			return y - this._rho
		})
	}
}
