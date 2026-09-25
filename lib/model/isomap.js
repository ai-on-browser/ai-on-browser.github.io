import MDS from './mds.js'

const warshallFloyd = d => {
	const n = d.length
	for (let k = 0; k < n; k++) {
		for (let i = 0; i < n; i++) {
			for (let j = 0; j < n; j++) {
				const dij = d[i][j]
				const dikj = d[i][k] + d[k][j]
				if (dij > dikj) {
					d[i][j] = dikj
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
	 * @param {number} [neighbors] Number of neighborhoods
	 * @param {number | null} [rd] Reduced dimension
	 */
	constructor(neighbors = 0, rd = null) {
		this._n = neighbors
		this._rd = rd
	}

	/**
	 * Returns reduced values.
	 * @param {Array<Array<number>>} x Training data
	 * @returns {Array<Array<number>>} Predicted values
	 */
	predict(x) {
		const n = x.length
		const d = x[0].length
		const N = Array.from(x, () => [])
		for (let i = 0; i < n; i++) {
			N[i][i] = 0
			for (let j = i + 1; j < n; j++) {
				let t = 0
				for (let k = 0; k < d; k++) {
					t += (x[i][k] - x[j][k]) ** 2
				}
				N[i][j] = N[j][i] = Math.sqrt(t)
			}
		}

		if (this._n > 0) {
			for (let i = 0; i < n; i++) {
				const v = []
				for (let j = 0; j < n; j++) {
					if (i === j) continue
					v.push([N[i][j], j])
				}
				v.sort((a, b) => a[0] - b[0])
				for (let j = this._n; j < n - 1; j++) {
					N[i][v[j][1]] = Infinity
				}
			}

			for (let i = 0; i < n; i++) {
				for (let j = i + 1; j < n; j++) {
					N[i][j] = N[j][i] = Math.min(N[i][j], N[j][i])
				}
			}
		}

		warshallFloyd(N)

		return new MDS(this._rd ?? d).predict(N, true)
	}
}
