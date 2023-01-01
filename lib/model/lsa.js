import Matrix from '../util/matrix.js'

/**
 * Latent Semantic Analysis
 */
export default class LSA {
	// https://qiita.com/Hatomugi/items/d6c8bb1a049d3a84feaa
	/**
	 * Returns reduced values.
	 *
	 * @param {Array<Array<number>>} x Training data
	 * @param {number} [rd=0] Reduced dimension
	 * @returns {Array<Array<number>>} Predicted values
	 */
	predict(x, rd = 0) {
		x = Matrix.fromArray(x)
		if (rd <= 0) {
			rd = x.cols
		}
		const [u, s, v] = x.svd()
		return u
			.slice(0, rd, 1)
			.dot(Matrix.diag(s.slice(0, rd)))
			.dot(v.block(0, 0, rd, rd).t)
			.toArray()
	}
}
