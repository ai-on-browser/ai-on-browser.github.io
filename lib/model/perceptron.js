import Matrix from '../util/matrix.js'

/**
 * Perceptron
 */
export class Perceptron {
	// https://tma15.github.io/blog/2016/07/31/%E5%B9%B3%E5%9D%87%E5%8C%96%E3%83%91%E3%83%BC%E3%82%BB%E3%83%97%E3%83%88%E3%83%AD%E3%83%B3%E3%81%AE%E5%8A%B9%E7%8E%87%E7%9A%84%E3%81%AA%E8%A8%88%E7%AE%97/
	// https://www.think-self.com/machine-learning/perceptron/
	// https://en.wikipedia.org/wiki/Perceptron
	/**
	 * @param {number} rate Learning rate
	 */
	constructor(rate) {
		this._r = rate
	}

	/**
	 * Initialize this model.
	 *
	 * @param {Array<Array<number>>} train_x Training data
	 * @param {Array<1 | -1>} train_y Target values
	 */
	init(train_x, train_y) {
		this._x = Matrix.fromArray(train_x)
		this._y = train_y
		this._epoch = 0

		this._a = Matrix.randn(this._x.cols, 1)
		this._b = 0
	}

	/**
	 * Fit model.
	 */
	fit() {
		const o = this._x.dot(this._a)
		o.map(v => (v + this._b <= 0 ? -1 : 1))
		this._epoch++

		for (let i = 0; i < this._x.rows; i++) {
			if (o.at(i, 0) !== this._y[i]) {
				const d = (this._y[i] - o.at(i, 0)) * this._r
				const xi = this._x.row(i)
				xi.mult(d)
				this._a.add(xi.t)
				this._b += d
			}
		}
	}

	/**
	 * Returns predicted values.
	 *
	 * @param {Array<Array<number>>} data Sample data
	 * @returns {(1 | -1)[]} Predicted values
	 */
	predict(data) {
		const x = Matrix.fromArray(data)
		return x.dot(this._a).value.map(v => (v + this._b <= 0 ? -1 : 1))
	}
}

/**
 * Averaged perceptron
 */
export class AveragedPerceptron {
	// https://tma15.github.io/blog/2016/07/31/%E5%B9%B3%E5%9D%87%E5%8C%96%E3%83%91%E3%83%BC%E3%82%BB%E3%83%97%E3%83%88%E3%83%AD%E3%83%B3%E3%81%AE%E5%8A%B9%E7%8E%87%E7%9A%84%E3%81%AA%E8%A8%88%E7%AE%97/
	// https://www.think-self.com/machine-learning/perceptron/
	/**
	 * @param {number} rate Learning rate
	 */
	constructor(rate) {
		this._r = rate
	}

	/**
	 * Initialize this model.
	 *
	 * @param {Array<Array<number>>} train_x Training data
	 * @param {Array<1 | -1>} train_y Target values
	 */
	init(train_x, train_y) {
		this._x = Matrix.fromArray(train_x)
		this._y = train_y
		this._epoch = 0

		this._a = Matrix.randn(this._x.cols, 1)
		this._atotal = Matrix.zeros(this._x.cols, 1)
		this._b = 0
		this._btotal = 0
	}

	/**
	 * Fit model.
	 */
	fit() {
		const o = this._x.dot(this._a)
		o.map(v => (v + this._b <= 0 ? -1 : 1))
		this._epoch++

		for (let i = 0; i < this._x.rows; i++) {
			if (o.at(i, 0) !== this._y[i]) {
				const d = (this._y[i] - o.at(i, 0)) * this._r
				const xi = this._x.row(i)
				xi.mult(d)
				this._atotal.add(xi.t)
				this._a.add(Matrix.div(this._atotal, this._epoch))
				this._btotal += d
				this._b += this._btotal / this._epoch
			}
		}
	}

	/**
	 * Returns predicted values.
	 *
	 * @param {Array<Array<number>>} data Sample data
	 * @returns {(1 | -1)[]} Predicted values
	 */
	predict(data) {
		const x = Matrix.fromArray(data)
		return x.dot(this._a).value.map(v => (v + this._b <= 0 ? -1 : 1))
	}
}

/**
 * Multiclass perceptron
 */
export class MulticlassPerceptron {
	// http://proceedings.mlr.press/v97/beygelzimer19a/beygelzimer19a-supp.pdf
	/**
	 * @param {number} rate Learning rate
	 */
	constructor(rate) {
		this._r = rate
	}

	/**
	 * Initialize this model.
	 *
	 * @param {Array<Array<number>>} train_x Training data
	 * @param {*[]} train_y Target values
	 */
	init(train_x, train_y) {
		this._x = Matrix.fromArray(train_x)
		this._c = [...new Set(train_y)]
		this._y = train_y.map(v => this._c.indexOf(v))
		this._epoch = 0

		this._a = Matrix.randn(this._x.cols, this._c.length)
		this._b = Matrix.zeros(1, this._c.length)
	}

	/**
	 * Fit model.
	 */
	fit() {
		const o = this._x.dot(this._a)
		o.add(this._b)
		const amax = o.argmax(1)
		this._epoch++

		for (let i = 0; i < this._x.rows; i++) {
			if (amax.at(i, 0) !== this._y[i]) {
				for (let k = 0; k < this._a.rows; k++) {
					this._a.addAt(k, this._y[i], this._x.at(i, k) * this._r)
					this._a.subAt(k, amax.at(i, 0), this._x.at(i, k) * this._r)
				}
				this._b.addAt(0, this._y[i], this._r)
				this._b.subAt(0, amax.at(i, 0), this._r)
			}
		}
	}

	/**
	 * Returns predicted values.
	 *
	 * @param {Array<Array<number>>} data Sample data
	 * @returns {*[]} Predicted values
	 */
	predict(data) {
		const x = Matrix.fromArray(data).dot(this._a)
		x.add(this._b)
		return x.argmax(1).value.map(v => this._c[v])
	}
}
