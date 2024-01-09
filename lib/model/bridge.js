import { KMeanspp } from './kmeans.js'
import DBSCAN from './dbscan.js'

/**
 * BRIDGE
 */
export default class BRIDGE {
	// http://i2pc.es/coss/Docencia/SignalProcessingReviews/Murtagh2012.pdf
	// 1 + 1 > 2: Merging distance and density based clustering
	// https://www.comp.nus.edu.sg/~lingtw/dasfaa_proceedings/dasfaa2001/00916361.pdf
	/**
	 * @param {number} k K-means clustering size
	 * @param {number} e_core e for core distance
	 * @param {number} e_den e for density base clustering
	 */
	constructor(k, e_core, e_den) {
		this._k = k
		this._e_core = e_core
		this._e_den = e_den
	}

	_distance(a, b) {
		return Math.sqrt(a.reduce((s, v, i) => s + (v - b[i]) ** 2, 0))
	}

	/**
	 * Returns predicted categories.
	 *
	 * @param {Array<Array<number>>} datas Training data
	 * @returns {number[]} Predicted values
	 */
	predict(datas) {
		const n = datas.length
		const dim = datas[0].length

		const kmeans = new KMeanspp()
		for (let i = 0; i < this._k; i++) {
			kmeans.add(datas)
		}
		while (kmeans.fit(datas) > 0);
		const cranges = []
		const coredist = Array(this._k).fill(Infinity)
		for (let i = 0; i < this._k; i++) {
			for (let j = i + 1; j < this._k; j++) {
				const d = this._distance(kmeans.centroids[i], kmeans.centroids[j]) / 2
				if (d < coredist[i]) {
					coredist[i] = d
				}
				if (d < coredist[j]) {
					coredist[j] = d
				}
			}
			cranges[i] = Array.from({ length: dim }, () => [Infinity, -Infinity])
		}
		const p = kmeans.predict(datas)
		const nk = Array(this._k).fill(0)
		const core_points = Array.from({ length: this._k }, () => [])
		const ecore_points = Array.from({ length: this._k }, () => [])
		const noncore_points = []
		const trange = Array.from({ length: dim }, () => [Infinity, -Infinity])
		for (let i = 0; i < n; i++) {
			const k = p[i]
			nk[k]++
			for (let j = 0; j < dim; j++) {
				cranges[k][j][0] = Math.min(cranges[k][j][0], datas[i][j])
				cranges[k][j][1] = Math.max(cranges[k][j][1], datas[i][j])
				trange[j][0] = Math.min(trange[j][0], datas[i][j])
				trange[j][1] = Math.max(trange[j][1], datas[i][j])
			}
			const d = this._distance(kmeans.centroids[k], datas[i])
			if (d < coredist[k] - this._e_core) {
				core_points[k].push(i)
			} else if (d < coredist[k] + this._e_core) {
				ecore_points[k].push(i)
			} else {
				noncore_points.push(i)
			}
		}

		const pd = Array(n).fill(-1)
		let evol = 1
		if (dim === 1) {
			evol = 2 * this._e_den
		} else if (dim === 2) {
			evol = Math.PI * this._e_den ** 2
		} else if (dim === 3) {
			evol = (4 / 3) * Math.PI * this._e_den ** 3
		} else {
			evol = (2 * this._e_den) ** dim
		}
		let offset = 0
		for (let k = 0; k < this._k; k++) {
			const tvol = cranges[k].reduce((s, v) => s * (v[1] - v[0]), 1)
			const minpts = (evol / tvol) * nk[k]
			const dbscan = new DBSCAN(this._e_den, minpts)

			const cp = core_points[k].concat(ecore_points[k])
			const p = dbscan.predict(cp.map(i => datas[i]))
			let max_p = offset
			for (let i = 0; i < cp.length; i++) {
				if (p[i] >= 0) {
					pd[cp[i]] = offset + p[i]
					max_p = Math.max(max_p, offset + p[i])
				}
			}
			offset = max_p + 1
		}

		const tvol = trange.reduce((s, v) => s * (v[1] - v[0]), 1)
		const dbscan = new DBSCAN(this._e_den, (evol / tvol) * n)
		const ecp = ecore_points.reduce((p, e) => p.concat(e), noncore_points)
		const pe = dbscan.predict(ecp.map(i => datas[i]))
		const match = []
		for (let i = 0; i < ecp.length; i++) {
			if (pd[ecp[i]] >= 0 && pe[i] >= 0 && match[pe[i]] == null) {
				match[pe[i]] = pd[ecp[i]]
			}
		}
		for (let i = 0; i < ecp.length; i++) {
			if (pd[ecp[i]] < 0 && pe[i] >= 0) {
				pd[ecp[i]] = match[pe[i]]
			}
		}
		return (this._clusters = pd)
	}
}
