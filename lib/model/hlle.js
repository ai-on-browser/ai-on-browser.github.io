import Matrix from '../util/matrix.js'

/**
 * Hessian Locally Linear Embedding
 */
export default class HLLE {
	// https://citeseerx.ist.psu.edu/viewdoc/download?doi=10.1.1.3.673&rep=rep1&type=pdf
	// https://github.com/gdkrmr/dimRed
	// https://github.com/scikit-learn/scikit-learn/blob/7e1e6d09bcc2eaeba98f7e737aac2ac782f0e5f1/sklearn/manifold/_locally_linear.py#L344
	/**
	 * @param {number} [k=1]
	 */
	constructor(k = 1) {
		this._k = k
	}

	/**
	 * Returns reduced values.
	 *
	 * @param {Array<Array<number>>} x
	 * @param {number} [rd=0]
	 * @returns {Array<Array<number>>}
	 */
	predict(x, rd = 0) {
		x = Matrix.fromArray(x)
		const d = x.cols
		const n = x.rows

		const distance = []
		const neighbors = []
		for (let i = 0; i < n; distance[i++] = []);
		for (let i = 0; i < n; i++) {
			for (let j = i + 1; j < n; j++) {
				let dt = 0
				for (let k = 0; k < d; k++) {
					dt += (x.at(i, k) - x.at(j, k)) ** 2
				}
				distance[i][j] = distance[j][i] = dt
			}

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
			const z = x.row(neighbors[i].map(v => v.idx))
			z.sub(z.mean(0))

			const [u] = z.svd()
			const yi = Matrix.ones(this._k, 1 + rd + (rd * (rd + 1)) / 2)
			yi.set(0, 1, u.slice(0, rd, 1))

			let j = 1 + rd
			for (let k = 0; k < rd; k++) {
				yi.set(0, j, u.col(k).copyMult(u.slice(k, rd, 1)))
				j += rd - k
			}

			const [q] = yi.qr()
			const w = q.slice(rd + 1, null, 1)
			w.div(w.sum(0))
			const wwt = w.dot(w.t)

			for (let k = 0; k < this._k; k++) {
				for (let l = 0; l < this._k; l++) {
					m.addAt(neighbors[i][k].idx, neighbors[i][l].idx, wwt.at(k, l))
				}
			}
		}

		const ev = m.eigenVectors()
		ev.flip(1)
		return ev.slice(1, rd + 1, 1).toArray()
	}
}
