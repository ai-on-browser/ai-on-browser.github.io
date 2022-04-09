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
 * Support vector regression
 */
export default class SVR {
	// https://jp.mathworks.com/matlabcentral/fileexchange/79790-sequential-minimal-optimization-smo-for-svr
	/**
	 * @param {'gaussian' | 'linear'} kernel Kernel name
	 * @param {*[]} [kernelArgs] Arguments for kernel
	 */
	constructor(kernel, kernelArgs = []) {
		this._kernel = Kernel[kernel](...kernelArgs)

		this._C = 1
		this._eps = 0.001
		this._tolerance = 0.001
	}

	/**
	 * Initialize this model.
	 *
	 * @param {Array<Array<number>>} x Training data
	 * @param {Array<Array<number>>} y Target values
	 */
	init(x, y) {
		this._x = x
		this._t = y.map(v => v[0])

		const n = this._x.length
		this._a = Array(n).fill(0)
		this._b = 0
		this._alldata = true
		this._err = this._t.map(v => -v)

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
		const changed = this._fitOnce()
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

		const between_eps = v => this._eps < v && v < this._C - this._eps
		for (let i = 0; i < n; i++) {
			if (!between_eps(this._a[i]) && !this._alldata) {
				continue
			}

			if (
				(this._a[i] >= this._C - this._eps || this._err[i] >= -this._tolerance) &&
				(this._a[i] <= this._eps || this._err[i] <= this._tolerance)
			) {
				continue
			}

			let ii = -1
			let ii_e = null
			for (let j = 0; j < n; j++) {
				if (between_eps(this._a[j])) {
					if (this._err[i] > 0) {
						if (ii_e === null || ii_e > this._err[i]) {
							ii = j
							ii_e = this._err[i]
						}
					} else {
						if (ii_e === null || ii_e < this._err[i]) {
							ii = j
							ii_e = this._err[i]
						}
					}
				}
			}
			if (ii === -1 || ii === i) {
				const offset = Math.floor(Math.random() * (n + 1))
				for (let j = 0; j < n; j++) {
					const p = (j + offset) % n
					if (p === i) {
						continue
					}
					if (between_eps(this._a[p])) {
						ii = p
						break
					}
				}
			}
			if (ii === -1 || ii === i) {
				const offset = Math.floor(Math.random() * (n + 1))
				for (let j = 0; j < n; j++) {
					const p = (j + offset) % n
					if (p === i) {
						continue
					}
					ii = p
					break
				}
			}
			if (ii === -1 || ii === i) {
				continue
			}

			const j = ii
			const ai_old = this._a[i]
			const aj_old = this._a[j]

			const s = this._a[i] + this._a[j]

			const kii = this._k[i][i]
			const kjj = this._k[j][j]
			const kij = this._k[i][j]
			const eta = kii + kjj - 2 * kij
			const delta = (2 * this._eps) / eta

			let fi = 0
			let fj = 0
			for (let m = 0; m < n; m++) {
				fi += this._k[i][m] * this._a[m]
				fj += this._k[j][m] * this._a[m]
			}

			this._a[i] += (1 / eta) * (this._t[i] - this._t[j] - fi + fj)
			this._a[j] = s - this._a[i]
			if (this._a[i] * this._a[j] < 0) {
				if (Math.abs(this._a[i]) >= delta && Math.abs(this._a[j]) >= delta) {
					this._a[i] -= Math.sign(this._a[i]) * delta
				} else {
					this._a[i] = Math.abs(this._a[i]) - Math.abs(this._a[j]) < 0 ? 0 : s
				}
			}

			const low = Math.max(s - this._C, -this._C)
			const high = Math.min(this._C, s + this._C)
			this._a[i] = Math.min(Math.max(this._a[i], low), high)
			this._a[j] = s - this._a[i]

			for (let m = 0; m < n; m++) {
				this._err[m] += (this._a[i] - ai_old) * this._k[i][m] + (this._a[j] - aj_old) * this._k[j][m]
			}
			change++
		}
		this._b = this._err.reduce((s, v) => s + v, 0) / n

		return change
	}

	/**
	 * Returns predicted values.
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
			return y - this._b
		})
	}
}
