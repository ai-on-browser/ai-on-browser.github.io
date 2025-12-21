import Matrix from '../util/matrix.js'

const shuffle = arr => {
	for (let i = arr.length - 1; i > 0; i--) {
		const r = Math.floor(Math.random() * (i + 1))
		;[arr[i], arr[r]] = [arr[r], arr[i]]
	}
	return arr
}

/**
 * Uniform Manifold Approximation and Projection
 */
export default class UMAP {
	// https://arxiv.org/abs/1802.03426
	// UMAP: Uniform Manifold Approximation and Projection for Dimension Reduction
	/**
	 * @param {Array<Array<number>>} datas Training data
	 * @param {number} rd Reduced dimension
	 * @param {number} [n] Number of neighborhoods
	 * @param {number} [min_dist] Minimum distance
	 */
	constructor(datas, rd, n = 10, min_dist = 0.1) {
		this._x = Matrix.fromArray(datas).toArray()
		this._rd = rd
		this._n = n
		this._min_dist = min_dist
		this._neg_samples = 10

		this._init()
	}

	_d(a, b) {
		return Math.sqrt(a.reduce((s, v, i) => s + (v - b[i]) ** 2, 0))
	}

	_init() {
		const k = this._x.length
		const w = []
		for (let i = 0; i < k; i++) {
			const x = this._x[i]
			const dists = this._x.map((p, j) => [this._d(x, p), j])
			dists.sort((a, b) => a[0] - b[0])
			dists.splice(0, 1)
			dists.splice(this._n)
			const rho = dists[0][0]
			const l2n = Math.log2(this._n)
			let sigma = 1
			let slow = 0
			let shigh = Infinity

			while (true) {
				const sh = dists.reduce((s, v) => s + Math.exp(-(v[0] - rho) / sigma), 0)
				if (Math.abs(sh - l2n) < 1e-8) {
					break
				}
				if (sh < l2n) {
					slow = sigma
					if (shigh === Infinity) {
						sigma *= 2
					} else {
						sigma = (sigma + shigh) / 2
					}
				} else {
					shigh = sigma
					sigma = (sigma + slow) / 2
				}
			}

			w[i] = Array(k).fill(0)
			for (let j = 0; j < dists.length; j++) {
				const d = (this._d(x, this._x[dists[j][1]]) - rho) / sigma
				w[i][dists[j][1]] = Math.exp(-d)
			}
		}
		for (let i = 0; i < k; i++) {
			for (let j = i + 1; j < k; j++) {
				w[i][j] = w[j][i] = w[i][j] + w[i][j] - w[i][j] * w[j][i]
			}
		}

		this._w = Matrix.fromArray(w)
		let d = this._w.sum(1).value
		const L = Matrix.diag(d)
		L.sub(this._w)
		d = d.map(v => Math.sqrt(v))
		for (let i = 0; i < k; i++) {
			for (let j = 0; j < k; j++) {
				L.divAt(i, j, Math.sqrt(d[i] * d[j]))
			}
		}
		const ev = L.eigenVectors()
		ev.flip(1)
		this._y = ev.slice(1, this._rd + 1, 1).toArray()
		this._alpha = 1.0
		this._epoch = 0

		this._a = 1
		this._b = 1
		const lrate = 0.1

		const yd = []
		for (let i = 0; i < k; i++) {
			for (let j = 0; j < k; j++) {
				yd.push(this._d(this._y[i], this._y[j]))
			}
		}
		const psi = yd.map(v => (v <= this._min_dist ? 1 : Math.exp(this._min_dist - v)))

		for (let i = 0; i < 1000; i++) {
			const phi = yd.map(v => 1 / (1 + this._a * v ** (2 * this._b)))
			let da = 0
			let db = 0
			for (let k = 0; k < d.length; k++) {
				if (yd[k] > 0) {
					da += (phi[k] - psi[k]) * -(phi[k] ** 2) * yd[k] ** (2 * this._b)
					db += (phi[k] - psi[k]) * -(phi[k] ** 2) * this._a * yd[k] ** (2 * this._b) * Math.log(yd[k] ** 2)
				}
			}
			this._a -= lrate * da
			this._b -= lrate * db
			if (da ** 2 + db ** 2 < 1.0e-12) {
				break
			}
		}
	}

	/**
	 * Fit model and returns reduced values.
	 * @returns {Array<Array<number>>} Predicted values
	 */
	fit() {
		const k = this._x.length
		const e = 1.0e-4
		for (let i = 0; i < k; i++) {
			for (let j = i + 1; j < k; j++) {
				const w = this._w.at(i, j)
				if (Math.random() > w) {
					continue
				}
				const d = this._d(this._y[i], this._y[j])
				const a = ((-2 * this._a * this._b * d ** (2 * (this._b - 1))) / (1 + d ** 2)) * w
				this._y[i] = this._y[i].map((v, k) => v + this._alpha * a * (v - this._y[j][k]))

				const negs = []
				for (let m = 0; m < k; m++) {
					if (i !== m && this._w.at(i, m) === 0) {
						negs.push(m)
					}
				}
				shuffle(negs)
				for (let m = 0; m < Math.min(this._neg_samples, negs.length); m++) {
					const d = this._d(this._y[i], this._y[m]) ** 2
					const a = ((2 * this._b) / ((e + d) * (1 + this._a * d ** this._b))) * (1 - this._w.at(i, m))
					this._y[i] = this._y[i].map((v, k) => v + this._alpha * a * (v - this._y[m][k]))
				}
			}
		}
		this._epoch++
		this._alpha *= 0.99

		return this._y
	}

	/**
	 * Returns reduced values.
	 * @returns {Array<Array<number>>} Predicted values
	 */
	predict() {
		return this._y
	}
}
