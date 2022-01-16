import { Matrix } from '../util/math.js'

/**
 * Label propagation
 */
export default class LabelPropagation {
	// https://satomacoto.blogspot.com/2012/07/python.html
	// https://qiita.com/MasafumiTsuyuki/items/910b85fb14f7f6bf8853
	// http://yamaguchiyuto.hatenablog.com/entry/2016/09/22/014202
	// https://github.com/scikit-learn/scikit-learn/blob/15a949460/sklearn/semi_supervised/_label_propagation.py
	/**
	 * @param {'rbf' | 'knn'} [method=rbf]
	 * @param {number} [sigma=0.1]
	 * @param {number} [k=Infinity]
	 */
	constructor(method = 'rbf', sigma = 0.1, k = Infinity) {
		this._k = k
		this._sigma = sigma
		this._affinity = method
	}

	_affinity_matrix(x) {
		const n = x.rows
		const distances = Matrix.zeros(n, n)
		for (let i = 0; i < n; i++) {
			for (let j = i + 1; j < n; j++) {
				let d = x.row(i).copySub(x.row(j)).norm()
				distances.set(i, j, d)
				distances.set(j, i, d)
			}
		}

		const con = Matrix.zeros(n, n)
		if (this._k >= n) {
			con.fill(1)
		} else if (this._k > 0) {
			for (let i = 0; i < n; i++) {
				const di = distances.row(i).value.map((v, i) => [v, i])
				di.sort((a, b) => a[0] - b[0])
				for (let j = 1; j < Math.min(this._k + 1, di.length); j++) {
					con.set(i, di[j][1], 1)
				}
			}
			con.add(con.t)
			con.div(2)
		}

		if (this._affinity === 'rbf') {
			return distances.copyMap((v, i) => (con.at(i) > 0 ? Math.exp(-(v ** 2) / this._sigma ** 2) : 0))
		} else if (this._affinity === 'knn') {
			return con.copyMap(v => (v > 0 ? 1 : 0))
		}
	}

	/**
	 * Initialize model.
	 *
	 * @param {Array<Array<number>>} x
	 * @param {(* | null)[]} y
	 */
	init(x, y) {
		x = Matrix.fromArray(x)
		const n = x.rows
		this._y = y
		const classes = new Set()
		for (let i = 0; i < n; i++) {
			if (this._y[i] != null) {
				classes.add(this._y[i])
			}
		}
		this._classes = [...classes]

		this._w = this._affinity_matrix(x)

		this._probs = Matrix.zeros(n, this._classes.length)
		for (let i = 0; i < n; i++) {
			if (this._y[i] != null) {
				this._probs.set(i, this._classes.indexOf(this._y[i]), 1)
			}
		}
	}

	/**
	 * Fit model.
	 */
	fit() {
		const newProb = this._w.dot(this._probs)
		newProb.div(newProb.sum(1))
		for (let i = 0; i < this._y.length; i++) {
			if (this._y[i] == null) {
				this._probs.set(i, 0, newProb.row(i))
			}
		}
	}

	/**
	 * Returns predicted categories.
	 *
	 * @returns {*[]}
	 */
	predict() {
		return this._probs.argmax(1).value.map(v => this._classes[v])
	}
}
