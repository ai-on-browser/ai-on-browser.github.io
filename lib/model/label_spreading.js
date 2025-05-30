import Matrix from '../util/matrix.js'

/**
 * Label spreading
 */
export default class LabelSpreading {
	// http://yamaguchiyuto.hatenablog.com/entry/graph-base-ssl
	// https://github.com/scikit-learn/scikit-learn/blob/15a949460/sklearn/semi_supervised/_label_propagation.py
	/**
	 * @param {number} [alpha] Clamping factor
	 * @param {'rbf' | 'knn' | { name: 'rbf', sigma?: number, k?: number } | { name: 'knn', k?: number }} [method] Method name
	 */
	constructor(alpha = 0.2, method = 'rbf') {
		if (typeof method === 'string') {
			this._affinity = { name: method }
		} else {
			this._affinity = method
		}

		this._alpha = alpha
	}

	_affinity_matrix(x) {
		const n = x.rows
		const distances = Matrix.zeros(n, n)
		for (let i = 0; i < n; i++) {
			for (let j = i + 1; j < n; j++) {
				let d = Matrix.sub(x.row(i), x.row(j)).norm()
				distances.set(i, j, d)
				distances.set(j, i, d)
			}
		}

		const con = Matrix.zeros(n, n)
		const k = this._affinity.k ?? Infinity
		if (k >= n) {
			con.fill(1)
		} else if (k > 0) {
			for (let i = 0; i < n; i++) {
				const di = distances.row(i).value.map((v, i) => [v, i])
				di.sort((a, b) => a[0] - b[0])
				for (let j = 1; j < Math.min(k + 1, di.length); j++) {
					con.set(i, di[j][1], 1)
				}
			}
			con.add(con.t)
			con.div(2)
		}

		if (this._affinity.name === 'rbf') {
			const sigma = this._affinity.sigma ?? 0.1
			return Matrix.map(distances, (v, i) => (con.at(i) > 0 ? Math.exp(-(v ** 2) / sigma ** 2) : 0))
		} else if (this._affinity.name === 'knn') {
			return Matrix.map(con, v => (v > 0 ? 1 : 0))
		}
	}

	_laplacian(x) {
		const n = x.rows
		const w = this._affinity_matrix(x)
		let d = w.sum(1).value
		const l = Matrix.diag(d)
		l.sub(w)
		d = d.map(v => Math.sqrt(v))
		for (let i = 0; i < n; i++) {
			for (let j = 0; j < n; j++) {
				l.set(i, j, l.at(i, j) / (d[i] * d[j]))
			}
		}

		l.map(v => -v)
		for (let i = 0; i < l.rows; i++) {
			l.set(i, i, 0)
		}
		return l
	}

	/**
	 * Initialize model.
	 * @param {Array<Array<number>>} x Training data
	 * @param {(* | null)[]} y Target values
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

		this._l = this._laplacian(x)

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
		this._probs = this._l.dot(this._probs)
		this._probs.mult(this._alpha)
		for (let i = 0; i < this._y.length; i++) {
			if (this._y[i] != null) {
				this._probs.addAt(i, this._classes.indexOf(this._y[i]), 1 - this._alpha)
			}
		}
	}

	/**
	 * Returns predicted categories.
	 * @returns {*[]} Predicted values
	 */
	predict() {
		return this._probs.argmax(1).value.map(v => this._classes[v])
	}
}
