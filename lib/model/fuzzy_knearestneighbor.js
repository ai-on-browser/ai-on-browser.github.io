/**
 * Fuzzy k-nearest neighbor
 */
export default class FuzzyKNN {
	/**
	 * @param {number} [k=5]
	 * @param {number} [m=2]
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
	 * @param {number[]} point
	 * @param {*} [category]
	 */
	add(point, category) {
		this._p.push(point)
		this._c.push(category)

		if (this._classes.indexOf(category) < 0) {
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
	 *
	 * @param {Array<Array<number>>} datas
	 * @returns {Array<Array<{label: *, value: number}>>}
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
				u.push({
					label: this._classes[k],
					value: d === 0 ? 0 : n / d,
				})
			}
			return u
		})
	}
}
