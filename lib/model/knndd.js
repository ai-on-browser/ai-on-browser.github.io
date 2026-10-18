/**
 * k-Nearest Neighbor Data Description
 */
export default class KNNDD {
	// An experimental comparison of one-class classification methods
	// Outlier Detection with One-Class Classifiers from ML and KDD
	// https://ericpostma.nl/publications/JanssensPostmaHerik2009.pdf
	/**
	 * @param {number} k Number of neighborhoods
	 */
	constructor(k) {
		this._k = k
		this._d = (a, b) => Math.sqrt(a.reduce((s, v, i) => s + (v - b[i]) ** 2, 0))
	}

	/**
	 * Returns anomaly degrees.
	 * @param {Array<Array<number>>} data Training data
	 * @returns {boolean[]} Predicted values
	 */
	predict(data) {
		const n = data.length
		const d = []
		for (let i = 0; i < n; i++) {
			d[i] = []
			d[i][i] = 0
			for (let j = 0; j < i; j++) {
				d[i][j] = d[j][i] = this._d(data[i], data[j])
			}
		}
		const ds = []
		for (let i = 0; i < n; i++) {
			ds[i] = d[i].map((v, j) => ({ i: j, v }))
			ds[i].sort((a, b) => a.v - b.v)
		}

		const knndd = []
		for (let i = 0; i < n; i++) {
			const knn = ds[i][this._k].i
			knndd[i] = d[i][knn] / d[knn][ds[knn][this._k].i]
		}
		return knndd
	}
}
