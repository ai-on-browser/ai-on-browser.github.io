/**
 * Mean shift
 */
export default class MeanShift {
	// see http://seiya-kumada.blogspot.com/2013/05/mean-shift.html
	// see http://takashiijiri.com/study/ImgProc/MeanShift.htm
	/**
	 * @param {number} h Smoothing parameter for the kernel
	 * @param {number} threshold Threshold
	 */
	constructor(h, threshold) {
		this._x = null
		this._centroids = null
		this._h = h
		this._threshold = threshold
		this._categories = 0
	}

	/**
	 * Number of categories that last predicted
	 *
	 * @type {number}
	 */
	get categories() {
		return this._categories
	}

	/**
	 * h
	 *
	 * @type {number}
	 */
	get h() {
		return this._h
	}

	_distance(a, b) {
		return Math.sqrt(a.reduce((s, v, i) => s + (v - b[i]) ** 2, 0))
	}

	/**
	 * Initialize model.
	 *
	 * @param {Array<Array<number>>} data Training data
	 */
	init(data) {
		this._x = data
		this._centroids = this._x.map(v => [].concat(v))
	}

	/**
	 * Returns predicted categories.
	 *
	 * @returns {number[]} Predicted values
	 */
	predict() {
		this._categories = 0
		const p = []
		for (let i = 0; i < this._centroids.length; i++) {
			let category = i
			for (let k = 0; k < i; k++) {
				if (this._distance(this._centroids[i], this._centroids[k]) < this._threshold) {
					category = p[k]
					break
				}
			}
			if (category === i) this._categories++
			p[i] = category
		}
		return p
	}

	/**
	 * Fit model.
	 *
	 * @returns {boolean} `true` if any centroids has moved
	 */
	fit() {
		if (this._centroids.length === 0 || this._x.length === 0) {
			return false
		}
		let isChanged = false
		this._centroids = this._centroids.map(c => {
			const oldPoint = c

			const gvalues = this._x.map(p =>
				c.reduce((acc, v, i) => acc + ((v - p[i]) / this._h) ** 2, 0) <= 1 ? 1 : 0
			)
			let s = 0
			const v = Array(this._x[0].length).fill(0)
			for (let i = 0; i < this._x.length; i++) {
				if (gvalues[i]) {
					s += gvalues[i]
					for (let k = 0; k < v.length; k++) {
						v[k] += this._x[i][k] * gvalues[i]
					}
				}
			}

			const newPoint = v.map(a => a / s)
			isChanged ||= oldPoint.some((v, i) => v !== newPoint[i])
			return newPoint
		})

		return isChanged
	}
}
