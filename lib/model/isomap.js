import { Matrix } from '../util/math.js'

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
	 * @param {number} neighbors
	 */
	constructor(neighbors = 0) {
		this._n = neighbors
	}

	/**
	 * Returns reduced values.
	 * @param {Array<Array<number>>} x
	 * @param {number} [rd=1]
	 * @returns {Array<Array<number>>}
	 */
	predict(x, rd = 1) {
		x = Matrix.fromArray(x)
		const n = x.rows
		const d = x.cols
		const N = new Matrix(n, n)
		for (let i = 0; i < n; i++) {
			N._value[i * n + i] = 0
			for (let j = i + 1; j < n; j++) {
				let t = 0
				for (let k = 0; k < d; k++) {
					t += (x.at(i, k) - x.at(j, k)) ** 2
				}
				N._value[i * n + j] = N._value[j * n + i] = Math.sqrt(t)
			}
		}

		if (this._n > 0) {
			for (let i = 0; i < n; i++) {
				const v = []
				for (let j = 0; j < n; j++) {
					if (i === j) continue
					v.push([N._value[i * n + j], j])
				}
				v.sort((a, b) => a[0] - b[0])
				for (let j = this._n; j < n - 1; j++) {
					N._value[i * n + v[j][1]] = Infinity
				}
			}

			for (let i = 0; i < n; i++) {
				for (let j = i + 1; j < n; j++) {
					N._value[i * n + j] = N._value[j * n + i] = Math.min(N._value[i * n + j], N._value[j * n + i])
				}
			}
		}

		warshallFloyd(N)

		return new MDS().predict(N, rd, true)
	}
}
