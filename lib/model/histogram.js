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

	_to_pos(idx) {
		let p = 0
		for (let i = 0; i < idx.length; i++) {
			p = p * this._ranges[i].length + idx[i]
		}
		return p
	}

	_to_index(pos) {
		const idx = []
		for (let k = this._ranges.length - 1; k >= 0; k--) {
			idx[k] = pos % this._ranges[k].length
			pos = Math.floor(pos / this._ranges[k].length)
		}
		return idx
	}

	_data_to_index(v) {
		const idx = []
		for (let i = 0; i < v.length; i++) {
			if (v[i] < this._ranges[i][0] || this._ranges[i][this._ranges[i].length - 1] < v[i]) {
				return null
			}
			let k = 0
			for (; k < this._ranges[i].length - 1; k++) {
				if (v[i] <= this._ranges[i][k + 1]) {
					break
				}
			}
			idx.push(k)
		}
		return idx
	}

	/**
	 * Returns histogram data.
	 * @param {Array<Array<number>>} datas Training data
	 * @returns {number[]} Predicted values
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

		const cnt = this._ranges.reduce((s, v) => s * v.length, 1)
		this._dense = Array(cnt).fill(0)
		this._separate_datas = Array.from({ length: cnt }, () => [])

		for (const data of datas) {
			const idx = this._data_to_index(data)
			const p = this._to_pos(idx)
			this._dense[p]++
			this._separate_datas[p].push(data)
		}
		return this._dense
	}

	/**
	 * Returns predicted counted values.
	 * @param {Array<Array<number>>} datas Sample data
	 * @returns {number[]} Predicted values
	 */
	predict(datas) {
		return datas.map(data => {
			const idx = this._data_to_index(data)
			if (!idx) {
				return 0
			}
			return this._dense[this._to_pos(idx)]
		})
	}
}
