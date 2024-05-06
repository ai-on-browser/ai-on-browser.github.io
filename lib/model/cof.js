/**
 * Connectivity-based Outlier Factor
 */
export default class COF {
	// https://rdrr.io/cran/DDoutlier/man/COF.html
	// http://www.cse.cuhk.edu.hk/~adafu/Pub/pakdd02.pdf
	/**
	 * @param {number} k Number of neighborhoods
	 */
	constructor(k) {
		this._k = k
	}

	_distance(a, b) {
		return Math.sqrt(a.reduce((s, v, i) => s + (v - b[i]) ** 2, 0))
	}

	/**
	 * Returns anomaly degrees.
	 * @param {Array<Array<number>>} datas Training data
	 * @returns {number[]} Predicted values
	 */
	predict(datas) {
		const distances = []
		for (let i = 0; i < datas.length; i++) {
			distances[i] = []
			distances[i][i] = 0
			for (let j = 0; j < i; j++) {
				const d = this._distance(datas[i], datas[j])
				distances[i][j] = distances[j][i] = d
			}
		}
		const acdist = []
		const nears = []
		for (let i = 0; i < datas.length; i++) {
			const sdist = distances[i].map((v, k) => [v, k])
			sdist.sort((a, b) => a[0] - b[0])
			const nrest = sdist.slice(1, this._k + 1).map(v => v[1])
			nears[i] = nrest.concat()
			const sbnpath = [i]
			const sbntrail = []
			for (let k = 0; k < this._k; k++) {
				let min_trail = [-1, -1]
				let min_dist = Infinity
				for (let s = 0; s < sbnpath.length; s++) {
					for (let t = 0; t < nrest.length; t++) {
						if (distances[sbnpath[s]][nrest[t]] < min_dist) {
							min_dist = distances[sbnpath[s]][nrest[t]]
							min_trail = [s, t]
						}
					}
				}
				sbnpath.push(nrest[min_trail[1]])
				sbntrail.push([sbnpath[min_trail[0]], nrest[min_trail[1]]])
				nrest.splice(min_trail[1], 1)
			}

			const r = sbntrail.length + 1
			let dist = 0
			for (let k = 0; k < sbntrail.length; k++) {
				dist += (2 / r) * (r - k - 1) * distances[sbntrail[k][0]][sbntrail[k][1]]
			}
			acdist[i] = dist / (r - 1)
		}

		const cof = []
		for (let i = 0; i < acdist.length; i++) {
			let d = 0
			for (let k = 0; k < nears[i].length; k++) {
				d += acdist[nears[i][k]]
			}
			cof[i] = (nears[i].length * acdist[i]) / d
		}
		return cof
	}
}
