import Histogram from './histogram.js'

/**
 * Average shifted histogram
 */
export default class AverageShiftedHistogram {
	// http://www.okadajp.org/RWiki/?%E3%83%92%E3%82%B9%E3%83%88%E3%82%B0%E3%83%A9%E3%83%A0%E3%81%A8%E5%AF%86%E5%BA%A6%E3%81%AE%E6%8E%A8%E5%AE%9A
	/**
	 * @param {object} config Config
	 * @param {Array<[number, number]>} [config.domain] Domain of each dimension
	 * @param {number} config.size Bin size
	 * @param {number} step Number of bins to average
	 */
	constructor(config, step) {
		this._config = config
		this._step = step
	}

	/**
	 * Returns predicted values.
	 * @param {Array<Array<number>>} datas Training data
	 * @returns {*[]} An array nested by the number of dimensions of the data
	 */
	fit(datas) {
		let dataRange = this._config.domain
		if (!dataRange) {
			dataRange = datas[0].map(v => [v, v])
			for (let i = 0; i < datas.length; i++) {
				for (let d = 0; d < datas[i].length; d++) {
					dataRange[d][0] = Math.min(datas[i][d], dataRange[d][0])
					dataRange[d][1] = Math.max(datas[i][d], dataRange[d][1])
				}
			}
		}
		const binSize = this._config.size

		const d = datas[0].length
		const mins = dataRange.map(v => v[0])
		const maxs = dataRange.map(v => v[1])

		const h = []
		const lens = []
		this._ranges = []
		let stack = [h]
		for (let k = 0; k < d; k++) {
			const nstack = []
			const l = Math.ceil((maxs[k] - mins[k]) / binSize)
			lens.push(l)
			for (const p of stack) {
				for (let i = 0; i < l; i++) {
					if (k === d - 1) {
						p.push(0)
					} else {
						p[i] = []
						nstack.push(p[i])
					}
				}
			}
			this._ranges[k] = [mins[k]]
			let i = 0
			while (mins[k] + ++i * binSize < maxs[k] + binSize) {
				this._ranges[k].push(mins[k] + i * binSize)
			}
			stack = nstack
		}

		const nextIndex = (idx, sizes) => {
			for (let i = 0; i < idx.length; i++) {
				idx[i]++
				if (idx[i] < sizes[i]) return true
				idx[i] = 0
			}
			return false
		}

		const k = Array(d).fill(0)
		const kmax = Array(d).fill(this._step)
		do {
			const bins = []
			for (let j = 0; j < d; j++) {
				const r = [mins[j] - k[j] * binSize, maxs[j]]
				bins.push(r)
			}
			const hist = new Histogram({ domain: bins, size: this._step * binSize }).fit(datas)
			const idx = Array(d).fill(0)
			do {
				let hd = h
				let hs = hist
				for (let i = 0; i < d - 1; i++) {
					hd = hd[idx[i]]
					hs = hs[Math.floor((idx[i] + k[i]) / this._step)]
				}
				hd[idx[d - 1]] += hs[Math.floor((idx[d - 1] + k[d - 1]) / this._step)]
			} while (nextIndex(idx, lens))
		} while (nextIndex(k, kmax))

		const idx = Array(d).fill(0)
		do {
			let hd = h
			for (let i = 0; i < d - 1; i++) {
				hd = hd[idx[i]]
			}
			hd[idx[d - 1]] /= this._step ** d
		} while (nextIndex(idx, lens))
		this._dense = h
		return h
	}

	/**
	 * Returns predicted counted values.
	 * @param {Array<Array<number>>} datas Sample data
	 * @returns {number[]} Predicted values
	 */
	predict(datas) {
		return datas.map(data => {
			let ds = this._dense
			for (let i = 0; i < data.length; i++) {
				if (data[i] < this._ranges[i][0] || this._ranges[i][this._ranges[i].length - 1] < data[i]) {
					return 0
				}
				let k = 0
				for (; k < this._ranges[i].length - 1; k++) {
					if (data[i] <= this._ranges[i][k + 1]) {
						break
					}
				}
				ds = ds[k]
			}
			return ds
		})
	}
}
