import Matrix from '../util/matrix.js'

/**
 * Random projection
 */
export default class RandomProjection {
	// https://daily.belltail.jp/?p=737
	/**
	 * @param {'uniform' | 'root3' | 'normal'} [init] Initialize method name
	 * @param {number | null} [rd] Reduced dimension
	 */
	constructor(init = 'uniform', rd = null) {
		this._init = init
		this._rd = rd ?? 0
	}

	/**
	 * Returns reduced values.
	 * @param {Array<Array<number>>} x Training data
	 * @returns {Array<Array<number>>} Predicted values
	 */
	predict(x) {
		x = Matrix.fromArray(x)
		const d = this._rd <= 0 ? x.cols : this._rd
		if (this._init === 'root3') {
			// Random projection in dimensionality reduction: Applications to image and text data
			this._w = Matrix.zeros(x.cols, d)
			const r3 = Math.sqrt(3)
			for (let i = 0; i < this._w.length; i++) {
				const r = Math.random()
				if (r < 1 / 6) {
					this._w.value[i] = r3
				} else if (r < 1 / 3) {
					this._w.value[i] = -r3
				}
			}
		} else if (this._init === 'normal') {
			this._w = Matrix.randn(x.cols, d)
		} else {
			this._w = Matrix.random(x.cols, d, -1, 1)
		}
		return x.dot(this._w).toArray()
	}
}
