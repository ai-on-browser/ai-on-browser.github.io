import Tensor from '../util/tensor.js'
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
		const histogram = new Histogram({ size: this._h })
		const b = Tensor.fromArray(histogram.fit(x))
		const d = histogram._separate_datas
		this._ranges = histogram._ranges
		this._d = this._ranges.length
		if (this._p === 0) {
			b.map(v => v / x.length)
			this._a[0] = b
			return
		}
		b.forEach((v, i) => {
			if (v === 0) {
				return
			}
			const di = i.reduce((di, k) => di[k], d)
			const m = this._ranges.map((r, k) => (r[i[k] + 1] + r[i[k]]) / 2)
			for (let n = 0; n < di.length; n++) {
				for (let d = 0; d < di[n].length; d++) {
					di[n][d] -= m[d]
				}
			}
		})
		if (false && this._ranges.length === 1) {
		} else {
			if (this._p === 1) {
				this._a[0] = b.copy()
				this._a[0].map(v => v / (x.length * this._h ** this._d))
				this._a[1] = this._a[0].copy()
				this._a[1].map((v, i) => {
					if (v === 0) {
						return Matrix.zeros(1, this._d)
					}
					const di = i.reduce((di, k) => di[k], d)
					const s1 = Matrix.fromArray(di).mean(0)
					s1.mult((12 * v) / this._h ** 2)
					return s1
				})
			} else if (this._p === 2) {
				const s2 = b.copy()
				s2.map((v, i) => {
					if (v === 0) {
						return Matrix.zeros(this._d, this._d)
					}
					const di = i.reduce((di, k) => di[k], d)
					const xi = Matrix.fromArray(di)
					const ss = xi.tDot(xi)
					ss.div(xi.rows)
					return ss
				})
				this._a[0] = b.copy()
				this._a[0].map((v, i) => {
					const a = (4 + 5 * this._d) / 4 - (15 / this._h ** 2) * s2.at(i).trace()
					return (a * v) / x.length / this._h ** this._d
				})
				this._a[1] = b.copy()
				this._a[1].map((v, i) => {
					if (v === 0) {
						return Matrix.zeros(1, this._d)
					}
					const di = i.reduce((di, k) => di[k], d)
					const s1 = Matrix.fromArray(di).mean(0)
					s1.mult((12 * v) / (this._h ** (this._d + 2) * x.length))
					return s1
				})
				this._a[2] = s2
				this._a[2].map((v, i) => {
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
			const idx = []
			for (let k = 0; k < this._ranges.length; k++) {
				let t = -1
				for (; t < this._ranges[k].length - 1; t++) {
					if (x[i][k] <= this._ranges[k][t + 1]) {
						break
					}
				}
				idx.push(t)
			}
			if (idx.some((v, k) => v < 0 || v >= this._ranges[k].length - 1)) {
				p.push(0)
				continue
			}
			const a = this._a.map(v => v.at(idx))
			const xi = Matrix.fromArray(x[i])
			const m = Matrix.fromArray(this._ranges.map((r, k) => (r[idx[k] + 1] + r[idx[k]]) / 2))
			xi.sub(m)
			if (false && this._ranges.length === 1) {
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
