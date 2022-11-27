/**
 * Relaxed Online Maximum Margin Algorithm
 */
export class ROMMA {
	// https://papers.nips.cc/paper/1999/file/515ab26c135e92ed8bf3a594d67e4ade-Paper.pdf
	// The Relaxed Online Maximum Margin Algorithm.
	// https://olpy.readthedocs.io/en/latest/_modules/olpy/classifiers/romma.html#ROMMA
	constructor() {
		this._w = null
		this._w0 = 0
	}

	_mistake(m, y) {
		return m * y <= 0
	}

	/**
	 * Update model parameters with one data.
	 *
	 * @param {number[]} x Training data
	 * @param {1 | -1} y Target value
	 */
	update(x, y) {
		const m = this._w.reduce((s, v, d) => s + v * x[d], this._w0)
		if (!this._mistake(m, y)) return

		const wnorm = this._w.reduce((s, v) => s + v ** 2, this._w0 ** 2)
		if (wnorm === 0) {
			this._w = x.map(v => v * y)
			this._w0 = y
			return
		}
		const xwnorm = (x.reduce((s, v) => s + v ** 2, 0) + 1) * wnorm

		const c = (xwnorm - y * m) / (xwnorm - m ** 2)
		const d = (wnorm * (y - m)) / (xwnorm - m ** 2)

		this._w = this._w.map((v, i) => v * c + x[i] * d)
		this._w0 = this._w0 * c + d
	}

	/**
	 * Fit model parameters.
	 *
	 * @param {Array<Array<number>>} x Training data
	 * @param {Array<1 | -1>} y Target values
	 */
	fit(x, y) {
		if (!this._w) {
			this._w = Array(x[0].length).fill(0)
			this._w0 = 0
		}
		for (let i = 0; i < x.length; i++) {
			this.update(x[i], y[i])
		}
	}

	/**
	 * Returns predicted datas.
	 *
	 * @param {Array<Array<number>>} data Sample data
	 * @returns {(1 | -1)[]} Predicted values
	 */
	predict(data) {
		const p = []
		for (let i = 0; i < data.length; i++) {
			const r = data[i].reduce((s, v, d) => s + this._w[d] * v, this._w0)
			p[i] = r <= 0 ? -1 : 1
		}
		return p
	}
}

/**
 * Aggressive Relaxed Online Maximum Margin Algorithm
 */
export class AggressiveROMMA extends ROMMA {
	// https://papers.nips.cc/paper/1999/file/515ab26c135e92ed8bf3a594d67e4ade-Paper.pdf
	// The Relaxed Online Maximum Margin Algorithm.
	// https://olpy.readthedocs.io/en/latest/_modules/olpy/classifiers/aromma.html#aROMMA
	_mistake(m, y) {
		return m * y < 1
	}
}
