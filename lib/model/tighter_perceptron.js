/**
 * Tighter Budget Perceptron
 */
export default class TighterPerceptron {
	// Online Learning: A Comprehensive Survey
	// https://arxiv.org/abs/1802.02871
	// Online (and Offline) on an Even Tighter Budget
	// http://proceedings.mlr.press/r5/weston05a/weston05a.pdf
	/**
	 * @param {number} [beta=0] Margine
	 * @param {number} [p=0] Cachs size
	 * @param {'perceptron' | 'mira' | 'nobias'} [update=perceptron] Update rule
	 */
	constructor(beta = 0, p = 0, update = 'perceptron') {
		this._beta = beta
		this._p = p
		this._C = 1

		this._update = update
		this._loss = (t, y) => {
			return t === y ? 0 : 1
		}
	}

	/**
	 * Initialize this model.
	 *
	 * @param {Array<Array<number>>} train_x Training data
	 * @param {Array<1 | -1>} train_y Target values
	 */
	init(train_x, train_y) {
		this._x = train_x
		this._y = train_y

		if (this._update === 'mira') {
			this._w = Array(this._x[0].length).fill(1)
		} else {
			this._w = Array(this._x[0].length).fill(0)
		}
		this._c = 0
		this._a = []
	}

	/**
	 * Fit model parameters.
	 */
	fit() {
		for (let i = 0; i < this._x.length; i++) {
			const pt = this._x[i].reduce((s, v, j) => s + v * this._w[j], this._c)
			if (this._y[i] * pt > this._beta) {
				continue
			}
			if (this._p > 0 && this._a.length >= this._p) {
				let min_l = Infinity
				let min_i = -1
				for (let s = 0; s < this._a.length; s++) {
					const a = this._a[s]
					const ws = this._w.map((w, j) => w - a.a * this._y[a.i] * this._x[a.i][j])
					const cs = this._c - a.a * this._y[a.i]
					let v = 0
					for (let k = 0; k < this._a.length; k++) {
						let m = cs
						for (let j = 0; j < this._w.length; j++) {
							m += ws[j] * this._x[this._a[k].i][j]
						}
						v += this._loss(this._y[this._a[k].i], m <= 0 ? -1 : 1)
					}
					if (v < min_l) {
						min_l = v
						min_i = s
					}
				}
				const ai = this._a[min_i]
				for (let k = 0; k < this._w.length; k++) {
					this._w[k] -= ai.a * this._y[ai.i] * this._x[ai.i][k]
				}
				this._c -= ai.a * this._y[ai.i]
				this._a.splice(min_i, 1)
			}
			let alpha = 1
			if (this._update === 'mira') {
				const xx = this._x[i].reduce((s, v) => s + v ** 2, 1)
				alpha = Math.min(1, Math.max(0, (-this._y[i] * pt) / xx))
			} else if (this._update === 'nobias') {
				const xx = this._x[i].reduce((s, v) => s + v ** 2, 1)
				alpha = Math.min(this._C, Math.max(0, (1 - this._y[i] * pt) / xx))
			}
			this._a.push({ a: alpha, i })
			for (let k = 0; k < this._w.length; k++) {
				this._w[k] += alpha * this._y[i] * this._x[i][k]
			}
			this._c += alpha * this._y[i]
		}
	}

	/**
	 * Returns predicted values.
	 *
	 * @param {Array<Array<number>>} data Sample data
	 * @returns {(1 | -1)[]} Predicted values
	 */
	predict(data) {
		const p = []
		for (let i = 0; i < data.length; i++) {
			const m = data[i].reduce((s, v, j) => s + v * this._w[j], this._c)
			p.push(m <= 0 ? -1 : 1)
		}
		return p
	}
}
