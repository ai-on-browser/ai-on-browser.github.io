class GeneticKMeansModel {
	constructor(k) {
		this._k = k
	}

	get centroids() {
		return this._c
	}

	_distance(a, b) {
		return Math.sqrt(a.reduce((s, v, i) => s + (v - b[i]) ** 2, 0))
	}

	init(data) {
		this._data = data

		const n = data.length
		const idx = []
		for (let i = 0; i < this._k; i++) {
			idx.push(Math.floor(Math.random() * (n - i)))
		}
		for (let i = n - 1; i >= 0; i--) {
			for (let j = n - 1; j > i; j--) {
				if (idx[i] <= idx[j]) {
					idx[j]++
				}
			}
		}

		this._c = idx.map(i => this._data[i].concat())
	}

	copy() {
		const cp = new GeneticKMeansModel(this._k)
		cp.init(this._data)
		for (let i = 0; i < this._c.length; i++) {
			cp._c[i] = this._c[i].concat()
		}
		return cp
	}

	cost() {
		const pred = this.predict(this._data)
		let c = 0
		for (let i = 0; i < this._data.length; i++) {
			for (let j = 0; j < this._data[i].length; j++) {
				c += (this._data[i][j] - this._c[pred[i]][j]) ** 2
			}
		}
		return c
	}

	fit() {
		const pred = this.predict(this._data)
		for (let k = 0; k < this._k; k++) {
			const m = Array(this._data[0].length).fill(0)
			let s = 0
			for (let i = 0; i < this._data.length; i++) {
				if (pred[i] !== k) {
					continue
				}
				for (let j = 0; j < m.length; j++) {
					m[j] += this._data[i][j]
				}
				s++
			}
			this._c[k] = m.map(v => v / s)
		}
	}

	predict(datas) {
		return datas.map(value => {
			let min_d = Infinity
			let min_k = -1
			for (let i = 0; i < this._c.length; i++) {
				const d = this._distance(value, this._c[i])
				if (d < min_d) {
					min_d = d
					min_k = i
				}
			}
			return min_k
		})
	}

	mutation(rate, cm) {
		const pred = this.predict(this._data)
		for (let i = 0; i < this._data.length; i++) {
			if (Math.random() >= rate) {
				continue
			}
			const d = this._c.map(c => this._distance(c, this._data[i]))
			if (d[pred[i]] === 0) {
				continue
			}
			const dmax = Math.max(...d)
			const p = d.map(v => cm * dmax - v)
			let r = Math.random() * p.reduce((s, v) => s + v, 0)
			for (let k = 0; k < p.length; k++) {
				r -= p[k]
				if (r <= 0) {
					pred[i] = k
					break
				}
			}
		}

		for (let k = 0; k < this._k; k++) {
			const m = Array(this._data[0].length).fill(0)
			let s = 0
			for (let i = 0; i < this._data.length; i++) {
				if (pred[i] !== k) {
					continue
				}
				for (let j = 0; j < m.length; j++) {
					m[j] += this._data[i][j]
				}
				s++
			}
			this._c[k] = m.map(v => v / s)
		}
	}
}

/**
 * Genetic k-means model
 */
export default class GeneticKMeans {
	// https://deepblue-ts.co.jp/machine-learning/genetic-k-means-alogorithm/
	// https://citeseerx.ist.psu.edu/viewdoc/download?doi=10.1.1.520.6737&rep=rep1&type=pdf
	/**
	 * @param {number} k Number of clusters
	 * @param {number} size Number of models per generation
	 */
	constructor(k, size) {
		this._k = k
		this._size = size
		this._c = 1
		this._pm = 0.1
		this._cm = 1

		this._models = []
		for (let i = 0; i < this._size; i++) {
			this._models[i] = new GeneticKMeansModel(this._k)
		}
	}

	/**
	 * Centroids
	 * @type {Array<Array<number>>}
	 */
	get centroids() {
		return this.bestModel.centroids
	}

	/**
	 * The best model.
	 * @type {GeneticKMeansModel}
	 */
	get bestModel() {
		return this._models[0]
	}

	/**
	 * Initialize model.
	 * @param {Array<Array<number>>} datas Training data
	 */
	init(datas) {
		this._models.forEach(m => m.init(datas))
	}

	/**
	 * Returns predicted categories.
	 * @param {Array<Array<number>>} datas Sample data
	 * @returns {number[]} Predicted values
	 */
	predict(datas) {
		return this.bestModel.predict(datas)
	}

	/**
	 * Fit model.
	 */
	fit() {
		const f = this._models.map(m => -m.cost())
		const m = f.reduce((s, v) => s + v, 0) / f.length
		const s = Math.sqrt(f.reduce((s, v) => s + (v - m) ** 2, 0) / f.length)
		const population = f.map(v => Math.max(0, v - (m - this._c * s)))
		const sum = population.reduce((s, v) => s + v, 0)

		const newModels = []
		for (let i = 0; i < this._size; i++) {
			let r = Math.random() * sum
			for (let k = 0; k < population.length; k++) {
				r -= population[k]
				if (r <= 0) {
					newModels[i] = this._models[k].copy()
				}
			}
		}
		this._models = newModels

		for (let k = 0; k < this._size; k++) {
			this._models[k].mutation(this._pm, this._cm)
			this._models[k].fit()
		}

		const costs = this._models.map((m, i) => [m.cost(), i])
		costs.sort((a, b) => a[0] - b[0])
		this._models = costs.map(v => this._models[v[1]])
	}
}
