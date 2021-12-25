import { Matrix } from '../util/math.js'

/**
 * Locally Linear Embedding
 */
export default class LLE {
	// https://cs.nyu.edu/~roweis/lle/algorithm.html
	/**
	 * @param {number} [k=1]
	 */
	constructor(k = 1) {
		this._k = k
	}

	/**
	 * Returns reduced values.
	 * @param {Array<Array<number>>} x
	 * @param {number} [rd=0]
	 * @returns {Array<Array<number>>}
	 */
	predict(x, rd = 0) {
		x = Matrix.fromArray(x)
		const d = x.cols
		const n = x.rows

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
			let nns = []
			for (let j = 0; j < n; j++) {
				if (j === i) continue
				let dt = distance[i][j]
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
			let j = neighbors[i].map(v => v.idx)
			let z = x.row(j)
			z.sub(x.row(i))
			let C = z.dot(z.t)
			let wi = C.inv().sum(0)
			wi.div(wi.sum())

			for (let k = 0; k < this._k; k++) {
				m.subAt(i, j[k], wi.value[k])
			}
		}

		const mtm = m.tDot(m)
		let ev = mtm.eigenVectors()
		ev.flip(1)
		return ev.slice(1, rd + 1, 1).toArray()
	}
}
