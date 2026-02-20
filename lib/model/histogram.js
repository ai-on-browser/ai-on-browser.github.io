import Matrix from '../util/matrix.js'

/**
 * Histogram
 */
export default class Histogram {
	/**
	 * @param {object} [config] Config
	 * @param {Array<Array<number>>} [config.range] Bin ranges
	 * @param {Array<[number, number]>} [config.domain] Domain of each dimension
	 * @param {number} [config.size] Bin size
	 * @param {number} [config.count] Bin count
	 * @param {'fd' | 'scott' | 'rice' | 'sturges' | 'doane' | 'sqrt'} [config.binMethod] Bin method
	 */
	constructor(config = {}) {
		this._config = config
	}

	/**
	 * Returns histogram data.
	 * @param {Array<Array<number>>} datas Training data
	 * @returns {*[]} Predicted values. An array nested by the number of dimensions of the data
	 */
	fit(datas) {
		let binRanges = this._config.range
		if (!binRanges) {
			let domain = this._config.domain
			if (!domain) {
				domain = datas[0].map(v => [v, v])
				for (let i = 0; i < datas.length; i++) {
					for (let d = 0; d < datas[i].length; d++) {
						domain[d][0] = Math.min(datas[i][d], domain[d][0])
						domain[d][1] = Math.max(datas[i][d], domain[d][1])
					}
				}
			}

			let size = this._config.size
			let count = this._config.count
			if (!size && !count) {
				// https://numpy.org/doc/stable/reference/generated/numpy.histogram_bin_edges.html
				const auto = this._config.binMethod || 'scott'
				const x = Matrix.fromArray(datas)
				const n = datas.length
				if (auto === 'fd') {
					const iqr = x.quantile(0.75, 0)
					const q1 = x.quantile(0.25, 0)
					iqr.sub(q1)
					size = iqr.value.map(v => (2 * v) / Math.cbrt(n))
				} else if (auto === 'scott') {
					size = x.std(0).value.map(v => v * Math.cbrt((24 * Math.sqrt(Math.PI)) / n))
				} else if (auto === 'rice') {
					count = 2 * Math.cbrt(n)
				} else if (auto === 'sturges') {
					count = Math.log2(n) + 1
				} else if (auto === 'doane') {
					x.sub(x.mean(0))
					x.div(x.std(0))
					x.map(v => v ** 3)
					count =
						1 +
						Math.log2(n) +
						Math.log2(1 + Math.abs(x.mean()) / Math.sqrt((6 * (n - 1)) / ((n + 1) * (n + 3))))
				} else if (auto === 'sqrt') {
					count = Math.sqrt(n)
				}
			}
			this._size = size
			this._count = count
			if (size) {
				if (!Array.isArray(size)) {
					size = Array(domain.length).fill(size)
				}
				binRanges = domain.map((r, k) => {
					const [min, max] = r
					const v = [min]
					let i = 0
					while (min + ++i * size[k] < max + size[k]) {
						v.push(min + i * size[k])
					}
					return v
				})
			} else {
				count = count || 10
				if (!Array.isArray(count)) {
					count = Array(domain.length).fill(count)
				}
				binRanges = domain.map((r, k) => {
					const [min, max] = r
					const d = (max - min) / count[k]
					const v = [min]
					for (let i = 1; i < count[k]; i++) {
						v.push(min + i * d)
					}
					v.push(max)
					return v
				})
			}
		}
		this._ranges = binRanges

		const dense = []
		const dat = []
		let stack = [[dense, dat]]
		for (let k = 0; k < this._ranges.length; k++) {
			const nstack = []
			const l = this._ranges[k].length
			for (const [pdense, pdat] of stack) {
				for (let i = 0; i < l - 1; i++) {
					if (k === this._ranges.length - 1) {
						pdense.push(0)
						pdat.push([])
					} else {
						pdense[i] = []
						pdat[i] = []
						nstack.push([pdense[i], pdat[i]])
					}
				}
			}
			stack = nstack
		}

		for (const data of datas) {
			let ds = dense
			let dt = dat
			for (let i = 0; i < data.length; i++) {
				let k = 0
				for (; k < this._ranges[i].length - 1; k++) {
					if (data[i] <= this._ranges[i][k + 1]) {
						break
					}
				}
				if (i === data.length - 1) {
					ds[k]++
					dt[k].push(data)
				} else {
					ds = ds[k]
					dt = dt[k]
				}
			}
		}
		this._separate_datas = dat
		this._dense = dense
		return dense
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
