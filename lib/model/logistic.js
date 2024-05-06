import Matrix from '../util/matrix.js'

/**
 * Logistic regression
 */
export class LogisticRegression {
	// see http://darden.hatenablog.com/entry/2018/01/27/000544
	constructor() {
		this._W = null
		this._b = 0
	}

	_output(x) {
		let a = x.dot(this._W)
		a.add(this._b)

		return a
	}

	/**
	 * Fit model.
	 * @param {Array<Array<number>>} x Training data
	 * @param {Array<1 | -1>} y Target values
	 * @param {number} [iteration] Iteration count
	 * @param {number} [rate] Learning rate
	 * @param {number} [l1] L1 regularization strength
	 * @param {number} [l2] L2 regularization strength
	 */
	fit(x, y, iteration = 1, rate = 0.1, l1 = 0, l2 = 0) {
		x = Matrix.fromArray(x)
		y = Matrix.fromArray(y)
		if (!this._W) {
			this._W = Matrix.randn(x.cols, 1)
		}
		const m = x.rows
		for (let n = 0; n < iteration; n++) {
			const phi = this._output(x)
			phi.sub(y)

			let dw = x.tDot(phi)
			dw.div(m)
			if (l1 > 0 || l2 > 0) {
				dw.map(v => v + v * l2 + Math.sign(v) * l1)
			}
			dw.mult(rate)
			this._W.sub(dw)

			let db = phi.mean()
			if (l1 > 0 || l2 > 0) {
				db += db * l2 + Math.sign(db) * l1
			}
			this._b -= db * rate
		}
	}

	/**
	 * Returns predicted values.
	 * @param {Array<Array<number>>} points Sample data
	 * @returns {Array<1 | -1>} Predicted values
	 */
	predict(points) {
		const x = Matrix.fromArray(points)

		let a = x.dot(this._W)
		a.add(this._b)

		return a.value.map(v => (v >= 0 ? 1 : -1))
	}
}

/**
 * Multinomial logistic regression
 */
export class MultinomialLogisticRegression {
	// see http://darden.hatenablog.com/entry/2018/01/27/000544
	/**
	 * @param {number[]} [classes] Initial class labels
	 */
	constructor(classes) {
		this._classes = classes
		this._W = null
		this._b = null
	}

	_output(x) {
		let a = x.dot(this._W)
		a.add(this._b)

		a.map(Math.exp)
		a.div(a.sum(1))
		return a
	}

	/**
	 * Fit model.
	 * @param {Array<Array<number>>} train_x Training data
	 * @param {*[]} train_y Target values
	 * @param {number} [iteration] Iteration count
	 * @param {number} [rate] Learning rate
	 * @param {number} [l1] L1 regularization strength
	 * @param {number} [l2] L2 regularization strength
	 */
	fit(train_x, train_y, iteration = 1, rate = 0.1, l1 = 0, l2 = 0) {
		const samples = train_x.length

		if (!this._classes) {
			this._classes = [...new Set(train_y)]
		}

		const x = Matrix.fromArray(train_x)
		const y = new Matrix(samples, this._classes.length)
		train_y.forEach((t, i) => y.set(i, this._classes.indexOf(t), 1))

		if (!this._W) {
			this._W = Matrix.randn(x.cols, this._classes.length)
			this._b = Matrix.randn(1, this._classes.length)
		}

		for (let n = 0; n < iteration; n++) {
			let phi = this._output(x)
			phi.sub(y)

			const dw = x.tDot(phi)
			dw.div(samples)
			if (l1 > 0 || l2 > 0) {
				dw.map(v => v + v * l2 + Math.sign(v) * l1)
			}
			dw.mult(rate)
			this._W.sub(dw)

			const db = phi.mean(0)
			if (l1 > 0 || l2 > 0) {
				db.map(v => v + v * l2 + Math.sign(v) * l1)
			}
			db.mult(rate)
			this._b.sub(db)
		}
	}

	/**
	 * Returns predicted categories.
	 * @param {Array<Array<number>>} points Sample data
	 * @returns {*[]} Predicted values
	 */
	predict(points) {
		const x = Matrix.fromArray(points)

		let a = x.dot(this._W)
		a.add(this._b)

		return a.argmax(1).value.map(v => this._classes[v])
	}
}
