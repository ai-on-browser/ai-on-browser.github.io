/**
 * Fuzzy k-nearest neighbor
 */
export default class FuzzyKNN {
	// http://ijm2c.iauctb.ac.ir/article_521824_ef83674cbaa71084f7990035a8b2f4f0.pdf
	/**
	 * @param {number} [k] Number of neighborhoods
	 * @param {number} [m] Factor of weight for distance
	 */
	constructor(k = 5, m = 2) {
		this._p = []
		this._c = []
		this._classes = []
		this._u = []
		this._k = k
		this._m = m

		this._d = (a, b) => Math.sqrt(a.reduce((s, v, i) => s + (v - b[i]) ** 2, 0))
	}

	/**
	 * Category list
	 *
	 * @type {*[]}
	 */
	get categories() {
		return this._classes
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
	add(point, category) {
		this._p.push(point)
		this._c.push(category)

		if (!this._classes.includes(category)) {
			this._classes.push(category)

			for (let i = 0; i < this._u.length; i++) {
				this._u[i].push(0)
			}
		}
		const u = Array(this._classes.length).fill(0)
		u[this._classes.indexOf(category)] = 1
		this._u.push(u)
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
	 * @returns {Array<Array<number>>} Predicted values
	 */
	predict(datas) {
		return datas.map(data => {
			const ps = this._near_points(data)
			const u = []
			for (let k = 0; k < this._classes.length; k++) {
				let n = 0
				let d = 0
				for (let i = 0; i < ps.length; i++) {
					const w = ps[i].d ** (2 / (this._m - 1))
					n += this._u[ps[i].idx][k] * w
					d += w
				}
				u[k] = d === 0 ? 0 : n / d
			}
			return u
		})
	}
}
