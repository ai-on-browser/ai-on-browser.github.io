import Matrix from '../util/matrix.js'

/**
 * Modified Locally Linear Embedding
 */
export default class MLLE {
	// https://proceedings.neurips.cc/paper/2006/file/fb2606a5068901da92473666256e6e5b-Paper.pdf
	// https://github.com/scikit-learn/scikit-learn/blob/7e1e6d09bcc2eaeba98f7e737aac2ac782f0e5f1/sklearn/manifold/_locally_linear.py#L398
	/**
	 * @param {number} k Number of neighborhoods
	 * @param {number | null} [rd] Reduced dimension
	 */
	constructor(k, rd = null) {
		this._k = k
		this._rd = rd
	}

	/**
	 * Returns reduced values.
	 * @param {Array<Array<number>>} data Training data
	 * @returns {Array<Array<number>>} Predicted values
	 */
	predict(data) {
		const x = Matrix.fromArray(data)
		const d = x.cols
		const n = x.rows
		const rd = this._rd || d

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
					nns.push({ dt, idx: j })
					for (let k = nns.length - 1; k > 0; k--) {
						if (nns[k].dt < nns[k - 1].dt) {
							;[nns[k], nns[k - 1]] = [nns[k - 1], nns[k]]
						}
					}
				}
			}
			neighbors.push(nns)
		}

		const v = []
		const e = []
		const w = []
		const rho = []
		const gamma = 1.0e-8
		for (let i = 0; i < n; i++) {
			const g = x.row(neighbors[i].map(v => v.idx))
			g.sub(x.row(i))
			const gg = g.dot(g.t)
			const [ev, evectors] = gg.eigen()
			v.push(evectors)
			e.push(ev)
			const rhoi = ev.slice(rd).reduce((s, v) => s + v, 0) / ev.slice(0, rd).reduce((s, v) => s + v, 0)
			rho.push(rhoi)

			const norm = g.norm()
			for (let k = 0; k < this._k; k++) {
				gg.addAt(k, k, gamma * norm)
			}
			const wi = gg.inv().sum(1)
			wi.div(wi.sum())
			w.push(wi)
		}
		rho.sort((a, b) => a - b)
		const eta =
			rho.length % 2 === 1 ? rho[(rho.length - 1) / 2] : (rho[rho.length / 2] + rho[rho.length / 2 + 1]) / 2

		const m = Matrix.zeros(n, n)
		for (let i = 0; i < n; i++) {
			let s = -1
			const evcumsum = [e[i][0]]
			for (let k = 1; k < this._k; k++) {
				evcumsum[k] = evcumsum[k - 1] + e[i][k]
			}
			for (let l = 1; l < this._k - rd; l++) {
				if ((evcumsum[this._k - 1] - evcumsum[this._k - l - 1]) / evcumsum[this._k - l - 1] >= eta) {
					break
				}
				s = l
			}
			const vi = v[i].slice(this._k - s, null, 1)
			const alpha = vi.sum(0).norm()

			const h = vi.sum(0)
			h.isub(alpha)
			h.div(h.norm())

			const H = Matrix.eye(s, s)
			H.sub(Matrix.mult(h.dot(h.t), 2))

			const W = vi.dot(H)
			W.add(Matrix.mult(w[i], 1 - alpha))

			const Wh = Matrix.zeros(n, s)
			for (let k = 0; k < this._k; k++) {
				Wh.set(neighbors[i][k].idx, 0, W.row(k))
			}
			for (let j = 0; j < s; j++) {
				Wh.subAt(i, j, 1)
			}
			m.sub(Wh.dot(Wh.t))
		}

		const ev = m.eigenVectors()
		ev.flip(1)
		return ev.slice(1, rd + 1, 1).toArray()
	}
}
