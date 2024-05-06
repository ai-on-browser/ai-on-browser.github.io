const Kernel = {
	gaussian:
		(d = 1) =>
		(a, b) => {
			const r = a.reduce((acc, v, i) => acc + (v - b[i]) ** 2, 0)
			return Math.exp(-r / (2 * d * d))
		},
	linear: () => (a, b) => a.reduce((acc, v, i) => acc + v * b[i], 0),
}

/**
 * Support vector clustering
 */
export default class SVC {
	// https://dl.acm.org/doi/pdf/10.5555/944790.944807
	// https://github.com/josiahw/SimpleSVClustering
	/**
	 * @param {'gaussian' | 'linear' | { name: 'gaussian', d?: number } | { name: 'linear' } | function (number[], number[]): number} kernel Kernel name
	 */
	constructor(kernel) {
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

		this._C = 1
		this._predicts = null
	}

	/**
	 * Number of clusters
	 * @type {number}
	 */
	get size() {
		const y = this.predict()
		return new Set(y).size
	}

	/**
	 * Initialize this model.
	 * @param {Array<Array<number>>} x Training data
	 */
	init(x) {
		this._x = x

		const n = this._x.length
		this._a = Array(n).fill(0)

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
		this._predicts = null
		const n = this._x.length

		for (let i = 0; i < n; i++) {
			let g = -this._k[i][i]
			for (let j = 0; j < n; j++) {
				g += this._a[j] * this._k[i][j]
			}

			this._a[i] = Math.min(this._C, Math.max(0, this._a[i] - g / this._k[i][i]))
		}

		this._b_off = 0
		for (let i = 0; i < n; i++) {
			for (let j = 0; j < n; j++) {
				this._b_off += this._k[i][j] * this._a[i] * this._a[j]
			}
		}

		const dens = []
		for (let i = 0; i < n; i++) {
			dens[i] = this._k[i][i]
			for (let j = 0; j < n; j++) {
				dens[i] -= 2 * this._a[j] * this._k[i][j]
			}
			dens[i] = Math.sqrt(dens[i] + this._b_off)
		}

		this._r = dens.reduce((s, v) => s + v, 0) / dens.length
	}

	/**
	 * Returns predicted categories.
	 * @returns {number[]} Predicted values
	 */
	predict() {
		if (this._predicts) {
			return this._predicts
		}
		const segrate = [0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9]
		const n = this._x.length
		const a = []
		for (let i = 0; i < n; i++) {
			a[i] = []
		}
		for (let i = 0; i < n; i++) {
			a[i][i] = 0
			for (let j = i + 1; j < n; j++) {
				let con = true
				for (let s = 0; s < segrate.length && con; s++) {
					const y = this._x[i].concat()
					for (let d = 0; d < y.length; d++) {
						y[d] += segrate[s] * (this._x[j][d] - this._x[i][d])
					}
					let yk = this._kernel(y, y)
					for (let k = 0; k < n; k++) {
						yk -= 2 * this._a[k] * this._kernel(this._x[k], y)
					}
					con &&= Math.sqrt(yk + this._b_off) <= this._r
				}
				a[i][j] = a[j][i] = con ? 1 : 0
			}
		}

		let category = 0
		const categories = Array(n).fill(-1)
		do {
			let i = 0
			for (; i < n && categories[i] >= 0; i++);

			const stack = [i]
			while (stack.length > 0) {
				const k = stack.pop()
				if (categories[k] >= 0) {
					continue
				}
				categories[k] = category

				for (let j = 0; j < n; j++) {
					if (a[i][j] > 0) {
						stack.push(j)
					}
				}
			}
			categories[i] = category
			category++
		} while (categories.some(v => v < 0))

		this._predicts = categories
		return categories
	}
}
