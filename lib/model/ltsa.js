import Matrix from '../util/matrix.js'

/**
 * Local Tangent Space Alignment
 */
export default class LTSA {
	// Principal Manifolds and Nonlinear Dimension Reduction via Local Tangent Space Alignment
	// https://arxiv.org/abs/cs/0212008
	/**
	 * @param {number} [k=1] Number of neighborhoods
	 */
	constructor(k = 1) {
		this._k = k
	}

	/**
	 * Returns reduced values.
	 *
	 * @param {Array<Array<number>>} x Training data
	 * @param {number} [rd=0] Reduced dimension
	 * @returns {Array<Array<number>>} Predicted values
	 */
	predict(x, rd = 0) {
		x = Matrix.fromArray(x)
		const d = x.cols
		const n = x.rows

		const distance = []
		for (let i = 0; i < n; i++) {
			distance[i] = []
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
					nns.push({ dt: dt, idx: j })
					for (let k = nns.length - 1; k > 0; k--) {
						if (nns[k].dt < nns[k - 1].dt) {
							;[nns[k], nns[k - 1]] = [nns[k - 1], nns[k]]
						}
					}
				}
			}
			neighbors.push([i, ...nns.map(v => v.idx)])
		}

		const B = Matrix.zeros(n, n)
		for (let i = 0; i < n; i++) {
			const xnn = x.row(neighbors[i])
			const xbar = xnn.mean(0)
			xnn.sub(xbar)
			const corr = xnn.dot(xnn.t)
			const eigvalues = corr.eigenVectors()
			const Gi = Matrix.ones(neighbors[i].length, d + 1)
			Gi.set(0, 1, eigvalues.slice(0, d, 1))

			const GG = Gi.dot(Gi.t)
			for (let s = 0; s < neighbors[i].length; s++) {
				const u = neighbors[i][s]
				B.addAt(u, u, 1 + GG.at(s, s))
				for (let t = 0; t < s; t++) {
					const v = neighbors[i][t]
					B.addAt(u, v, GG.at(s, t))
					B.addAt(v, u, GG.at(t, s))
				}
			}
		}

		const ev = B.eigenVectors()
		ev.flip(1)
		return ev.slice(1, rd + 1, 1).toArray()
	}
}
