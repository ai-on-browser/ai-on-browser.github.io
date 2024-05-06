import Matrix from '../util/matrix.js'

/**
 * Locally Linear Embedding
 */
export default class LLE {
	// https://cs.nyu.edu/~roweis/lle/algorithm.html
	/**
	 * @param {number} [k] Number of neighborhoods
	 * @param {number | null} [rd] Reduced dimension
	 */
	constructor(k = 1, rd = null) {
		this._k = k
		this._rd = rd
	}

	/**
	 * Returns reduced values.
	 * @param {Array<Array<number>>} x Training data
	 * @returns {Array<Array<number>>} Predicted values
	 */
	predict(x) {
		x = Matrix.fromArray(x)
		const d = x.cols
		const n = x.rows
		const rd = this._rd || d

		const distance = []
		for (let i = 0; i < n; distance[i++] = []);
		for (let i = 0; i < n; i++) {
			for (let j = 0; j < i; j++) {
				let dt = 0
				for (let k = 0; k < d; k++) {
					dt += (x.at(i, k) - x.at(j, k)) ** 2
				}
				distance[i][j] = distance[j][i] = dt
			}
		}
		const neighbors = []
		for (let i = 0; i < n; i++) {
			const nns = []
			for (let j = 0; j < n; j++) {
				if (j === i) continue
				const dt = distance[i][j]
				if (nns.length < this._k || dt < nns[this._k - 1].dt) {
					if (nns.length === this._k) nns.pop()
					nns.push({
						dt: dt,
						idx: j,
					})
					for (let k = nns.length - 1; k > 0; k--) {
						if (nns[k].dt < nns[k - 1].dt) {
							;[nns[k], nns[k - 1]] = [nns[k - 1], nns[k]]
						}
					}
				}
			}
			neighbors.push(nns)
		}

		const m = Matrix.eye(n, n)
		for (let i = 0; i < n; i++) {
			const j = neighbors[i].map(v => v.idx)
			const z = x.row(j)
			z.sub(x.row(i))
			const C = z.dot(z.t)
			const o = Math.floor(Math.log10(C.trace())) - 3
			C.add(Matrix.eye(C.rows, C.cols, 10 ** o))
			const wi = C.inv().sum(0)
			wi.div(wi.sum())

			for (let k = 0; k < this._k; k++) {
				m.subAt(i, j[k], wi.value[k])
			}
		}

		const mtm = m.tDot(m)
		const ev = mtm.eigenVectors()
		ev.flip(1)
		return ev.slice(1, rd + 1, 1).toArray()
	}
}
