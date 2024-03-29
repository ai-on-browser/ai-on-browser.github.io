import Matrix from '../util/matrix.js'

/**
 * Laplacian eigenmaps
 */
export default class LaplacianEigenmaps {
	// https://www.cs.cmu.edu/~aarti/Class/10701/slides/Lecture21_1.pdf
	// https://github.com/JAVI897/Laplacian-Eigenmaps
	// https://scikit-learn.org/stable/modules/generated/sklearn.manifold.SpectralEmbedding.html
	/**
	 * @param {'rbf' | 'knn'} [affinity=rbf] Affinity type name
	 * @param {number} [k=10] Number of neighborhoods
	 * @param {number} [sigma=1] Sigma of normal distribution
	 * @param {'unnormalized' | 'normalized'} [laplacian=unnormalized] Normalized laplacian matrix or not
	 */
	constructor(affinity = 'rbf', k = 10, sigma = 1, laplacian = 'unnormalized') {
		this._affinity = affinity
		this._k = k
		this._sigma = sigma
		this._laplacian = laplacian
	}

	/**
	 * Returns reduced datas.
	 *
	 * @param {Array<Array<number>>} x Training data
	 * @param {number} rd Reduced dimension
	 * @returns {Array<Array<number>>} Predicted values
	 */
	predict(x, rd) {
		x = Matrix.fromArray(x)
		const n = x.rows
		const distances = Matrix.zeros(n, n)
		for (let i = 0; i < n; i++) {
			for (let j = i + 1; j < n; j++) {
				let d = Matrix.sub(x.row(i), x.row(j)).norm()
				distances.set(i, j, d)
				distances.set(j, i, d)
			}
		}

		const con = Matrix.zeros(n, n)
		if (this._k > 0) {
			for (let i = 0; i < n; i++) {
				const di = distances.row(i).value.map((v, i) => [v, i])
				di.sort((a, b) => a[0] - b[0])
				for (let j = 1; j < Math.min(this._k + 1, di.length); j++) {
					con.set(i, di[j][1], 1)
				}
			}
			con.add(con.t)
			con.div(2)
		}

		let W
		if (this._affinity === 'rbf') {
			W = Matrix.map(distances, (v, i) => (con.at(i) > 0 ? Math.exp(-(v ** 2) / this._sigma ** 2) : 0))
		} else if (this._affinity === 'knn') {
			W = Matrix.map(con, v => (v > 0 ? 1 : 0))
		}
		let d = W.sum(1).value
		const L = Matrix.diag(d)
		L.sub(W)

		if (this._laplacian === 'normalized') {
			d = d.map(v => Math.sqrt(v))
			for (let i = 0; i < n; i++) {
				for (let j = 0; j < n; j++) {
					L.set(i, j, L.at(i, j) / (d[i] * d[j]))
				}
			}
		}

		this._ev = L.eigenVectors()
		this._ev.flip(1)
		return this._ev.slice(1, rd + 1, 1).toArray()
	}
}
