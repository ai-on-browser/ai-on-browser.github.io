import Matrix from '../util/matrix.js'

/**
 * Budgeted online Passive-Aggressive
 */
export default class BPA {
	// Online Passive-Aggressive Algorithms on a Budget
	// http://proceedings.mlr.press/v9/wang10b/wang10b.pdf
	/**
	 * @param {number} [c] Regularization parameter
	 * @param {number} [b] Budget size
	 * @param {'simple' | 'projecting' | 'nn'} [version] Version
	 * @param {'gaussian' | 'polynomial' | { name: 'gaussian', s?: number } | { name: 'polynomial', d?: number } | function (number[], number[]): number} [kernel] Kernel name
	 */
	constructor(c = 1, b = 10, version = 'simple', kernel = 'gaussian') {
		this._c = c
		this._b = b
		this._version = version
		if (typeof kernel === 'function') {
			this._kernel = kernel
		} else {
			if (typeof kernel === 'string') {
				kernel = { name: kernel }
			}
			switch (kernel.name) {
				case 'gaussian':
					this._s = kernel.s ?? 1
					this._kernel = (a, b) =>
						Math.exp(-(a.reduce((s, v, i) => s + (v - b[i]) ** 2, 0) ** 2) / this._s ** 2)
					break
				case 'polynomial':
					this._d = kernel.d ?? 2
					this._kernel = (a, b) => (1 + a.reduce((s, v, i) => s + v * b[i])) ** this._d
					break
			}
		}

		this._sv = []
		this._nn = 1
	}

