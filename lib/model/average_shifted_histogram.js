import { Histogram } from './histogram.js'

/**
 * Returns average shifted histogram result.
 * @function
 * @param {Array<Array<number>>} datas
 * @param {object} config
 * @param {Array<[number, number]>} config.domain
 * @param {number} config.size
 * @param {number} step
 * @returns {*[]} An array nested by the number of dimensions of the data
 */
const averageShiftedHistogram = (datas, config, step) => {
	// http://www.okadajp.org/RWiki/?%E3%83%92%E3%82%B9%E3%83%88%E3%82%B0%E3%83%A9%E3%83%A0%E3%81%A8%E5%AF%86%E5%BA%A6%E3%81%AE%E6%8E%A8%E5%AE%9A
	const dataRange = config.domain
	const binSize = config.size

	const d = datas[0].length
	const mins = dataRange.map(v => v[0])
	const maxs = dataRange.map(v => v[1])

	const h = []
	const lens = []
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
					nstack.push((p[i] = []))
				}
			}
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
	const kmax = Array(d).fill(step)
	do {
		const bins = []
		for (let j = 0; j < d; j++) {
			const r = [mins[j] - k[j] * binSize, maxs[j]]
			bins.push(r)
		}
		const hist = new Histogram({ domain: bins, size: step * binSize }).fit(datas)
		const idx = Array(d).fill(0)
		do {
			let hd = h
			let hs = hist
			for (let i = 0; i < d - 1; i++) {
				hd = hd[idx[i]]
				hs = hs[Math.floor((idx[i] + k[i]) / step)]
			}
			hd[idx[d - 1]] += hs[Math.floor((idx[d - 1] + k[d - 1]) / step)]
		} while (nextIndex(idx, lens))
	} while (nextIndex(k, kmax))

	const idx = Array(d).fill(0)
	do {
		let hd = h
		for (let i = 0; i < d - 1; i++) {
			hd = hd[idx[i]]
		}
		hd[idx[d - 1]] /= step ** d
	} while (nextIndex(idx, lens))
	return h
}

export default averageShiftedHistogram
