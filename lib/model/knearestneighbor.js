/**
 * Bsae class for k-nearest neighbor models
 */
class KNNBase {
	/**
	 * @param {number} [k=5] Number of neighborhoods
	 * @param {'euclid' | 'manhattan' | 'chebyshev' | 'minkowski' | function (number[], number[]): number} [metric=euclid] Metric name
	 */
	constructor(k = 5, metric = 'euclid') {
		this._p = []
		this._c = []
		this._k = k

		this._metric = metric
		if (typeof this._metric === 'function') {
			this._d = this._metric
		} else {
			switch (this._metric) {
				case 'euclid':
					this._d = (a, b) => Math.sqrt(a.reduce((s, v, i) => s + (v - b[i]) ** 2, 0))
					break
				case 'manhattan':
					this._d = (a, b) => a.reduce((s, v, i) => s + Math.abs(v - b[i]), 0)
					break
				case 'chebyshev':
					this._d = (a, b) => Math.max(...a.map((v, i) => Math.abs(v - b[i])))
					break
				case 'minkowski':
					this._dp = 2
					this._d = (a, b) =>
						Math.pow(
							a.reduce((s, v, i) => s + (v - b[i]) ** this._dp, 0),
							1 / this._dp
						)
					break
			}
		}
	}

	_near_points(data) {
		const ps = []
		this._p.forEach((p, i) => {
			const d = this._d(data, p)
			if (ps.length < this._k || d < ps[this._k - 1].d) {
				if (ps.length >= this._k) ps.pop()
				ps.push({
					d: d,
					category: this._c[i],
					idx: i,
				})
				for (let k = ps.length - 1; k > 0; k--) {
					if (ps[k - 1].d > ps[k].d) {
						;[ps[k], ps[k - 1]] = [ps[k - 1], ps[k]]
					}
				}
			}
		})
		return ps
	}

	/**
	 * Add a data.
	 *
	 * @param {number[]} point Training data
	 * @param {*} [category] Target value
	 */
	_add(point, category) {
		this._p.push(point)
		this._c.push(category)
	}
}

/**
 * k-nearest neighbor
 */
export class KNN extends KNNBase {
	/**
	 * @param {number} [k=5] Number of neighborhoods
	 * @param {'euclid' | 'manhattan' | 'chebyshev' | 'minkowski' | function (number[], number[]): number} [metric=euclid] Metric name
	 */
	constructor(k = 5, metric = 'euclid') {
		super(k, metric)
	}

	/**
	 * Add a data.
	 *
	 * @param {number[]} point Training data
	 * @param {*} category Target value
	 */
	add(point, category) {
		super._add(point, category)
	}

