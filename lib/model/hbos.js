/**
 * Histogram-based Outlier Score
 */
export default class HBOS {
	// Histogram-based Outlier Score (HBOS): A fast Unsupervised Anomaly Detection Algorithm
	// https://www.goldiges.de/publications/HBOS-KI-2012.pdf
	/**
	 * @param {number} k Number of bins or width of bins
	 * @param {'dynamic' | 'static'} method Method of computing histogram
	 */
	constructor(k, method = 'dynamic') {
		this._k = k
		this._method = method
	}

	_histogram(x) {
		const n = x.length
		const sx = x.map((v, i) => ({ v, i }))
		sx.sort((a, b) => a.v - b.v)
		if (this._method === 'static') {
			const ranges = [sx[0].v, sx[0].v + this._k]
			const dense = [0]
			let p = 1
			let max = 0
			const idx = []
			for (let i = 0; i < n; i++) {
				if (ranges[p] < sx[i].v) {
					ranges[p + 1] = ranges[p] + this._k
					dense.push(0)
					p++
				}
				dense[p - 1]++
				idx[sx[i].i] = p - 1
				if (max < dense[p - 1]) {
					max = dense[p - 1]
				}
			}
			const normdense = dense.map(v => v / max)
			return idx.map(i => normdense[i])
		} else {
			const count = n / this._k
			let lastp = 0
			let max = 0
			const dense = [0]
			const idx = []
			for (let k = 0; k < this._k; k++) {
				const nextp = Math.round((k + 1) * count)
				const diff = sx[nextp - 1].v - sx[lastp].v
				dense[k] = 1 / diff
				if (max < dense[k]) {
					max = dense[k]
				}
				for (let i = lastp; i < nextp; i++) {
					idx[sx[i].i] = k
				}
				lastp = nextp
			}
			const normdense = dense.map(v => v / max)
			return idx.map(i => normdense[i])
		}
	}

	/**
	 * Returns anomaly degrees.
	 * @param {Array<Array<number>>} data Training data
	 * @returns {number[]} Predicted values
	 */
	predict(data) {
		const n = data.length
		const d = data[0].length
		const hbos = Array.from(data).fill(0)
		for (let j = 0; j < d; j++) {
			const xj = data.map(v => v[j])
			const h = this._histogram(xj)
			for (let i = 0; i < n; i++) {
				hbos[i] += Math.log(h[i])
			}
		}
		return hbos
	}
}
