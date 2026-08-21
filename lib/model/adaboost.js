/**
 * @typedef {object} BinaryModel
 * @property {function(Array<Array<number>, (1 | -1)[], number[]): void} fit Fit model
 * @property {function(Array<Array<number>>): (1 | -1)[]} predict Returns predicted values
 */
/**
 * (Discrete) Adaptive Boosting
 */
export default class AdaBoost {
	// https://en.wikipedia.org/wiki/AdaBoost
	/**
	 * @param {() => BinaryModel} model Function to generate the model
	 */
	constructor(model) {
		this._model = model
	}

	/**
	 * Initialize model.
	 * @param {Array<Array<number>>} train_x Training data
	 * @param {(1 | -1)[]} train_y Target values
	 */
	init(train_x, train_y) {
		this._x = train_x
		this._y = train_y
		this._d = Array(this._x.length).fill(1 / this._x.length)
		this._h = []
		this._a = []
	}

	/**
	 * Fit model.
	 */
	fit() {
		const h = this._model()
		h.fit(this._x, this._y, this._d)
		this._h.push(h)

		const p = h.predict(this._x)
		const n = this._x.length
		let e = 0
		for (let i = 0; i < n; i++) {
			if (this._y[i] !== p[i]) {
				e += this._d[i]
			}
		}
		const alpha = Math.log((1 - e) / e) / 2
		this._a.push(alpha)
		if (e === 0) {
			return
		}

		let s = 0
		for (let i = 0; i < n; i++) {
			this._d[i] += Math.exp(-alpha * this._y[i] * p[i])
			s += this._d[i]
		}
		for (let i = 0; i < n; i++) {
			this._d[i] /= s
		}
	}

	/**
	 * Returns predicted values.
	 * @param {Array<Array<number>>} data Sample data
	 * @returns {(1 | -1)[]} Predicted values
	 */
	predict(data) {
		const p = Array(data.length).fill(0)
		for (let k = 0; k < this._h.length; k++) {
			const h = this._h[k].predict(data)
			for (let i = 0; i < data.length; i++) {
				p[i] += this._a[k] * h[i]
			}
		}
		return p.map(v => (v < 0 ? -1 : 1))
	}
}
