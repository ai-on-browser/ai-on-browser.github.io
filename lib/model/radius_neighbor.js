class RadiusNeighborBase {
	// https://scikit-learn.org/stable/modules/generated/sklearn.neighbors.RadiusNeighborsClassifier.html
	/**
	 * @param {number} [r=1]
	 * @param {'euclid' | 'manhattan' | 'chebyshev' | 'minkowski'} [metric='euclid']
	 */
	constructor(r = 1, metric = 'euclid') {
		this._p = []
		this._c = []
		this._r = r

		this._metric = metric
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
						a.reduce((s, v, i) => s * (v - b[i]) ** this._dp, 0),
						1 / this._dp
					)
				break
		}
	}

	_near_points(data) {
		const ps = []
		this._p.forEach((p, i) => {
			const d = this._d(data, p)
			if (d < this._r) {
				ps.push({
					d: d,
					category: this._c[i],
					idx: i,
				})
			}
		})
		return ps
	}

	/**
	 * Add a data.
	 * @param {number[]} point
	 * @param {*} [category]
	 */
	_add(point, category) {
		this._p.push(point)
		this._c.push(category)
	}
}

/**
 * radius neighbor
 */
export class RadiusNeighbor extends RadiusNeighborBase {
	/**
	 * @param {number} [r=1]
	 * @param {'euclid' | 'manhattan' | 'chebyshev' | 'minkowski'} [metric='euclid']
	 */
	constructor(r = 1, metric = 'euclid') {
		super(r, metric)
	}

	/**
	 * Add a data.
	 * @param {number[]} point
	 * @param {*} category
	 */
	add(point, category) {
		super._add(point, category)
	}

	/**
	 * Add datas.
	 * @param {Array<Array<number>>} datas
	 * @param {*[]} targets
	 */
	fit(datas, targets) {
		for (let i = 0; i < datas.length; i++) {
			this.add(datas[i], targets[i])
		}
	}

	/**
	 * Returns predicted categories.
	 * @param {Array<Array<number>>} datas
	 * @returns {*[]}
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
 * radius neighbor regression
 */
export class RadiusNeighborRegression extends RadiusNeighborBase {
	/**
	 * @param {number} [r=1]
	 * @param {'euclid' | 'manhattan' | 'chebyshev' | 'minkowski'} [metric='euclid']
	 */
	constructor(r = 1, metric = 'euclid') {
		super(r, metric)
	}

	/**
	 * Add a data.
	 * @param {number[]} point
	 * @param {number} category
	 */
	add(point, category) {
		super._add(point, category)
	}

	/**
	 * Add datas.
	 * @param {Array<Array<number>>} datas
	 * @param {number[]} targets
	 */
	fit(datas, targets) {
		for (let i = 0; i < datas.length; i++) {
			this.add(datas[i], targets[i])
		}
	}

	/**
	 * Returns predicted values.
	 * @param {Array<Array<number>>} datas
	 * @returns {(number | null)[]}
	 */
	predict(datas) {
		return datas.map(data => {
			const ps = this._near_points(data)
			if (ps.length === 0) {
				return null
			}
			return ps.reduce((acc, v) => acc + v.category, 0) / ps.length
		})
	}
}

/**
 * Semi-supervised radius neighbor
 */
export class SemiSupervisedRadiusNeighbor extends RadiusNeighborBase {
	// https://products.sint.co.jp/aisia/blog/vol1-20
	/**
	 * @param {number} k
	 * @param {'euclid' | 'manhattan' | 'chebyshev' | 'minkowski'} metric
	 */
	constructor(k = 5, metric = 'euclid') {
		super(k, metric)
		this._k = Infinity
		this._orgk = k
	}

	/**
	 * Add a data.
	 * @param {number[]} point
	 * @param {* | null} category
	 */
	add(point, category) {
		super._add(point, category)
	}

	/**
	 * Add datas.
	 * @param {Array<Array<number>>} datas
	 * @param {(* | null)[]} targets
	 */
	fit(datas, targets) {
		for (let i = 0; i < datas.length; i++) {
			this.add(datas[i], targets[i])
		}
	}

	/**
	 * Returns predicted values.
	 * @returns {*[]}
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
