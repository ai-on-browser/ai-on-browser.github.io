/**
 * Tighter Budget Perceptron
 */
export default class TighterPerceptron {
	// Online Learning: A Comprehensive Survey
	// https://arxiv.org/abs/1802.02871
	// Online (and Offline) on an Even Tighter Budget
	// http://proceedings.mlr.press/r5/weston05a/weston05a.pdf
	/**
	 * @param {number} [beta] Margine
	 * @param {number} [p] Cachs size
	 * @param {'perceptron' | 'mira' | 'nobias'} [update] Update rule
	 */
	constructor(beta = 0, p = 0, update = 'perceptron') {
		this._beta = beta
		this._p = p
		this._C = 1

		this._update = update
		this._loss = (t, y) => {
			return t === y ? 0 : 1
		}

		this._w = null
		this._c = 0
		this._a = []
	}

	/**
	 * Fit model parameters.
	 *
	 * @param {Array<Array<number>>} x Training data
	 * @param {Array<1 | -1>} y Target values
	 */
	fit(x, y) {
		if (!this._w) {
			if (this._update === 'mira') {
				this._w = Array(x[0].length).fill(1)
			} else {
				this._w = Array(x[0].length).fill(0)
			}
		}
		for (let i = 0; i < x.length; i++) {
			const pt = x[i].reduce((s, v, j) => s + v * this._w[j], this._c)
			if (y[i] * pt > this._beta) {
				continue
			}
			if (this._p > 0 && this._a.length >= this._p) {
				let min_l = Infinity
				let min_i = -1
				for (let s = 0; s < this._a.length; s++) {
					const a = this._a[s]
					const ws = this._w.map((w, j) => w - a.a * a.y * a.x[j])
					const cs = this._c - a.a * a.y
					let v = 0
					for (let k = 0; k < this._a.length; k++) {
						let m = cs
						for (let j = 0; j < this._w.length; j++) {
							m += ws[j] * this._a[k].x[j]
						}
						v += this._loss(this._a[k].y, m <= 0 ? -1 : 1)
					}
					if (v < min_l) {
						min_l = v
						min_i = s
					}
				}
				const ai = this._a[min_i]
				for (let k = 0; k < this._w.length; k++) {
					this._w[k] -= ai.a * ai.y * ai.x[k]
				}
				this._c -= ai.a * ai.y
				this._a.splice(min_i, 1)
			}
			let alpha = 1
			if (this._update === 'mira') {
				const xx = x[i].reduce((s, v) => s + v ** 2, 1)
				alpha = Math.min(1, Math.max(0, (-y[i] * pt) / xx))
			} else if (this._update === 'nobias') {
				const xx = x[i].reduce((s, v) => s + v ** 2, 1)
				alpha = Math.min(this._C, Math.max(0, (1 - y[i] * pt) / xx))
			}
			this._a.push({ a: alpha, x: x[i], y: y[i] })
			for (let k = 0; k < this._w.length; k++) {
				this._w[k] += alpha * y[i] * x[i][k]
			}
			this._c += alpha * y[i]
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
