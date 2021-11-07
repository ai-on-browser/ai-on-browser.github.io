import { Matrix } from '../util/math.js'

const shuffle = function (arr) {
	for (let i = arr.length - 1; i > 0; i--) {
		let r = Math.floor(Math.random() * (i + 1))
		;[arr[i], arr[r]] = [arr[r], arr[i]]
	}
	return arr
}

/**
 * Minimum Covariance Determinant
 */
export default class MCD {
	// https://blog.brainpad.co.jp/entry/2018/02/19/150000
	/**
	 * @param {Array<Array<number>>} datas
	 * @param {number} sampling_rate
	 */
	constructor(datas, sampling_rate) {
		this._datas = datas
		this._h = this._datas.length * sampling_rate
		this._ext_idx = []
		for (let i = 0; i < this._datas.length; this._ext_idx.push(i++));
		shuffle(this._ext_idx)
		this._ext_idx = this._ext_idx.slice(0, this._h)
		this._Ri = null
		this._mean = null
		this._std = null
	}

	/**
	 * Fit model.
	 */
	fit() {
		const n = this._datas.length
		const dim = this._datas[0].length
		let x = new Matrix(n, dim, this._datas)
		x = x.row(this._ext_idx)
		this._mean = x.mean(0)
		x.sub(this._mean)
		this._std = x.std(0)
		x.div(this._std)

		const R = x.cov()
		this._Ri = R.inv()

		const d = this.predict(this._datas).map((v, i) => [i, v])
		d.sort((a, b) => a[1] - b[1])
		this._ext_idx = d.map(v => v[0]).slice(0, this._h)
	}

	/**
	 * Returns anomaly degrees.
	 * @param {Array<Array<number>>} data
	 * @returns {number[]}
	 */
	predict(data) {
		const outliers = []
		for (let i = 0; i < data.length; i++) {
			let d = 0
			const x = []
			for (let j = 0; j < data[i].length; j++) {
				x[j] = (data[i][j] - this._mean.value[j]) / this._std.value[j]
			}
			for (let j = 0; j < x.length; j++) {
				for (let k = 0; k < x.length; k++) {
					d += x[k] * this._Ri.at(k, j) * x[j]
				}
			}
			outliers.push(d / 2)
		}
		return outliers
	}
}
