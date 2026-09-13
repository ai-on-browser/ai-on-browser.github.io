import Matrix from '../util/matrix.js'

import Histogram from './histogram.js'

/**
 * Polynomial histogram
 */
export default class PolynomialHistogram {
	// https://web.maths.unsw.edu.au/~yanan/astro2017_files/slides/IngeKoch.pdf
	// Polynomial Histogramによる多次元ノンパラメトリック確率密度推定(2010)
	// https://www.terrapub.co.jp/journals/jjssj/pdf/3902/39020265.pdf
	/**
	 * @param {number} [p] Order
	 * @param {number} [h] Bin size
	 */
	constructor(p = 2, h = 0.1) {
		this._p = p
		this._a = []
		this._h = h
		this._d = null
	}

	/**
	 * Fit model.
	 * @param {Array<Array<number>>} x Training data
	 */
	fit(x) {
		this._a = []
		this._hist = new Histogram({ size: this._h })
		const b = this._hist.fit(x)
		const d = this._hist._separate_datas
		this._ranges = this._hist._ranges
		this._d = this._ranges.length
		if (this._p === 0) {
			this._a[0] = b.map(v => v / x.length)
			return
		}
		for (let i = 0; i < b.length; i++) {
			if (b[i] === 0) {
				continue
			}
			const p = this._hist._to_index(i)
			const m = this._ranges.map((r, k) => (r[p[k] + 1] + r[p[k]]) / 2)
			for (let j = 0; j < d[i].length; j++) {
				for (let k = 0; k < d[i][j].length; k++) {
					d[i][j][k] -= m[k]
				}
			}
		}
		const ignore_1d_case = false
		if (ignore_1d_case && this._ranges.length === 1) {
		} else {
			if (this._p === 1) {
				this._a[0] = b.map(v => v / (x.length * this._h ** this._d))
				this._a[1] = this._a[0].map((v, i) => {
					if (v === 0) {
						return Matrix.zeros(1, this._d)
					}
					const s1 = Matrix.fromArray(d[i]).mean(0)
					s1.mult((12 * v) / this._h ** 2)
					return s1
				})
			} else if (this._p === 2) {
				const s2 = b.map((v, i) => {
					if (v === 0) {
						return Matrix.zeros(this._d, this._d)
					}
					const xi = Matrix.fromArray(d[i])
					const ss = xi.tDot(xi)
					ss.div(xi.rows)
					return ss
				})
				this._a[0] = b.map((v, i) => {
					const a = (4 + 5 * this._d) / 4 - (15 / this._h ** 2) * s2[i].trace()
					return (a * v) / x.length / this._h ** this._d
				})
				this._a[1] = b.map((v, i) => {
					if (v === 0) {
						return Matrix.zeros(1, this._d)
					}
					const s1 = Matrix.fromArray(d[i]).mean(0)
					s1.mult((12 * v) / (this._h ** (this._d + 2) * x.length))
					return s1
				})
				this._a[2] = s2.map((v, i) => {
					for (let j = 0; j < v.rows; j++) {
						for (let k = 0; k < v.cols; k++) {
							if (j === k) {
								v.set(j, k, (180 / this._h ** 2) * v.at(j, k) - 15)
							} else {
								v.multAt(j, k, 144 / (2 * this._h ** 2))
							}
						}
					}
					v.mult(b.at(i) / x.length / this._h ** (this._d + 2))
					return v
				})
			}
		}
	}

	/**
	 * Returns predicted dencity.
	 * @param {Array<Array<number>>} x Sample data
	 * @returns {number[]} Predicted values
	 */
	predict(x) {
		const p = []
		for (let i = 0; i < x.length; i++) {
			const idx = this._hist._data_to_index(x[i])
			if (!idx) {
				p.push(0)
				continue
			}
			const pos = this._hist._to_pos(idx)
			const a = this._a.map(v => v[pos])
			const xi = Matrix.fromArray(x[i])
			const m = Matrix.fromArray(this._ranges.map((r, k) => (r[idx[k] + 1] + r[idx[k]]) / 2))
			xi.sub(m)
			const ignore_1d_case = false
			if (ignore_1d_case && this._ranges.length === 1) {
			} else {
				if (this._p === 0) {
					p.push(a[0])
				} else if (this._p === 1) {
					p.push(Math.max(0, a[0] + a[1].dot(xi).toScaler()))
				} else if (this._p === 2) {
					p.push(Math.max(0, a[0] + a[1].dot(xi).toScaler() + xi.tDot(a[2]).dot(xi).toScaler()))
				}
			}
		}
		return p
	}
}
