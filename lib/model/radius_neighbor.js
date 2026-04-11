const metrics = {
	euclid: () => (a, b) => Math.sqrt(a.reduce((s, v, i) => s + (v - b[i]) ** 2, 0)),
	manhattan: () => (a, b) => a.reduce((s, v, i) => s + Math.abs(v - b[i]), 0),
	chebyshev: () => (a, b) => Math.max(...a.map((v, i) => Math.abs(v - b[i]))),
	minkowski:
		({ p = 2 } = {}) =>
		(a, b) =>
			a.reduce((s, v, i) => s + (v - b[i]) ** p, 0) ** (1 / p),
}

/**
 * radius neighbor
 */
export class RadiusNeighbor {
	// https://scikit-learn.org/stable/modules/generated/sklearn.neighbors.RadiusNeighborsClassifier.html
	/**
	 * @param {number} [r] Radius to determine neighborhood
	 * @param {'euclid' | 'manhattan' | 'chebyshev' | 'minkowski' | function (number[], number[]): number} [metric] Metric name
	 */
	constructor(r = 1, metric = 'euclid') {
		this._p = []
		this._c = []
		this._r = r
		this._metric = metric
		if (typeof this._metric === 'function') {
			this._d = this._metric
		} else {
			this._d = metrics[this._metric]()
		}
	}

	/**
	 * Add a data.
	 * @param {number[]} point Training data
	 * @param {*} category Target value
	 */
	add(point, category) {
		this._p.push(point)
		this._c.push(category)
	}

	/**
	 * Add datas.
	 * @param {Array<Array<number>>} datas Training data
	 * @param {*[]} targets Target values
	 */
	fit(datas, targets) {
		for (let i = 0; i < datas.length; i++) {
			this.add(datas[i], targets[i])
		}
	}

	/**
	 * Returns predicted categories.
	 * @param {Array<Array<number>>} datas Sample data
	 * @returns {(* | null)[]} Predicted values
	 */
	predict(datas) {
		return datas.map(data => {
			const clss = {}
			for (let i = 0; i < this._p.length; i++) {
				const d = this._d(data, this._p[i])
				if (d >= this._r) {
					continue
				}
				const cat = this._c[i]
				if (!clss[cat]) {
					clss[cat] = {
						category: cat,
						count: 1,
						min_d: d,
					}
				} else {
					clss[cat].count += 1
					clss[cat].min_d = Math.min(clss[cat].min_d, d)
				}
			}
			let max_count = 0
			let min_dist = -1
			let target_cat = null
			for (const k of Object.keys(clss)) {
				if (max_count < clss[k].count || (max_count === clss[k].count && clss[k].min_d < min_dist)) {
					max_count = clss[k].count
					min_dist = clss[k].min_d
					target_cat = clss[k].category
				}
			}
			return target_cat
		})
	}
}

/**
 * radius neighbor regression
 */
export class RadiusNeighborRegression {
	/**
	 * @param {number} [r] Radius to determine neighborhood
	 * @param {'euclid' | 'manhattan' | 'chebyshev' | 'minkowski' | function (number[], number[]): number} [metric] Metric name
	 */
	constructor(r = 1, metric = 'euclid') {
		this._p = []
		this._c = []
		this._r = r
		this._metric = metric
		if (typeof this._metric === 'function') {
			this._d = this._metric
		} else {
			this._d = metrics[this._metric]()
		}
	}

	/**
	 * Add a data.
	 * @param {number[]} point Training data
	 * @param {number} category Target value
	 */
	add(point, category) {
		this._p.push(point)
		this._c.push(category)
	}

	/**
	 * Add datas.
	 * @param {Array<Array<number>>} datas Training data
	 * @param {number[]} targets Target values
	 */
	fit(datas, targets) {
		for (let i = 0; i < datas.length; i++) {
			this.add(datas[i], targets[i])
		}
	}

	/**
	 * Returns predicted values.
	 * @param {Array<Array<number>>} datas Sample data
	 * @returns {(number | null)[]} Predicted values
	 */
	predict(datas) {
		return datas.map(data => {
			let sum = 0
			let n = 0
			this._p.forEach((p, i) => {
				const d = this._d(data, p)
				if (d < this._r) {
					sum += this._c[i]
					n++
				}
			})
			if (n === 0) {
				return null
			}
			return sum / n
		})
	}
}

/**
 * Semi-supervised radius neighbor
 */
export class SemiSupervisedRadiusNeighbor {
	// https://products.sint.co.jp/aisia/blog/vol1-20
	/**
	 * @param {number} [k] Radius to determine neighborhood
	 * @param {'euclid' | 'manhattan' | 'chebyshev' | 'minkowski' | function (number[], number[]): number} [metric] Metric name
	 */
	constructor(k = 5, metric = 'euclid') {
		this._p = []
		this._c = []
		this._r = k
		this._metric = metric
		if (typeof this._metric === 'function') {
			this._d = this._metric
		} else {
			this._d = metrics[this._metric]()
		}
		this._k = Infinity
		this._orgk = k
	}

	/**
	 * Add a data.
	 * @param {number[]} point Training data
	 * @param {* | null} category Target value
	 */
	add(point, category) {
		this._p.push(point)
		this._c.push(category)
	}

	/**
	 * Add datas.
	 * @param {Array<Array<number>>} datas Training data
	 * @param {(* | null)[]} targets Target values
	 */
	fit(datas, targets) {
		for (let i = 0; i < datas.length; i++) {
			this.add(datas[i], targets[i])
		}
	}

	/**
	 * Returns predicted values.
	 * @returns {*[]} Predicted values
	 */
	predict() {
		while (true) {
			const tmpnear = []
			for (let i = 0; i < this._p.length; i++) {
				if (this._c[i] != null) {
					let cnt = 0
					const data = this._p[i]
					for (let j = 0; j < this._p.length; j++) {
						const d = this._d(data, this._p[j])
						if (d >= this._r) {
							continue
						}
						if (this._c[j] == null) {
							if (d < (tmpnear[j]?.d ?? Infinity)) {
								tmpnear[j] = {
									d: d,
									category: this._c[i],
								}
							}
							if (++cnt >= this._orgk) {
								break
							}
						}
					}
				}
			}
			if (tmpnear.length === 0) {
				break
			}
			for (let i = 0; i < this._p.length; i++) {
				if (tmpnear[i]) {
					this._c[i] = tmpnear[i].category
				}
			}
		}
		return this._c
	}
}
