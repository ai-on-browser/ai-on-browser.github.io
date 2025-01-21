const kernels = {
	gaussian: u => {
		const d = u.length
		return Math.exp(-u.reduce((s, v) => s + v ** 2, 0) / 2) / (2 * Math.PI) ** (d / 2)
	},
}

/**
 * DENsity CLUstering
 */
export default class DENCLUE {
	// DENCLUE 2.0: Fast Clustering based on Kernel Density Estimation
	// https://users.wpi.edu/~yli15/courses/DS504Fall16/includes/denclue.pdf
	// https://github.com/mgarrett57/DENCLUE
	/**
	 * @param {number} h Smoothing parameter for the kernel
	 * @param {1 | 2} [version] Version number
	 * @param {'gaussian' | { name: 'gaussian' } | function (number[]): number} [kernel] Kernel name
	 */
	constructor(h, version = 1, kernel = 'gaussian') {
		this._version = version
		this._h = h
		this._delta = 0.01
		this._ignore_p = 0.2
		this._xi = 1.0e-12

		if (typeof kernel === 'function') {
			this._kernel = kernel
		} else if (kernel === 'gaussian' || kernel.name === 'gaussian') {
			this._kernel = kernels.gaussian
		}
	}

	/**
	 * Number of clusters
	 * @type {number}
	 */
	get size() {
		return new Set(this.predict()).size
	}

	/**
	 * Initialize model.
	 * @param {Array<Array<number>>} datas Training data
	 */
	init(datas) {
		this._datas = datas
		this._x = datas.map(v => v.concat())

		if (this._version === 2) {
			const n = this._x.length
			if (this._ignore_p > 0) {
				this._k = []
				for (let i = 0; i < n; this._k[i++] = []);
				for (let i = 0; i < n; i++) {
					this._k[i][i] = { k: Infinity, idx: i }
					for (let j = i + 1; j < n; j++) {
						const k = this._kernel(this._x[i].map((v, k) => (v - this._x[j][k]) / this._h))
						this._k[i][j] = { k, idx: j }
						this._k[j][i] = { k, idx: i }
					}
					this._k[i].sort((a, b) => a.k - b.k)
					this._k[i].forEach((v, j) => {
						if (j < this._ignore_p * n) {
							v.low = true
						}
					})
					this._k[i].sort((a, b) => a.idx - b.idx)
				}
			}
			this._radius = Array(this._x.length)
			for (let i = 0; i < n; i++) {
				this._radius[i] = []
			}
		}
		if (this._xi > 0) {
			this._probs = this._x.map(x => this._p(x))
		}
	}

	_p(x) {
		let s = 0
		for (let i = 0; i < this._datas.length; i++) {
			s += this._kernel(this._datas[i].map((v, k) => (x[k] - v) / this._h))
		}
		return s / (this._datas.length * this._h ** x.length)
	}

	_dp(x) {
		let s = Array(x.length).fill(0)
		for (let i = 0; i < this._datas.length; i++) {
			const ki = this._kernel(this._datas[i].map((v, k) => (x[k] - v) / this._h))
			for (let k = 0; k < s.length; k++) {
				s[k] += ki * (this._datas[i][k] - x[k])
			}
		}
		return s.map(v => v / (this._datas.length * s.length ** (x.length + 2)))
	}

	/**
	 * Fit model.
	 */
	fit() {
		if (this._version === 1) {
			for (let i = 0; i < this._x.length; i++) {
				const dp = this._dp(this._x[i])
				const s = Math.sqrt(dp.reduce((s, v) => s + v ** 2, 0))
				for (let d = 0; d < this._x[i].length; d++) {
					this._x[i][d] += (this._delta * dp[d]) / s
				}
			}
		} else {
			for (let i = 0; i < this._x.length; i++) {
				const xi = this._x[i]
				let s = 0
				const nx = Array(xi.length).fill(0)
				for (let j = 0; j < this._datas.length; j++) {
					let k
					if (this._k && this._k[i][j].low) {
						k = this._k[i][j].k
					} else {
						k = this._kernel(this._datas[j].map((v, k) => (xi[k] - v) / this._h))
					}
					for (let d = 0; d < xi.length; d++) {
						nx[d] += k * this._datas[j][d]
					}
					s += k
				}
				for (let d = 0; d < nx.length; d++) {
					nx[d] /= s
				}
				const radius = Math.sqrt(xi.reduce((s, v, d) => s + (v - nx[d]) ** 2, 0))
				this._x[i] = nx
				if (radius > 1.0e-8) {
					this._radius[i].push(radius)
				}
			}
		}
	}

	/**
	 * Returns predicted categories.
	 * @returns {number[]} Predicted values
	 */
	predict() {
		const cluster = []
		let c = -1
		for (let i = 0; i < this._x.length; i++) {
			if (this._probs && this._probs[i] < this._xi) {
				cluster[i] = -1
				continue
			}
			const err = this._version === 1 ? this._delta : this._radius[i].reduce((s, v) => s + v, 0)
			let nearest = -1
			let dist = Infinity
			for (let k = 0; k < i; k++) {
				const d = Math.sqrt(this._x[k].reduce((s, v, d) => s + (v - this._x[i][d]) ** 2, 0))
				if (d < 2 * err && d < dist) {
					nearest = k
					dist = d
				}
			}
			if (nearest < 0) {
				cluster[i] = ++c
			} else {
				cluster[i] = cluster[nearest]
			}
		}
		return cluster
	}
}
