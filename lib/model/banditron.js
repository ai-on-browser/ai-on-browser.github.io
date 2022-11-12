/**
 * Banditron
 */
export default class Banditron {
	// Online Learning: A Comprehensive Survey
	// https://arxiv.org/abs/1802.02871
	// Efficient Bandit Algorithms for Online Multiclass Prediction
	// https://www.cs.huji.ac.il/~shais/papers/TewariShKa08.pdf
	/**
	 * @param {number} [gamma=0.5] Gamma
	 */
	constructor(gamma = 0.5) {
		this._gamma = gamma
	}

	/**
	 * Initialize this model.
	 *
	 * @param {Array<Array<number>>} train_x Training data
	 * @param {*[]} train_y Target values
	 */
	init(train_x, train_y) {
		this._x = train_x
		this._y = train_y
		this._classes = [...new Set(train_y)]

		this._w = []
		for (let i = 0; i < this._classes.length; i++) {
			this._w[i] = Array(this._x[0].length).fill(0)
		}
		this._b = Array(this._classes.length).fill(0)
	}

	/**
	 * Fit model parameters.
	 */
	fit() {
		for (let i = 0; i < this._x.length; i++) {
			const yi = this._classes.indexOf(this._y[i])
			let max_v = -Infinity
			let yh = -1
			for (let k = 0; k < this._classes.length; k++) {
				const v = this._w[k].reduce((s, w, d) => s + w * this._x[i][d], this._b[k])
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
				for (let j = 0; j < this._x[i].length; j++) {
					this._w[k][j] += this._x[i][j] * v
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
