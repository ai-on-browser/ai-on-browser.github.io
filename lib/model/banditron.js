/**
 * Banditron
 */
export default class Banditron {
	// Online Learning: A Comprehensive Survey
	// https://arxiv.org/abs/1802.02871
	// Efficient Bandit Algorithms for Online Multiclass Prediction
	// https://www.cs.huji.ac.il/~shais/papers/TewariShKa08.pdf
	/**
	 * @param {number} [gamma] Gamma
	 */
	constructor(gamma = 0.5) {
		this._gamma = gamma
		this._classes = []
		this._w = []
		this._b = []
	}

	/**
	 * Fit model parameters.
	 *
	 * @param {Array<Array<number>>} x Training data
	 * @param {*[]} y Target values
	 */
	fit(x, y) {
		for (let i = 0; i < x.length; i++) {
			let yi = this._classes.indexOf(y[i])
			if (yi < 0) {
				yi = this._classes.length
				this._classes.push(y[i])
				this._w.push(Array(x[i].length).fill(0))
				this._b.push(0)
			}
			let max_v = -Infinity
			let yh = -1
			for (let k = 0; k < this._classes.length; k++) {
				const v = this._w[k].reduce((s, w, d) => s + w * x[i][d], this._b[k])
				if (v > max_v) {
					max_v = v
					yh = k
				}
			}
			let r = Math.random()
			let yt = -1
			const p = []
			for (let k = 0; k < this._classes.length; k++) {
				p[k] = this._gamma / this._classes.length + (yi === k ? 1 - this._gamma : 0)
				r -= p[k]
				if (yt < 0 && r < 0) {
					yt = k
				}
			}
			for (let k = 0; k < this._classes.length; k++) {
				const v = (yi === yt && yt === k ? 1 / p[k] : 0) - (yh === k ? 1 : 0)
				if (v === 0) {
					continue
				}
				for (let j = 0; j < x[i].length; j++) {
					this._w[k][j] += x[i][j] * v
				}
				this._b[k] += v
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
			let max_v = -Infinity
			let max_k = -1
			for (let k = 0; k < this._classes.length; k++) {
				const v = this._w[k].reduce((s, w, d) => s + w * data[i][d], this._b[k])
				if (v > max_v) {
					max_v = v
					max_k = k
				}
			}
			p[i] = this._classes[max_k]
		}
		return p
	}
}
