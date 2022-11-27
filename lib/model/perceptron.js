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
		this._a = null
		this._b = 0
	}

	/**
	 * Fit model.
	 *
	 * @param {Array<Array<number>>} x Training data
	 * @param {Array<1 | -1>} y Target values
	 */
	fit(x, y) {
		if (!this._a) {
			this._a = Array(x[0].length).fill(0)
		}

		for (let i = 0; i < x.length; i++) {
			const o = x[i].reduce((s, v, d) => s + v * this._a[d], this._b) <= 0 ? -1 : 1
			if (o !== y[i]) {
				const r = (y[i] - o) * this._r
				for (let d = 0; d < x[i].length; d++) {
					this._a[d] += r * x[i][d]
				}
				this._b += r
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
		return data.map(x => (x.reduce((s, v, d) => s + v * this._a[d], this._b) <= 0 ? -1 : 1))
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

		this._epoch = 0

		this._a = null
		this._atotal = null
		this._b = 0
		this._btotal = 0
	}

	/**
	 * Fit model.
	 *
	 * @param {Array<Array<number>>} x Training data
	 * @param {Array<1 | -1>} y Target values
	 */
	fit(x, y) {
		if (!this._a) {
			this._a = Array(x[0].length).fill(0)
			this._atotal = Array(x[0].length).fill(0)
		}
		this._epoch++

		for (let i = 0; i < x.length; i++) {
			const o = x[i].reduce((s, v, d) => s + v * this._a[d], this._b) <= 0 ? -1 : 1
			if (o !== y[i]) {
				const r = (y[i] - o) * this._r
				for (let d = 0; d < x[i].length; d++) {
					this._atotal[d] += r * x[i][d]
					this._a[d] += this._atotal[d] / this._epoch
				}
				this._btotal += r
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
		return data.map(x => (x.reduce((s, v, d) => s + v * this._a[d], this._b) <= 0 ? -1 : 1))
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

		this._c = []
		this._epoch = 0

		this._a = []
		this._b = []
	}

	/**
	 * Fit model.
	 *
	 * @param {Array<Array<number>>} x Training data
	 * @param {*[]} y Target values
	 */
	fit(x, y) {
		this._epoch++

		for (let i = 0; i < x.length; i++) {
			let yi = this._c.indexOf(y[i])
			if (yi < 0) {
				this._c.push(y[i])
				this._a.push(Array(x[i].length).fill(0))
				this._b.push(0)
				yi = this._c.length - 1
			}

			let maxv = -Infinity
			let maxk = -1
			for (let k = 0; k < this._c.length; k++) {
				const v = this._a[k].reduce((s, v, d) => s + v * x[i][d], this._b[k])
				if (maxv < v) {
					maxv = v
					maxk = k
				}
			}
			if (maxk !== yi) {
				for (let d = 0; d < x[i].length; d++) {
					this._a[yi][d] += x[i][d] * this._r
					this._a[maxk][d] -= x[i][d] * this._r
				}
				this._b[yi] += this._r
				this._b[maxk] -= this._r
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
		const p = []
		for (let i = 0; i < data.length; i++) {
			let maxv = -Infinity
			let maxk = -1
			for (let k = 0; k < this._c.length; k++) {
				const v = this._a[k].reduce((s, v, d) => s + v * data[i][d], this._b[k])
				if (maxv < v) {
					maxv = v
					maxk = k
				}
			}
			p.push(this._c[maxk])
		}
		return p
	}
}
