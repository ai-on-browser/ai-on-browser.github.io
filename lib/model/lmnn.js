import { Matrix } from '../util/math.js'

/**
 * Large Margin Nearest Neighbor
 */
export default class LMNN {
	// https://en.wikipedia.org/wiki/Large_margin_nearest_neighbor
	// Large Margin Nearest Neighbor の分類精度向上を目的とした学習データの重み付けに関する一考察
	// http://www.it.mgmt.waseda.ac.jp/results/student1/2014-M2-Yamazaki.pdf
	/**
	 * @param {number} gamma
	 * @param {number} lambda
	 */
	constructor(gamma, lambda) {
		this._classes = []
		this._alpha = 0.1
		this._gamma = gamma
		this._h = lambda
		this._m = null
	}

	/**
	 * Initialize model.
	 * @param {Array<Array<number>>} x
	 * @param {Array<number>} y
	 */
	init(x, y) {
		this._classes = [...new Set(y)]
		this._x = Matrix.fromArray(x)
		this._y = y

		this._m = Matrix.zeros(this._x.cols, this._x.cols)

		this._neighbors = []
		this._impostors = []
		for (let k = 0; k < this._classes.length; k++) {
			const t = this._y
				.map((v, i) => [v, i])
				.filter(v => v[0] === this._classes[k])
				.map(v => v[1])
			const xt = this._x.row(t)
			for (let i = 0; i < t.length; i++) {
				const d = xt.copySub(this._x.row(t[i]))
				d.remove(i, 0)
				d.map(v => v ** 2)
				const ds = d.sum(1)
				const sidx = ds.sort(0)
				this._neighbors[t[i]] = sidx.slice(0, Math.min(this._gamma, sidx.length)).map(v => t[v])
			}
			const n = this._y
				.map((v, i) => [v, i])
				.filter(v => v[0] !== this._classes[k])
				.map(v => v[1])
			const xn = this._x.row(n)
			for (let i = 0; i < t.length; i++) {
				const d = xn.copySub(this._x.row(t[i]))
				d.map(v => v ** 2)
				const ds = d.sum(1)
				const sidx = ds.sort(0)
				this._impostors[t[i]] = sidx.slice(0, Math.min(this._gamma, sidx.length)).map(v => n[v])
			}
		}
	}

	/**
	 * Fit model.
	 */
	fit() {
		const dm = Matrix.zeros(this._x.cols, this._x.cols)
		for (let i = 0; i < this._neighbors.length; i++) {
			const xi = this._x.row(i)
			for (let k = 0; k < this._neighbors[i].length; k++) {
				const d = xi.copySub(this._x.row(this._neighbors[i][k]))
				const c = d.tDot(d)
				dm.add(c)

				for (let k = 0; k < this._impostors[i].length; k++) {
					const d2 = xi.copySub(this._x.row(this._impostors[i][k]))
					const c2 = c.copySub(d2.tDot(d2))
					c2.mult(this._h)
					dm.add(c2)
				}
			}
		}
		dm.mult(this._alpha)

		this._m.sub(dm)
	}

	/**
	 * Returns predicted categories.
	 * @param {Array<Array<number>>} points
	 * @returns {number[]}
	 */
	predict(x) {
		return x.map(r => {
			const xi = Matrix.fromArray(r)
			const diff = this._x.copySub(xi.t)
			const d = diff.dot(this._m)
			d.mult(diff)
			const s = d.sum(1)
			return this._y[s.argmin(0).toScaler()]
		})
	}
}
