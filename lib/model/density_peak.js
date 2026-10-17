const metrics = {
	euclid: (a, b) => Math.sqrt(a.reduce((s, v, i) => s + (v - b[i]) ** 2, 0)),
	manhattan: (a, b) => a.reduce((s, v, i) => s + Math.abs(v - b[i]), 0),
	chebyshev: (a, b) => Math.max(...a.map((v, i) => Math.abs(v - b[i]))),
}

/**
 * Density peak clustering
 */
export default class DensityPeak {
	// https://micheleallegra.github.io/talks/ins_clean.pdf
	// Density-based algorithm: identifies clusters as regions around local maxima of the density
	// Clustering by fast search and find of density peaks
	// https://iris.sissa.it/bitstream/20.500.11767/14183/3/Laio-talk-1.pdf
	/**
	 * @param {number} [eps] Radius to determine neighborhood
	 * @param {'euclid' | 'manhattan' | 'chebyshev' | function (number[], number[]): number} [metric] Metric name
	 */
	constructor(eps = 0.5, metric = 'euclid') {
		this._eps = eps

		this._metric = metric
		if (typeof this._metric === 'function') {
			this._d = this._metric
		} else {
			this._d = metrics[this._metric]
		}
	}

	/**
	 * Returns predicted categories.
	 * @param {Array<Array<number>>} datas Training data
	 * @returns {number[]} Predicted values
	 */
	predict(datas) {
		const n = datas.length
		const d = []
		for (let i = 0; i < n; i++) {
			d[i] = []
			d[i][i] = { d: 0, i }
			for (let j = 0; j < i; j++) {
				const dij = this._d(datas[i], datas[j])
				d[i][j] = { d: dij, i: j }
				d[j][i] = { d: dij, i }
			}
		}
		const rho = []
		for (let i = 0; i < n; i++) {
			const ds = d[i].toSorted((a, b) => a.d - b.d)
			let k = 0
			for (; k < n; k++) {
				if (ds[k].d >= this._eps) {
					break
				}
			}
			rho[i] = { i, v: k }
		}
		const rho_s = rho.toSorted((a, b) => a.v - b.v)
		const delta = []
		const nn_hd = Array.from({ length: n }, () => [])
		for (let i = 0; i < n; i++) {
			let min_d = Infinity
			let min_j = -1
			for (let j = i + 1; j < n; j++) {
				if (rho_s[i].v >= rho_s[j].v) {
					continue
				}
				const dij = d[rho_s[i].i][rho_s[j].i]
				if (dij.d < min_d) {
					min_d = dij.d
					min_j = rho_s[j].i
				}
			}
			delta[rho_s[i].i] = min_d
			if (min_j >= 0) {
				nn_hd[min_j].push(rho_s[i].i)
			}
		}

		const min_delta = delta.reduce((s, v) => (Number.isFinite(v) ? Math.min(s, v) : s), Infinity)
		const max_delta = delta.reduce((s, v) => (Number.isFinite(v) ? Math.max(s, v) : s), -Infinity)
		const threshold = (min_delta + max_delta) / 2
		const clusterCenters = []
		for (let i = 0; i < n; i++) {
			if (delta[i] > threshold) {
				clusterCenters.push(i)
			}
		}

		const cluster = Array(n).fill(-1)
		for (let k = 0; k < clusterCenters.length; k++) {
			const override = cluster[clusterCenters[k]] >= 0
			cluster[clusterCenters[k]] = -1
			const stack = [clusterCenters[k]]
			while (stack.length > 0) {
				const p = stack.pop()
				if (!override && cluster[p] >= 0) {
					continue
				}
				cluster[p] = k
				stack.push(...nn_hd[p])
			}
		}

		return cluster
	}
}
