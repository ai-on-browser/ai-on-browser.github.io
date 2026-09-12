/**
 * Histogram-based Outlier Score
 */
export default class HBOS {
	// Histogram-based Outlier Score (HBOS): A fast Unsupervised Anomaly Detection Algorithm
	// https://www.goldiges.de/publications/HBOS-KI-2012.pdf
	_histogram(x) {
		const n = x.length
		const m = x.reduce((s, v) => s + v, 0) / n
		const v = x.reduce((s, v) => s + (v - m) ** 2, 0) / n
		const std = Math.sqrt(v)
		const size = std * Math.cbrt((24 * Math.sqrt(Math.PI)) / n)

		const sx = x.map((v, i) => ({ v, i }))
		sx.sort((a, b) => a.v - b.v)

		const ranges = [sx[0].v, sx[0].v + size]
		const dense = [0]
		let p = 1
		let max = 0
		const idx = []
		for (let i = 0; i < n; i++) {
			if (ranges[p] < sx[i].v) {
				ranges[p + 1] = ranges[p] + size
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
