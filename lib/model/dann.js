import Matrix from '../util/matrix.js'

/**
 * Discriminant adaptive nearest neighbor
 */
export default class DiscriminantAdaptiveNearestNeighbor {
	// Discriminant Adaptive Nearest Neighbor Classification
	// https://www.aaai.org/Papers/KDD/1995/KDD95-055.pdf
	/**
	 * @param {number} [k=null] Number of neighborhoods
	 */
	constructor(k = null) {
		this._k = k
		this._e = 1
		this._phi = (d, h) => {
			if (d < h) {
				return (1 - (d / h) ** 3) ** 3
			}
			return 0
		}
	}

	/**
	 * Fit model.
	 *
	 * @param {Array<Array<number>>} x Training data
	 * @param {*[]} y Target values
	 */
	fit(x, y) {
		this._x = Matrix.fromArray(x)
		this._y = y
		this._c = [...new Set(y)]

		this._mean = this._x.mean(0)
		this._cmean = []
		for (let i = 0; i < this._c.length; i++) {
			const xi = x.filter((v, t) => this._y[t] === this._c[i])
			this._cmean[i] = Matrix.fromArray(xi).mean(0)
		}
	}

	/**
	 * Returns predicted categories.
	 *
	 * @param {Array<Array<number>>} data Sample data
	 * @param {number} [iteration=1] Iteration count
	 * @returns {*[]} Predicted values
	 */
	predict(data, iteration = 1) {
		const n = this._x.rows
		const d = this._x.cols
		const kcnt = this._k ?? Math.min(n / 5, 50)
		const xs = []
		for (let i = 0; i < n; i++) {
			xs[i] = this._x.row(i)
		}
		return data.map(v => {
			const x = new Matrix(1, v.length, v)
			let s = Matrix.eye(d, d)
			const dx = Matrix.sub(x, this._x)
			let spherical_x = Matrix.concat(this._x, x, 0)

			for (let t = 0; t < iteration; t++) {
				const ss = s.sqrt()
				spherical_x = spherical_x.dot(ss)

				const ds = dx.dot(ss)
				ds.map(v => v ** 2)
				const dss = ds.sum(1)
				dss.map(Math.sqrt)
				const h = dss.max()
				const w = dss.value.map(v => this._phi(v, h))

				let ws = 0
				const pi = Array(this._c.length).fill(0)
				const W = Matrix.zeros(d, d)
				for (let i = 0; i < n; i++) {
					if (w[i] === 0) {
						continue
					}
					const cidx = this._c.indexOf(this._y[i])
					const xd = Matrix.sub(xs[i], this._cmean[cidx])
					const wi = xd.tDot(xd)
					wi.mult(w[i])
					W.add(wi)
					pi[cidx] += w[i]
					ws += w[i]
				}
				W.div(ws)

				const B = Matrix.zeros(d, d)
				for (let k = 0; k < this._c.length; k++) {
					if (pi[k] === 0) {
						continue
					}
					const xc = Matrix.sub(this._cmean[k], this._mean)
					const bk = xc.tDot(xc)
					bk.mult(pi[k] / ws)
					B.add(bk)
				}

				const Wsqrt = W.sqrt()
				const Bstar = Wsqrt.dot(B).dot(Wsqrt)
				Bstar.add(Matrix.eye(d, d, this._e))

				s = Wsqrt.dot(Bstar).dot(Wsqrt)
			}

			const ss = s.sqrt()
			spherical_x = spherical_x.dot(ss)

			const sx = spherical_x.row(spherical_x.rows - 1)
			spherical_x = spherical_x.slice(0, spherical_x.rows - 1, 0)
			spherical_x.sub(sx)
			spherical_x.map(v => v ** 2)
			const dist = spherical_x.sum(1)
			const idx = dist.sort(0)

			const clss = {}
			for (let k = 0; k < kcnt; k++) {
				const i = idx[k]
				if (!clss[this._y[i]]) {
					clss[this._y[i]] = {
						category: this._y[i],
						count: 1,
						min_d: dist.at(k, 0),
					}
				} else {
					clss[this._y[i]].count++
					clss[this._y[i]].min_d = Math.min(clss[this._y[i]].min_d, dist.at(k, 0))
				}
			}
			let max_count = 0
			let min_dist = -1
			let target_cat = null
			for (const k of Object.keys(clss)) {
				if (max_count < clss[k].count || (max_count === clss[k].count && clss[k].min_d < min_dist)) {
					max_count = clss[k].count
					min_dist = clss[k].min_d
					target_cat = clss[k].category
				}
			}
			return target_cat
		})
	}
}
