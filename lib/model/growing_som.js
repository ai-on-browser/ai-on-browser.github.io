/**
 * Growing Self-Organizing Map
 */
export default class GSOM {
	// https://en.wikipedia.org/wiki/Growing_self-organizing_map
	/**
	 * @param {number} [sf] Spread factor
	 * @param {number} [lr] Learning rate
	 */
	constructor(sf = 0.1, lr = 0.1) {
		this._sf = sf
		this._lr = this._init_lr = lr
		this._k = 0
		this._node = null
		this._init_vector_count = 4

		this._lr_update = (lr, k) => lr * 0.99
	}

	/**
	 * Number of clusters
	 *
	 * @type {number}
	 */
	get size() {
		return this._node.length
	}

	/**
	 * Fit model.
	 *
	 * @param {Array<Array<number>>} data Training data
	 */
	fit(data) {
		if (!this._node) {
			this._d = data[0].length
			this._node = []
			for (let i = 0; i < this._init_vector_count; i++) {
				this._node[i] = []
				for (let d = 0; d < this._d; d++) {
					this._node[i][d] = Math.random()
				}
			}
			this._gt = -this._d * Math.log(this._sf)
			this._err = Array(this._node.length).fill(0)
		}

		for (let i = 0; i < data.length; i++) {
			this._k++

			let min_d = Infinity
			let min_k = -1
			for (let k = 0; k < this._node.length; k++) {
				const d = this._node[k].reduce((s, v, j) => s + (v - data[i][j]) ** 2, 0)
				if (d < min_d) {
					min_d = d
					min_k = k
				}
			}

			let ei = 0
			for (let d = 0; d < data[i].length; d++) {
				this._node[min_k][d] += this._lr * (data[i][d] - this._node[min_k][d])
				ei += (data[i][d] - this._node[min_k][d]) ** 2
			}
			this._err[min_k] += Math.sqrt(ei)

			if (this._err[min_k] > this._gt) {
				this._node.push(this._node[min_k].map(v => v + (Math.random() - 0.5) / 1000))
				this._err.push(0)
				this._err[min_k] = 0
				this._lr = this._init_lr
				this._k = 1
			}
			this._lr = this._lr_update(this._lr, this._k)
		}
	}

	/**
	 * Returns predicted categories.
	 *
	 * @param {Array<Array<number>>} x Sample data
	 * @returns {Array<number>} Predicted values
	 */
	predict(x) {
		const p = []
		for (let i = 0; i < x.length; i++) {
			let min_d = Infinity
			let min_k = -1
			for (let k = 0; k < this._node.length; k++) {
				const d = this._node[k].reduce((s, v, j) => s + (v - x[i][j]) ** 2, 0)
				if (d < min_d) {
					min_d = d
					min_k = k
				}
			}
			p[i] = min_k
		}
		return p
	}
}
