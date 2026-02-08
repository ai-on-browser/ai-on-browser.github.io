const kernels = {
	gaussian: x => Math.exp((-x * x) / 2),
	rectangular: x => (Math.abs(x) <= 1 ? 0.5 : 0),
	triangular: x => (Math.abs(x) <= 1 ? 1 - Math.abs(x) : 0),
	epanechnikov: x => (Math.abs(x) <= 1 ? (3 * (1 - x ** 2)) / 4 : 0),
	biweight: x => (Math.abs(x) <= 1 ? (15 / 16) * (1 - x ** 2) ** 2 : 0),
	triweight: x => (Math.abs(x) <= 1 ? (35 / 32) * (1 - x ** 2) ** 3 : 0),
}

/**
 * Blurring Mean shift
 */
export default class BlurringMeanShift {
	// Automated Clustering of High-dimensional Data with a Feature Weighted Mean Shift Algorithm
	// https://cdn.aaai.org/ojs/16854/16854-13-20348-1-2-20210518.pdf
	/**
	 * @param {number} h Smoothing parameter for the kernel
	 * @param {number} threshold Distance threshold for determining same cluster
	 * @param {'gaussian' | 'rectangular' | 'triangular' | 'epanechnikov' | 'biweight' | 'triweight' | { name: 'gaussian' } | { name: 'rectangular' } | { name: 'triangular' } | { name: 'epanechnikov' } | { name: 'biweight' } | { name: 'triweight' } | function (number): number} [kernel] Kernel name
	 */
	constructor(h, threshold, kernel = 'gaussian') {
		this._x = null
		this._c = []
		this._h = h
		this._threshold = threshold

		if (typeof kernel === 'function') {
			this._kernel = kernel
		} else {
			if (typeof kernel === 'string') {
				kernel = { name: kernel }
			}
			this._kernel = kernels[kernel.name]
		}
	}

	/**
	 * Category list
	 * @type {number[]}
	 */
	get categories() {
		const y = this.predict()
		return [...new Set(y)]
	}

	/**
	 * Number of clusters
	 * @type {number}
	 */
	get size() {
		const y = this.predict()
		return new Set(y).size
	}

	_distance(a, b) {
		return Math.sqrt(a.reduce((s, v, i) => s + (v - b[i]) ** 2, 0))
	}

	/**
	 * Initialize model.
	 * @param {Array<Array<number>>} data Training data
	 */
	init(data) {
		this._x = data
		this._c = this._x.map(v => [].concat(v))
	}

	/**
	 * Returns predicted categories.
	 * @returns {number[]} Predicted values
	 */
	predict() {
		let categories = 0
		const p = []
		for (let i = 0; i < this._c.length; i++) {
			let category = i
			for (let k = 0; k < i; k++) {
				if (this._distance(this._c[i], this._c[k]) < this._threshold) {
					category = p[k]
					break
				}
			}
			if (category === i) categories++
			p[i] = category
		}
		return p
	}

	/**
	 * Fit model.
	 * @returns {boolean} `true` if any centroids has moved
	 */
	fit() {
		const K = []
		for (let i = 0; i < this._c.length; i++) {
			K[i] = []
			K[i][i] = this._kernel(this._distance(this._c[i], this._c[i]) / this._h)
			for (let j = 0; j < i; j++) {
				K[i][j] = K[j][i] = this._kernel(this._distance(this._c[i], this._c[j]) / this._h)
			}
		}
		let isChanged = false
		this._c = this._c.map((c, i) => {
			let s = 0
			const v = Array(c.length).fill(0)
			for (let j = 0; j < this._c.length; j++) {
				s += K[i][j]
				for (let k = 0; k < v.length; k++) {
					v[k] += this._c[j][k] * K[i][j]
				}
			}

			const newPoint = v.map(a => a / s)
			isChanged ||= c.some((v, i) => v !== newPoint[i])
			return newPoint
		})

		return isChanged
	}
}
