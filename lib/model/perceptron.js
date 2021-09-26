import { Matrix } from '../util/math.js'

/**
 * Perceptron
 */
export default class Perceptron {
	// https://tma15.github.io/blog/2016/07/31/%E5%B9%B3%E5%9D%87%E5%8C%96%E3%83%91%E3%83%BC%E3%82%BB%E3%83%97%E3%83%88%E3%83%AD%E3%83%B3%E3%81%AE%E5%8A%B9%E7%8E%87%E7%9A%84%E3%81%AA%E8%A8%88%E7%AE%97/
	// https://www.think-self.com/machine-learning/perceptron/
	// https://en.wikipedia.org/wiki/Perceptron
	/**
	 * @param {boolean} average
	 * @param {number} rate
	 */
	constructor(average = false, rate) {
		this._r = rate
		this._average = average
	}

	/**
	 * Initialize this model.
	 * @param {Array<Array<number>>} train_x
	 * @param {Array<1 | -1>} train_y
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
				if (this._average) {
					this._atotal.add(xi.t)
					this._a.add(this._atotal.copyDiv(this._epoch))
					this._btotal += d
					this._b += this._btotal / this._epoch
				} else {
					this._a.add(xi.t)
					this._b += d
				}
			}
		}
	}

	/**
	 * Returns predicted values.
	 * @param {Array<Array<number>>} data
	 * @returns {(1 | -1)[]}
	 */
	predict(data) {
		const x = Matrix.fromArray(data)
		return x.dot(this._a).value.map(v => (v + this._b <= 0 ? -1 : 1))
	}
}
