class PriorityQueue {
	constructor(arr) {
		this._value = arr || []
	}

	get length() {
		return this._value.length
	}

	_sort() {
		this._value.sort((a, b) => a[1] - b[1])
	}

	push(value, priority) {
		this._value.push([value, priority])
		this._sort()
	}

	move(value, priority) {
		for (let i = 0; i < this.length; i++) {
			if (this._value[i][0] === value) {
				this._value[i][1] = priority
				this._sort()
				return
			}
		}
		this.push(value, priority)
	}

	shift() {
		const [value] = this._value.shift()
		return value
	}
}

const metrics = {
	euclid: (a, b) => Math.sqrt(a.reduce((s, v, i) => s + (v - b[i]) ** 2, 0)),
	manhattan: (a, b) => a.reduce((s, v, i) => s + Math.abs(v - b[i]), 0),
	chebyshev: (a, b) => Math.max(...a.map((v, i) => Math.abs(v - b[i]))),
}

/**
 * Ordering points to identify the clustering structure
 */
export default class OPTICS {
	// https://en.wikipedia.org/wiki/OPTICS_algorithm
	/**
	 * @param {number} threshold Threshold
	 * @param {number} [eps] Radius to determine neighborhood
	 * @param {number} [minPts] Number of neighborhood with core distance
	 * @param {'euclid' | 'manhattan' | 'chebyshev' | function (number[], number[]): number} [metric] Metric name
	 */
	constructor(threshold, eps = Infinity, minPts = 5, metric = 'euclid') {
		this._threshold = threshold
		this._eps = eps
		this._minPts = minPts

		this._metric = metric
		if (typeof this._metric === 'function') {
			this._d = this._metric
		} else {
			this._d = metrics[this._metric]
		}
	}

	/**
	 * Fit model.
	 * @param {Array<Array<number>>} datas Training data
	 */
	fit(datas) {
		const n = datas.length
		const d = Array(n)
		for (let i = 0; i < n; d[i++] = Array(n));
		for (let i = 0; i < n; i++) {
			for (let j = 0; j < i; j++) {
				const v = this._d(datas[i], datas[j])
				d[i][j] = d[j][i] = v
			}
		}
		const getNeighbors = i => {
			const neighbors = []
			for (let k = 0; k < n; k++) {
				if (d[i][k] < this._eps) neighbors.push(k)
			}
			return neighbors
		}
		const coreDist = i => {
			const neighbors = getNeighbors(i).map(k => d[i][k])
			if (neighbors.length <= this._minPts) return null
			neighbors.sort((a, b) => a - b)
			return neighbors[this._minPts]
		}

		const processed = Array(n).fill(false)
		const rd = Array(n).fill(null)
		const update = (n, p, seeds) => {
			const cd = coreDist(p)
			if (cd === null) return
			for (const o of n) {
				if (processed[o]) continue
				const nrd = Math.max(cd, d[p][o])
				if (rd[o] === null) {
					rd[o] = nrd
					seeds.push(o, nrd)
				} else if (nrd < rd[o]) {
					rd[o] = nrd
					seeds.move(o, nrd)
				}
			}
		}

		this._core_distance = []
		for (let p = 0; p < n; p++) {
			if (processed[p]) continue
			const neighbors = getNeighbors(p)
			processed[p] = true
			const cd = coreDist(p)
			this._core_distance.push([p, cd])
			if (cd !== null) {
				const seeds = new PriorityQueue()
				update(neighbors, p, seeds)
				while (seeds.length > 0) {
					const q = seeds.shift()
					const nd = getNeighbors(q)
					processed[q] = true
					const cdq = coreDist(q)
					this._core_distance.push([q, cdq])
					if (cdq !== null) {
						update(nd, q, seeds)
					}
				}
			}
		}
	}

	/**
	 * Returns predicted categories.
	 * @returns {number[]} Predicted values
	 */
	predict() {
		let c = 0
		const n = this._core_distance.length
		const clusters = Array(n)
		for (let i = 0; i < n; i++) {
			const [k, d] = this._core_distance[i]
			clusters[k] = d > this._threshold ? ++c : c
		}
		return clusters
	}
}
