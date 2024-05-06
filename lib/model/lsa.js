import Matrix from '../util/matrix.js'

/**
 * Latent Semantic Analysis
 */
export default class LSA {
	// https://qiita.com/Hatomugi/items/d6c8bb1a049d3a84feaa
	/**
	 * @param {number | null} [rd] Reduced dimension
	 */
	constructor(rd = null) {
		this._rd = rd
	}

	/**
	 * Returns reduced values.
	 * @param {Array<Array<number>>} x Training data
	 * @returns {Array<Array<number>>} Predicted values
	 */
	predict(x) {
		const rd = this._rd || 0
		if (rd <= 0 || x[0].length <= rd) {
			return x
		}
		x = Matrix.fromArray(x)
		const [u, s, v] = x.svd()
		return u
			.slice(0, rd, 1)
			.dot(Matrix.diag(s.slice(0, rd)))
			.dot(v.block(0, 0, rd, rd).t)
			.toArray()
	}
}
