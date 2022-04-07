import Matrix from '../util/matrix.js'

import MDS from './mds.js'

const warshallFloyd = d => {
	const n = d.rows
	for (let k = 0; k < n; k++) {
		for (let i = 0; i < n; i++) {
			for (let j = 0; j < n; j++) {
				const dij = d.at(i, j)
				const dikj = d.at(i, k) + d.at(k, j)
				if (dij > dikj) {
					d.set(i, j, dikj)
				}
			}
		}
	}
}

/**
 * Isomap
 */
export default class Isomap {
	// https://en.wikipedia.org/wiki/Isomap
	/**
	 * @param {number} [neighbors=0] Number of neighborhoods
	 */
	constructor(neighbors = 0) {
		this._n = neighbors
	}

	/**
	 * Returns reduced values.
	 *
	 * @param {Array<Array<number>>} x Training data
	 * @param {number} [rd=1] Reduced dimension
	 * @returns {Array<Array<number>>} Predicted values
	 */
	predict(x, rd = 1) {
		x = Matrix.fromArray(x)
		const n = x.rows
		const d = x.cols
		const N = new Matrix(n, n)
		for (let i = 0; i < n; i++) {
			N.value[i * n + i] = 0
			for (let j = i + 1; j < n; j++) {
				let t = 0
				for (let k = 0; k < d; k++) {
					t += (x.at(i, k) - x.at(j, k)) ** 2
				}
				N.value[i * n + j] = N.value[j * n + i] = Math.sqrt(t)
			}
		}

		if (this._n > 0) {
			for (let i = 0; i < n; i++) {
				const v = []
				for (let j = 0; j < n; j++) {
					if (i === j) continue
					v.push([N.value[i * n + j], j])
				}
				v.sort((a, b) => a[0] - b[0])
				for (let j = this._n; j < n - 1; j++) {
					N.value[i * n + v[j][1]] = Infinity
				}
			}

			for (let i = 0; i < n; i++) {
				for (let j = i + 1; j < n; j++) {
					N.value[i * n + j] = N.value[j * n + i] = Math.min(N.value[i * n + j], N.value[j * n + i])
				}
			}
		}

		warshallFloyd(N)

		return new MDS().predict(N, rd, true)
	}
}
