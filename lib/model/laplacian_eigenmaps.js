import Matrix from '../util/matrix.js'

/**
 * Laplacian eigenmaps
 */
export default class LaplacianEigenmaps {
	// https://www.cs.cmu.edu/~aarti/Class/10701/slides/Lecture21_1.pdf
	// https://github.com/JAVI897/Laplacian-Eigenmaps
	// https://scikit-learn.org/stable/modules/generated/sklearn.manifold.SpectralEmbedding.html
	/**
	 * @param {number} rd Reduced dimension
	 * @param {'rbf' | 'knn' | { name: 'rbf', sigma?: number, k?: number } | { name: 'knn', k?: number }} [affinity] Affinity type name
	 * @param {'unnormalized' | 'normalized'} [laplacian] Normalized laplacian matrix or not
	 */
	constructor(rd, affinity = 'rbf', laplacian = 'unnormalized') {
		this._rd = rd
		if (typeof affinity === 'string') {
			this._affinity = { name: affinity }
		} else {
			this._affinity = affinity
		}
		this._laplacian = laplacian
	}

	/**
	 * Returns reduced datas.
	 * @param {Array<Array<number>>} x Training data
	 * @returns {Array<Array<number>>} Predicted values
	 */
	predict(x) {
		x = Matrix.fromArray(x)
		const n = x.rows
		const rd = this._rd
		const distances = Matrix.zeros(n, n)
		for (let i = 0; i < n; i++) {
			for (let j = i + 1; j < n; j++) {
				let d = Matrix.sub(x.row(i), x.row(j)).norm()
				distances.set(i, j, d)
				distances.set(j, i, d)
			}
		}

		const con = Matrix.zeros(n, n)
		const k = this._affinity.k ?? 10
		if (k > 0) {
			for (let i = 0; i < n; i++) {
				const di = distances.row(i).value.map((v, i) => [v, i])
				di.sort((a, b) => a[0] - b[0])
				for (let j = 1; j < Math.min(k + 1, di.length); j++) {
					con.set(i, di[j][1], 1)
				}
			}
			con.add(con.t)
			con.div(2)
		}

		let W
		if (this._affinity.name === 'rbf') {
			const sigma = this._affinity.sigma ?? 1
			W = Matrix.map(distances, (v, i) => (con.at(i) > 0 ? Math.exp(-(v ** 2) / sigma ** 2) : 0))
		} else if (this._affinity.name === 'knn') {
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
