const logGamma = z => {
	// https://ja.wikipedia.org/wiki/%E3%82%AC%E3%83%B3%E3%83%9E%E9%96%A2%E6%95%B0
	let x = 0
	if (Number.isInteger(z)) {
		for (let i = 2; i < z; i++) {
			x += Math.log(i)
		}
	} else {
		const n = z - 0.5
		x = Math.log(Math.sqrt(Math.PI)) - Math.log(2) * n
		for (let i = 2 * n - 1; i > 0; i -= 2) {
			x += Math.log(i)
		}
	}
	return x
}

const gammaStar = (a, z) => {
	let v = 0
	const logz = Math.log(z)
	for (let n = 0; n < 1000; n++) {
		const vn = Math.exp(n * logz - logGamma(a + n + 1))
		v += vn
		if (vn / v < 1.0e-12) {
			break
		}
	}
	return Math.exp(-z) * v
}

const regularizedIncompleteGamma = (a, z) => {
	// gamma distribution of the first kind
	// https://math-functions-1.watson.jp/sub1_spec_050.html#section010
	return gammaStar(a, z) * z ** a
}

const cumChiSquared = (x, k) => {
	return regularizedIncompleteGamma(k / 2, x / 2)
}

/**
 * Distribution Based Clustering of LArge Spatial Databases
 */
export default class DBCLASD {
	// A Distribution-Based Clustering Algorithm for Mining in Large Spatial Databases
	// https://citeseerx.ist.psu.edu/document?repid=rep1&type=pdf&doi=933cba585a12e56a8f60511ebeb74b8cb42634b1
	// https://github.com/spalaciob/py-dbclasd
	constructor() {
		this._d = (a, b) => Math.sqrt(a.reduce((s, v, i) => s + (v - b[i]) ** 2, 0))
	}

	/**
	 * Returns predicted categories.
	 *
	 * @param {Array<Array<number>>} datas Training data
	 * @returns {number[]} Predicted values
	 */
	predict(datas) {
		const n = datas.length
		const d = Array(n)
		for (let i = 0; i < n; i++) {
			d[i] = []
			d[i][i] = 0
			for (let j = 0; j < i; j++) {
				const v = this._d(datas[i], datas[j])
				d[i][j] = d[j][i] = v
			}
		}
		const nn = []
		for (let i = 0; i < n; i++) {
			nn[i] = d[i].map((v, j) => ({ d: v, i: j }))
			nn[i].sort((a, b) => a.d - b.d)
		}

		const processed = Array(n).fill(false)
		const clusters = []
		for (let i = 0; i < n; i++) {
			if (processed[i]) continue
			processed[i] = true
			let candidates = []

			const cluster = nn[i].slice(0, 30).map(v => v.i)
			let m = 0
			for (let s = 0; s < cluster.length; s++) {
				processed[cluster[s]] = true
				for (let t = 0; t < s; t++) {
					m = Math.max(m, d[cluster[s]][cluster[t]])
				}
			}
			for (const p1 of cluster) {
				for (let j = 1; j < n; j++) {
					if (nn[p1][j].d > m) {
						break
					}
					const ans = nn[p1][j].i
					if (!processed[ans]) {
						processed[ans] = true
						candidates.push(ans)
					}
				}
			}

			let change = true
			while (change) {
				change = false
				const unsuccess = []
				while (candidates.length > 0) {
					const p = candidates.shift()
					const tmpcluster = [...cluster, p]
					const nndist = []
					for (let s = 0; s < tmpcluster.length; s++) {
						nndist[s] = Infinity
						for (let t = 0; t < tmpcluster.length; t++) {
							if (s === t) continue
							nndist[s] = Math.min(nndist[s], d[tmpcluster[s]][tmpcluster[t]])
						}
					}
					const area = this._area(datas, tmpcluster, nndist)
					const acc = this._chiSquareTest(datas, area, nndist)
					if (acc) {
						cluster.push(p)
						for (let s = 0; s < cluster.length; s++) {
							m = Math.max(m, d[cluster[s]][p])
						}
						for (let j = 1; j < n; j++) {
							if (nn[p][j].d > m) {
								break
							}
							const ans = nn[p][j].i
							if (!processed[ans]) {
								processed[ans] = true
								candidates.push(ans)
							}
						}
						change = true
					} else {
						unsuccess.push(p)
					}
				}
				candidates = unsuccess
			}
			clusters.push(cluster)
			for (const i of candidates) {
				processed[i] = false
			}
		}

		clusters.reverse()
		const pred = Array(n).fill(-1)
		for (let k = 0; k < clusters.length; k++) {
			for (const i of clusters[k]) {
				pred[i] = k
			}
		}
		return pred
	}

	_chiSquareTest(datas, area, nndist) {
		const d = datas[0].length
		const obsdd = nndist.concat()
		obsdd.sort((a, b) => a - b)

		let chi2 = 0
		for (let i = 0; i < obsdd.length; i++) {
			const spvol = Math.exp(d * Math.log(obsdd[i]) - logGamma(d / 2 + 1) + (d / 2) * Math.log(Math.PI))
			const expect = 1 - (1 - Math.max(0, Math.min(1, spvol / area))) ** (i + 1)
			chi2 += ((i + 1) / obsdd.length - expect) ** 2 / expect
		}

		return cumChiSquared(chi2, obsdd.length) < 0.95
	}

	_area(datas, c, nndist) {
		const gl = nndist.reduce((s, v) => Math.max(s, v), 0)

		const dim = datas[0].length
		const min = Array(dim).fill(Infinity)
		const max = Array(dim).fill(-Infinity)
		for (let i = 0; i < c.length; i++) {
			for (let d = 0; d < dim; d++) {
				min[d] = Math.min(min[d], datas[c[i]][d])
				max[d] = Math.max(max[d], datas[c[i]][d])
			}
		}

		const counts = []
		const steps = []
		let curcnt = [counts]
		for (let d = 0; d < dim; d++) {
			steps[d] = []
			const len = Math.ceil((max[d] - min[d]) / gl)
			const st = (len * gl - (max[d] - min[d])) / 2 + min[d]
			for (let i = 0; i <= len; i++) {
				steps[d][i] = st + i * gl
			}

			const nxtcnt = []
			for (let i = 0; i < curcnt.length; i++) {
				for (let k = 0; k <= len; k++) {
					if (d === dim - 1) {
						curcnt[i].push(0)
					} else {
						nxtcnt.push((curcnt[i][k] = []))
					}
				}
			}
			curcnt = nxtcnt
		}
		let volume = 0
		for (const i of c) {
			let cnt = counts
			for (let d = 0; d < dim; d++) {
				let k = 0
				for (; k < steps[d].length - 1; k++) {
					if (steps[d][k] <= datas[i][d] && datas[i][d] < steps[d][k + 1]) {
						break
					}
				}
				if (d === dim - 1) {
					if (cnt[k] === 0) {
						volume++
					}
					cnt[k]++
				} else {
					cnt = cnt[k]
				}
			}
		}

		return volume * gl ** dim
	}
}
