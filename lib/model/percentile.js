/**
 * Percentile anomaly detection
 */
export default class PercentileAnormaly {
	/**
	 * @param {number} percentile Percentile value
	 * @param {'data' | 'normal'} [distribution] Distribution name
	 */
	constructor(percentile, distribution = 'data') {
		this._percentile = percentile
		this._distribution = distribution
		this._thresholds = []
	}

	/**
	 * Fit model.
	 * @param {Array<Array<number>>} data Training data
	 */
	fit(data) {
		this._thresholds = []
		const x = data
		const n = x.length
		if (n <= 0) {
			return
		}
		const dim = x[0].length
		if (n === 1) {
			for (let d = 0; d < dim; d++) {
				this._thresholds[d] = [x[0][d], x[0][d]]
			}
			return
		}
		if (this._percentile === 0) {
			for (let d = 0; d < dim; d++) {
				this._thresholds[d] = [-Infinity, Infinity]
			}
			return
		} else if (this._percentile === 0.5) {
			for (let d = 0; d < dim; d++) {
				this._thresholds[d] = [0, 0]
			}
			return
		}
		const sortDatas = []

		if (this._distribution === 'data') {
			const lidx = (n - 1) * this._percentile
			const li = [Math.floor(lidx), lidx - Math.floor(lidx), Math.ceil(lidx)]
			const uidx = n - 1 - lidx
			const ui = [Math.floor(uidx), uidx - Math.floor(uidx), Math.ceil(uidx)]
			for (let d = 0; d < dim; d++) {
				const sd = x.map(v => v[d])
				sd.sort((a, b) => a - b)
				sortDatas.push(sd)

				this._thresholds[d] = [
					sd[li[0]] + (sd[li[2]] - sd[li[0]]) * li[1],
					sd[ui[0]] + (sd[ui[2]] - sd[ui[0]]) * ui[1],
				]
			}
		} else if (this._distribution === 'normal') {
			const u = Math.abs(this._ppf_wichura(this._percentile))
			for (let d = 0; d < dim; d++) {
				const mean = x.reduce((m, v) => m + v[d], 0) / n
				const variance = x.reduce((s, v) => s + (v[d] - mean) ** 2, 0) / n
				const std = Math.sqrt(variance)
				this._thresholds[d] = [mean - std * u, mean + std * u]
			}
		}
	}

	_ppf_wichura(p) {
		// Algorithm AS 241: The Percentage Points of the Normal Distribution
		const q = p - 0.5
		if (Math.abs(q) <= 0.425) {
			const a0 = 3.3871327179
			const a1 = 5.0434271938e1
			const a2 = 1.5929113202e2
			const a3 = 5.910937472e1
			const b1 = 1.7895169469e1
			const b2 = 7.8757757664e1
			const b3 = 6.71875636e1
			const r = 0.180625 - q ** 2
			return (q * (((a3 * r + a2) * r + a1) * r + a0)) / (((b3 * r + b2) * r + b1) * r + 1)
		}

		let r = q < 0 ? p : 1 - p
		if (r <= 0) {
			return Infinity * Math.sign(p)
		}
		r = Math.sqrt(-Math.log(r))
		if (r <= 5) {
			const c0 = 1.4234372777
			const c1 = 2.75681539
			const c2 = 1.3067284816
			const c3 = 1.7023821103e-1
			const d1 = 7.370016425e-1
			const d2 = 1.2021132975e-1
			r -= 1.6
			r = (((c3 * r + c2) * r + c1) * r + c0) / ((d2 * r + d1) * r + 1)
		} else {
			const e0 = 6.657905115
			const e1 = 3.081226386
			const e2 = 4.2868294337e-1
			const e3 = 1.7337203997e-2
			const f1 = 2.4197894225e-1
			const f2 = 1.2258202635e-2
			r -= 5
			r = (((e3 * r + e2) * r + e1) * r + e0) / ((f2 * r + f1) * r + 1)
		}
		return q < 0 ? -r : r
	}

	/**
	 * Returns predicted anomaly flags.
	 * @param {Array<Array<number>>} x Sample data
	 * @returns {Array<boolean>} true if a data is anomaly.
	 */
	predict(x) {
		if (this._percentile === 0) {
			return Array(x.length).fill(false)
		} else if (this._percentile === 0.5) {
			return Array(x.length).fill(true)
		}
		const outliers = []
		for (let i = 0; i < x.length; i++) {
			let f = false
			for (let d = 0; d < this._thresholds.length; d++) {
				f ||= x[i][d] < this._thresholds[d][0] || this._thresholds[d][1] < x[i][d]
			}
			outliers.push(f)
		}
		return outliers
	}
}
