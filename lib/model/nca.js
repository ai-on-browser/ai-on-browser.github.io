import Matrix from '../util/matrix.js'

/**
 * Neighbourhood components analysis
 */
export default class NeighbourhoodComponentsAnalysis {
	// https://en.wikipedia.org/wiki/Neighbourhood_components_analysis
	// https://jp.mathworks.com/help/stats/neighborhood-component-analysis.html
	/**
	 * @param {number} [d] Reduced dimension
	 * @param {number} [lr] Learning rate
	 */
	constructor(d = null, lr = 0.1) {
		this._w = null
		this._d = d
		this._lr = lr
	}

	/**
	 * Fit model.
	 * @param {Array<Array<number>>} x Training data
	 * @param {number[]} y Target values
	 */
	fit(x, y) {
		x = Matrix.fromArray(x)
		if (!this._w) {
			this._w = Matrix.randn(this._d || x.cols, x.cols)
		}
		x.sub(x.mean(0))
		x.div(x.variance(0))
		const n = x.rows
		const xij = []
		for (let i = 0; i < n; xij[i++] = []);
		for (let i = 0; i < n; i++) {
			const xi = x.row(i)
			xij[i][i] = Matrix.sub(xi, xi)
			for (let j = 0; j < i; j++) {
				const v = Matrix.sub(xi, x.row(j))
				xij[i][j] = v
				xij[j][i] = Matrix.map(v, v => -v)
			}
		}
		const p = new Matrix(n, n)
		for (let i = 0; i < n; i++) {
			p.set(i, i, 0)
			for (let j = 0; j < i; j++) {
				const d = Matrix.mult(xij[i][j], this._w)
				const v = Math.exp(-(d.norm() ** 2))
				p.set(i, j, v)
				p.set(j, i, v)
			}
		}
		p.div(p.sum(1))

		const pi = []
		for (let i = 0; i < n; i++) {
			pi[i] = 0
			for (let j = 0; j < n; j++) {
				if (y[i] === y[j]) {
					pi[i] += p.at(i, j)
				}
			}
		}

		const dw0 = Matrix.zeros(this._w.cols, this._w.cols)
		for (let i = 0; i < n; i++) {
			const xtx = []
			for (let k = 0; k < n; k++) {
				const x_ik = xij[i][k]
				xtx[k] = x_ik.tDot(x_ik)
				dw0.add(Matrix.mult(xtx[k], p.at(i, k) * pi[i]))
			}
			for (let j = 0; j < n; j++) {
				if (y[i] !== y[j]) {
					continue
				}
				const xx = xtx[j]
				xx.mult(p.at(i, j))
				dw0.sub(xx)
			}
		}
		const dw = this._w.dot(dw0)
		dw.mult(2 * this._lr)
		this._w.sub(dw)
	}

	/**
	 * Returns importances of the features.
	 * @returns {number[]} Importances
	 */
	importance() {
		return this._w.mean(0).value
	}

	/**
	 * Returns reduced datas.
	 * @param {Array<Array<number>>} x Sample data
	 * @returns {Array<Array<number>>} Predicted values
	 */
	predict(x) {
		return Matrix.fromArray(x).dot(this._w.t).toArray()
	}
}
