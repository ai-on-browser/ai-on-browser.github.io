import Matrix from '../util/matrix.js'

/**
 * Selective sampling second-order Perceptron
 */
export default class SelectiveSamplingSOP {
	// Online Learning: A Comprehensive Survey
	// https://arxiv.org/abs/1802.02871
	// Worst-case analysis of selective sampling for linear classification.
	// https://www.jmlr.org/papers/volume7/cesa-bianchi06b/cesa-bianchi06b.pdf
	/**
	 * @param {number} b Smooth parameter
	 */
	constructor(b) {
		this._b = b
	}

	/**
	 * Initialize this model.
	 * @param {Array<Array<number>>} train_x Training data
	 * @param {Array<1 | -1>} train_y Target values
	 */
	init(train_x, train_y) {
		this._x = Matrix.fromArray(train_x)
		this._shift = this._x.mean(0)
		this._x.sub(this._shift)
		this._y = train_y

		this._d = this._x.cols
		this._v = Matrix.zeros(this._d, 1)
		this._s = Matrix.eye(this._d, this._d)
	}

	/**
	 * Update model parameters with one data.
	 * @param {Matrix} x Training data
	 * @param {1 | -1} y Target value
	 */
	update(x, y) {
		const w = Matrix.add(this._s, x.dot(x.t)).solve(this._v)
		const ph = w.tDot(x).toScaler()
		const yh = ph <= 0 ? -1 : 1
		const z = this._b / (this._b * Math.abs(ph))
		if (z && y !== yh) {
			this._v.add(Matrix.mult(x, y))
			this._s.add(x.dot(x.t))
		}
	}

	/**
	 * Fit model parameters.
	 */
	fit() {
		for (let i = 0; i < this._x.rows; i++) {
			this.update(this._x.row(i).t, this._y[i])
		}
	}

	/**
	 * Returns predicted datas.
	 * @param {Array<Array<number>>} data Sample data
	 * @returns {(1 | -1)[]} Predicted values
	 */
	predict(data) {
		const x = Matrix.fromArray(data)
		x.sub(this._shift)
		const w = this._s.solve(this._v)
		const r = x.dot(w)
		return r.value.map(v => (v <= 0 ? -1 : 1))
	}
}