	/**
	 * Add datas.
	 *
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
	 *
	 * @param {Array<Array<number>>} datas Sample data
	 * @returns {*[]} Predicted values
	 */
	predict(datas) {
		return datas.map(data => {
			const ps = this._near_points(data)
			const clss = {}
			ps.forEach(p => {
				let cat = p.category
				if (!clss[cat]) {
					clss[cat] = {
						category: cat,
						count: 1,
						min_d: p.d,
					}
				} else {
					clss[cat].count += 1
					clss[cat].min_d = Math.min(clss[cat].min_d, p.d)
				}
			})
			let max_count = 0
			let min_dist = -1
			let target_cat = null
			for (let k of Object.keys(clss)) {
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
 * k-nearest neighbor regression
 */
export class KNNRegression extends KNNBase {
	/**
	 * @param {number} [k=5] Number of neighborhoods
	 * @param {'euclid' | 'manhattan' | 'chebyshev' | 'minkowski' | function (number[], number[]): number} [metric=euclid] Metric name
	 */
	constructor(k = 5, metric = 'euclid') {
		super(k, metric)
	}

	/**
	 * Add a data.
	 *
	 * @param {number[]} point Training data
	 * @param {number} category Target value
	 */
	add(point, category) {
		super._add(point, category)
	}

	/**
	 * Add datas.
	 *
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
	 *
	 * @param {Array<Array<number>>} datas Sample data
	 * @returns {number[]} Predicted values
	 */
	predict(datas) {
		return datas.map(data => {
			const ps = this._near_points(data)
			return ps.reduce((acc, v) => acc + v.category, 0) / ps.length
		})
	}
}

/**
 * k-nearest neighbor anomaly detection
 */
export class KNNAnomaly extends KNNBase {
	/**
	 * @param {number} [k=5] Number of neighborhoods
	 * @param {'euclid' | 'manhattan' | 'chebyshev' | 'minkowski' | function (number[], number[]): number} [metric=euclid] Metric name
	 */
	constructor(k = 5, metric = 'euclid') {
		super(k, metric)
	}

	/**
	 * Add a data.
	 *
	 * @param {number[]} point Training data
	 */
	add(point) {
		super._add(point)
	}

	/**
	 * Add datas.
	 *
	 * @param {Array<Array<number>>} datas Training data
	 */
	fit(datas) {
		for (let i = 0; i < datas.length; i++) {
			this.add(datas[i])
		}
	}

	/**
	 * Returns anomaly degrees.
	 *
	 * @param {Array<Array<number>>} datas Sample data
	 * @returns {number[]} Predicted values
	 */
	predict(datas) {
		return datas.map(data => {
			const ps = this._near_points(data)
			return ps[ps.length - 1].d
		})
	}
}

/**
 * k-nearest neighbor density estimation
 */
export class KNNDensityEstimation extends KNNBase {
	// https://home.hiroshima-u.ac.jp/tkurita/lecture/prnn/node12.html
	/**
	 * @param {number} [k=5] Number of neighborhoods
	 * @param {'euclid' | 'manhattan' | 'chebyshev' | 'minkowski' | function (number[], number[]): number} [metric=euclid] Metric name
	 */
	constructor(k = 5, metric = 'euclid') {
		super(k, metric)
	}

	/**
	 * Add a data.
	 *
	 * @param {number[]} point Training data
	 */
	add(point) {
		super._add(point)
	}

	/**
	 * Add datas.
	 *
	 * @param {Array<Array<number>>} datas Training data
	 */
	fit(datas) {
		for (let i = 0; i < datas.length; i++) {
			this.add(datas[i])
		}
	}

	_logGamma(z) {
		// https://ja.wikipedia.org/wiki/%E3%82%AC%E3%83%B3%E3%83%9E%E9%96%A2%E6%95%B0
		let x = 0
		if (Number.isInteger(z)) {
			for (let i = 2; i < z; i++) {
				x += Math.log(i)
			}
		} else {
			const n = z - 0.5
			x = Math.log(Math.sqrt(Math.PI)) - Math.log(2) * n
			for (let i = 2 * n - 1; i > 0; i -= 2) {
				x += Math.log(i)
			}
		}
		return x
	}

	/**
	 * Returns predicted values.
	 *
	 * @param {Array<Array<number>>} datas Sample data
	 * @returns {number[]} Predicted values
	 */
	predict(datas) {
		return datas.map(data => {
			const ps = this._near_points(data)
			const r = ps[ps.length - 1].d
			const d = data.length
			const ilogv = this._logGamma(d / 2 + 1) - (d / 2) * Math.log(Math.PI) - d * Math.log(r)
			return (Math.exp(ilogv) * this._k) / this._p.length
		})
	}
}

/**
 * Semi-supervised k-nearest neighbor
 */
export class SemiSupervisedKNN extends KNNBase {
	// https://products.sint.co.jp/aisia/blog/vol1-20
	/**
	 * @param {number} [k=5] Number of neighborhoods
	 * @param {'euclid' | 'manhattan' | 'chebyshev' | 'minkowski' | function (number[], number[]): number} [metric=euclid] Metric name
	 */
	constructor(k = 5, metric = 'euclid') {
		super(k, metric)
		this._k = Infinity
		this._orgk = k
	}

	/**
	 * Add a data.
	 *
	 * @param {number[]} point Training data
	 * @param {* | null} category Target value
	 */
	add(point, category) {
		super._add(point, category)
	}

	/**
	 * Add datas.
	 *
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
	 *
	 * @returns {*[]} Predicted values
	 */
	predict() {
		while (true) {
			const tmpnear = []
			for (let i = 0; i < this._p.length; i++) {
				if (this._c[i] != null) {
					let cnt = 0
					const ps = this._near_points(this._p[i])
					for (const p of ps) {
						if (p.category == null) {
							if (p.d < (tmpnear[p.idx]?.d ?? Infinity)) {
								tmpnear[p.idx] = {
									d: p.d,
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
