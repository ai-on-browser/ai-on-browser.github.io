import Matrix from '../util/matrix.js'

/**
 * k-SVD
 */
export default class KSVD {
	// https://en.wikipedia.org/wiki/K-SVD
	// https://hotoke-x.hatenablog.com/entry/2020/06/10/232140
	// https://qiita.com/kibo35/items/67dedba4ea464cc494b0
	// https://www.ieice.org/ess/sita/forum/article/2015/201512081915.pdf
	// https://www.cs.technion.ac.il/~ronrubin/Publications/KSVD-OMP-v2.pdf
	/**
	 * @param {Array<Array<number>>} x Training data
	 * @param {number} m Reduced dimension
	 * @param {number} [k] Sparsity parameter
	 */
	constructor(x, m, k = m) {
		this._y = Matrix.fromArray(x)
		this._m = m
		this._k = k
		this._d = Matrix.randn(this._y.cols, m)
		this._d.div(Matrix.map(Matrix.map(this._d, v => v ** 2).mean(0), Math.sqrt))
	}

	/**
	 * Fit model and returns error.
	 * @returns {number} Error
	 */
	fit() {
		const x = new Matrix(this._y.rows, this._m)
		for (let i = 0; i < this._y.rows; i++) {
			const xi = this._omp(this._y.row(i).t)
			x.set(i, 0, xi.t)
		}
		for (let j = 0; j < this._m; j++) {
			const using = x.col(j).value.map(v => v !== 0)
			const e = this._y.row(using)
			e.sub(x.row(using).dot(this._d.t))

			const [u, s, v] = e.svd()
			this._d.set(0, j, v.row(0).t)
			for (let i = 0, t = 0; i < using.length; i++) {
				if (using[i]) {
					x.set(i, j, u.at(t, 0) * s[0])
					t++
				}
			}
		}
		this._r = x
		const err = Matrix.sub(this._y, this._r.dot(this._d.t)).norm() ** 2
		return err
	}

	_omp(y) {
		const x = Matrix.zeros(this._m, 1)
		let r = y
		const s = []

		for (let i = 0; i < this._k; i++) {
			let min_e = Infinity
			let min_i = -1
			for (let k = 0; k < this._m; k++) {
				if (s.includes(k)) {
					continue
				}
				const a = this._d.col(k)
				const e = r.norm() ** 2 - a.tDot(r).toScaler() ** 2 / (a.norm() ** 2 + 1.0e-12)
				if (e < min_e) {
					min_e = e
					min_i = k
				}
			}
			s.push(min_i)

			const as = this._d.col(s)
			const xs = as.tDot(as).solve(as.tDot(y))
			for (let i = 0; i < s.length; i++) {
				x.set(s[i], 0, xs.row(i))
			}
			r = Matrix.sub(y, as.dot(xs))

			if (r.norm() < 1.0e-8) {
				break
			}
		}
		return x
	}

	/**
	 * Returns reduced values.
	 * @returns {Array<Array<number>>} Predicted values
	 */
	predict() {
		return this._r.toArray()
	}
}