	/**
	 * Fit model.
	 * @param {Array<Array<number>>} x Training data
	 * @param {Array<1 | -1>} y Target values
	 */
	fit(x, y) {
		for (let t = 0; t < x.length; t++) {
			let s = 0
			for (let k = 0; k < this._sv.length; k++) {
				const sk = this._sv[k]
				s += sk.a * this._kernel(x[t], sk.x)
			}
			const hl = Math.max(0, 1 - y[t] * s)
			if (hl === 0) {
				continue
			}
			const at = y[t] * Math.min(this._c, hl / x[t].reduce((s, v) => s + v ** 2, 0))
			if (this._sv.length < this._b) {
				this._sv.push({ x: x[t], a: at })
				continue
			}

			if (this._version === 'simple') {
				const ktt = this._kernel(x[t], x[t])
				const tau = Math.min(this._c, hl / ktt)
				let min_q = (at ** 2 * ktt) / 2 + this._c * hl
				let r_star = -1
				let beta_t = -1
				for (let r = 0; r < this._sv.length; r++) {
					const sk = this._sv[r]
					const krt = this._kernel(sk.x, x[t])
					const beta = (sk.a * krt) / ktt + tau * y[t]
					const sr = s - sk.a * krt + beta * ktt
					const q =
						(sk.a ** 2 * this._kernel(sk.x, sk.x) + beta ** 2 * ktt - 2 * sk.a * beta * krt) / 2 +
						this._c * Math.max(0, 1 - y[t] * sr)
					if (q < min_q) {
						min_q = q
						r_star = r
						beta_t = beta
					}
				}
				if (r_star >= 0) {
					this._sv.splice(r_star, 1)
					this._sv.push({ x: x[t], a: beta_t })
				}
			} else if (this._version === 'projecting') {
				const Kall = new Matrix(this._sv.length + 1, this._sv.length + 1)
				for (let r = 0; r < this._sv.length; r++) {
					Kall.set(r, r, this._kernel(this._sv[r].x, this._sv[r].x))
					for (let q = 0; q < r; q++) {
						const kv = this._kernel(this._sv[r].x, this._sv[q].x)
						Kall.set(r, q, kv)
						Kall.set(q, r, kv)
					}
					const kt = this._kernel(this._sv[r].x, x[t])
					Kall.set(r, this._sv.length, kt)
					Kall.set(this._sv.length, r, kt)
				}
				Kall.set(this._sv.length, this._sv.length, this._kernel(x[t], x[t]))

				let min_q = Infinity
				let r_star = -1
				let best_beta = null
				for (let r = 0; r < Kall.rows; r++) {
					const K = Kall.copy()
					K.remove(r, 0)
					const Kr = K.col(r)
					const Kt = K.col(this._sv.length)
					K.remove(r, 1)
					const Kinv = K.inv()

					const sk = r < this._sv.length ? this._sv[r] : { x: x[t], a: at }
					const Kinvkr = Kinv.dot(Kr)
					const Kinvkt = Kinv.dot(Kt)
					const tau = Math.min(
						this._c,
						Math.max(
							0,
							(1 - y[t] * (s - sk.a * Kall.at(r, this._sv.length) + sk.a * Kinvkr.tDot(Kt).toScaler())) /
								Kinvkt.tDot(Kt).toScaler()
						)
					)
					const beta = Matrix.mult(Kinvkr, sk.a)
					beta.add(Matrix.mult(Kinvkt, y[t] * tau))

					let q = sk.a ** 2 * Kall.at(r, r)
					for (let i = 0; i < K.rows; i++) {
						q += beta.at(i, 0) ** 2 * K.at(i, i)
						for (let j = 0; j < i; j++) {
							q += 2 * beta.at(i, 0) * beta.at(j, 0) * K.at(i, j)
						}
						q -= 2 * sk.a * beta.at(i, 0) * Kr.at(i, 0)
					}
					if (q < min_q) {
						min_q = q
						r_star = r
						best_beta = beta
					}
				}
				if (0 <= r_star && r_star < this._sv.length) {
					this._sv.splice(r_star, 1)
					this._sv.push({ x: x[t], a: 0 })
					for (let i = 0; i < this._sv.length; i++) {
						this._sv[i].a += best_beta.at(i, 0)
					}
				}
			} else if (this._version === 'nn') {
				const distances = Array.from({ length: this._sv.length + 1 }, () => [])
				for (let r = 0; r < this._sv.length; r++) {
					const sk = this._sv[r]
					distances[r][r] = [Infinity, -1]
					for (let k = 0; k < r && k < this._sv.length; k++) {
						const d = sk.x.reduce((s, v, i) => s + (v - this._sv[k].x[i]) ** 2, 0)
						distances[r][k] = [d, k]
						distances[k][r] = [d, r]
					}
					distances[this._sv.length][r] = [x[t].reduce((s, v, i) => s + (v - sk.x[i]) ** 2, 0), r]
				}
				let min_q = Infinity
				let r_star = -1
				let best_beta = null
				let nns = []
				for (let r = 0; r <= this._sv.length; r++) {
					const sk = r < this._sv.length ? this._sv[r] : { x: x[t], a: at }
					distances[r].sort((a, b) => a[0] - b[0])
					const nnidx = distances[r].map(v => v[1])

					const K = new Matrix(this._nn + 1, this._nn + 1)
					const Kr = new Matrix(this._nn + 1, 1)
					for (let i = 0; i < this._nn; i++) {
						K.set(i, i, this._kernel(this._sv[nnidx[i]].x, this._sv[nnidx[i]].x))
						for (let j = 0; j < i; j++) {
							const kij = this._kernel(this._sv[nnidx[i]].x, this._sv[nnidx[j]].x)
							K.set(i, j, kij)
							K.set(j, i, kij)
						}
						const kit = this._kernel(this._sv[nnidx[i]].x, x[t])
						K.set(i, this._nn, kit)
						K.set(this._nn, i, kit)
						Kr.set(i, 0, this._kernel(sk.x, this._sv[nnidx[i]].x))
					}
					K.set(this._nn, this._nn, this._kernel(x[t], x[t]))
					Kr.set(this._nn, 0, this._kernel(sk.x, x[t]))
					const Kt = K.col(1)
					const Kinv = K.inv()

					const Kinvkr = Kinv.dot(Kr)
					const Kinvkt = Kinv.dot(Kt)
					const tau = Math.min(
						this._c,
						Math.max(
							0,
							(1 - y[t] * (s - sk.a * Kr.at(1, 0) + sk.a * Kinvkr.tDot(Kt).toScaler())) /
								Kinvkt.tDot(Kt).toScaler()
						)
					)
					const beta = Matrix.mult(Kinvkr, sk.a)
					beta.add(Matrix.mult(Kinvkt, y[t] * tau))

					let q = sk.a ** 2 * this._kernel(sk.x, sk.x)
					for (let i = 0; i < K.rows; i++) {
						q += beta.at(i, 0) ** 2 * K.at(i, i)
						for (let j = 0; j < i; j++) {
							q += 2 * beta.at(i, 0) * beta.at(j, 0) * K.at(i, j)
						}
						q -= 2 * sk.a * beta.at(i, 0) * Kr.at(i, 0)
					}
					if (q < min_q) {
						min_q = q
						r_star = r
						best_beta = beta
						nns = nnidx.slice(0, this._nn)
					}
				}
				if (0 <= r_star && r_star < this._sv.length) {
					this._sv.splice(r_star, 1)
					this._sv.push({ x: x[t], a: best_beta.at(this._nn, 0) })
					for (let i = 0; i < nns.length; i++) {
						this._sv[nns[i]].a += best_beta.at(i, 0)
					}
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
			for (let k = 0; k < this._sv.length; k++) {
				const sk = this._sv[k]
				s += sk.a * this._kernel(data[i], sk.x)
			}
			pred[i] = s < 0 ? -1 : 1
		}
		return pred
	}
}
