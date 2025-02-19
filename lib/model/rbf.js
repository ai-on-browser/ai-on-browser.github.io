import Matrix from '../util/matrix.js'

const rbfs = {
	linear: () => (x, c) => Math.sqrt(x.reduce((s, v, i) => s + (v - c[i]) ** 2, 0)),
	gaussian: e => (x, c) => Math.exp(-x.reduce((s, v, i) => s + (v - c[i]) ** 2, 0) * e ** 2),
	multiquadric: e => (x, c) => Math.sqrt(1 + x.reduce((s, v, i) => s + (v - c[i]) ** 2, 0) * e ** 2),
	'inverse quadratic': e => (x, c) => 1 / (1 + x.reduce((s, v, i) => s + (v - c[i]) ** 2, 0) * e ** 2),
	'inverse multiquadric': e => (x, c) => 1 / Math.sqrt(1 + x.reduce((s, v, i) => s + (v - c[i]) ** 2, 0) * e ** 2),
	'thin plate': () => (x, c) => {
		const r = x.reduce((s, v, i) => s + (v - c[i]) ** 2, 0)
		return r === 0 ? 0 : r * Math.log(Math.sqrt(r))
	},
	bump: e => (x, c) => {
		const r = x.reduce((s, v, i) => s + (v - c[i]) ** 2, 0)
		if (Math.sqrt(r) < 1 / e) {
			return Math.exp(-1 / (1 - r * e ** 2))
		}
		return 0
	},
}

/**
 * Radial basis function network
 */
export default class RadialBasisFunctionNetwork {
	// https://qiita.com/sus304/items/1eeb22d4456c2fb1717d
	// http://yuki-koyama.hatenablog.com/entry/2014/05/04/132552
	// https://ja.wikipedia.org/wiki/%E6%94%BE%E5%B0%84%E5%9F%BA%E5%BA%95%E9%96%A2%E6%95%B0
	/**
	 * @param {'linear' | 'gaussian' | 'multiquadric' | 'inverse quadratic' | 'inverse multiquadric' | 'thin plate' | 'bump'} [rbf] RBF name
	 * @param {number} [e] Tuning parameter
	 * @param {number} [l] Regularization parameter
	 */
	constructor(rbf = 'linear', e = 1, l = 0) {
		this._f = rbfs[rbf](e)
		if ((rbf === 'linear' || rbf === 'thin plate') && l === 0) {
			l = 1.0e-8
		}
		this._l = l
	}

	/**
	 * Fit model.
	 * @param {Array<Array<number>>} x Training data
	 * @param {Array<Array<number>>} y Target values
	 */
	fit(x, y) {
		this._x = x
		this._w = []
		const n = x.length
		const f = Matrix.zeros(n, n)
		for (let i = 0; i < n; i++) {
			for (let j = i; j < n; j++) {
				const d = this._f(x[i], x[j])
				f.set(i, j, d)
				f.set(j, i, d)
			}
		}
		if (this._l > 0) {
			f.add(Matrix.eye(n, n, this._l))
		}
		this._w = f.solve(Matrix.fromArray(y))
	}

	/**
	 * Returns predicted values.
	 * @param {Array<Array<number>>} target Sample data
	 * @returns {number[]} Predicted values
	 */
	predict(target) {
		return target.map(t => {
			let s = 0
			for (let i = 0; i < this._x.length; i++) {
				s += this._w.at(i, 0) * this._f(t, this._x[i])
			}
			return s
		})
	}
}
