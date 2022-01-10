/**
 * Co-training
 */
export default class CoTraining {
	// https://products.sint.co.jp/aisia/blog/vol1-20
	/**
	 * @param {object} view1
	 * @param {function (Array<Array<number>>, *[]): void} view1.fit
	 * @param {function (Array<Array<number>>): Array<{category: *, score: number}>} view1.predict
	 * @param {number} view1.threshold
	 * @param {object} view2
	 * @param {function (Array<Array<number>>, *[]): void} view2.fit
	 * @param {function (Array<Array<number>>): Array<{category: *, score: number}>} view2.predict
	 * @param {number} view2.threshold
	 */
	constructor(view1, view2) {
		this._view1 = view1
		this._view2 = view2
	}

	/**
	 * Initialize model.
	 * @param {Array<Array<number>>} x
	 * @param {(* | null)[]} y
	 */
	init(x, y) {
		this._x = x
		this._y = y
	}

	/**
	 * Fit model.
	 */
	fit() {
		const x = this._x.filter((v, i) => this._y[i] != null)
		const y = this._y.filter(v => v != null)

		this._view1.fit(x, y)
		this._view2.fit(x, y)

		const nx = this._x.filter((v, i) => this._y[i] == null)
		const p1 = this._view1.predict(nx)
		const p2 = this._view2.predict(nx)
		for (let i = 0, k = 0; i < this._y.length; i++) {
			if (this._y[i] != null) {
				continue
			}
			if (p1[k].score > this._view1.threshold) {
				this._y[i] = p1[k].category
			} else if (p2[k].score > this._view2.threshold) {
				this._y[i] = p2[k].category
			}
			k++
		}
	}

	/**
	 * Returns predicted categories.
	 * @returns {(* | null)[]}
	 */
	predict() {
		return this._y
	}
}
