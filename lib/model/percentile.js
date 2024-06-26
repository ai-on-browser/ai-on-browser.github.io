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
			// https://www.geisya.or.jp/~mwm48961/statistics/stddev11.htm
			// u from 0.00 to 3.09 step 0.01
			const ifnorm = [
				0.0, 0.004, 0.008, 0.012, 0.016, 0.0199, 0.0239, 0.0279, 0.0319, 0.0359, 0.0398, 0.0438, 0.0478, 0.0517,
				0.0557, 0.0596, 0.0636, 0.0675, 0.0714, 0.0753, 0.0793, 0.0832, 0.0871, 0.091, 0.0948, 0.0987, 0.1026,
				0.1064, 0.1103, 0.1141, 0.1179, 0.1217, 0.1255, 0.1293, 0.1331, 0.1368, 0.1406, 0.1443, 0.148, 0.1517,
				0.1554, 0.1591, 0.1628, 0.1664, 0.17, 0.1736, 0.1772, 0.1808, 0.1844, 0.1879, 0.1915, 0.195, 0.1985,
				0.2019, 0.2054, 0.2088, 0.2123, 0.2157, 0.219, 0.2224, 0.2257, 0.2291, 0.2324, 0.2357, 0.2389, 0.2422,
				0.2454, 0.2486, 0.2517, 0.2549, 0.258, 0.2611, 0.2642, 0.2673, 0.2704, 0.2734, 0.2764, 0.2794, 0.2823,
				0.2852, 0.2881, 0.291, 0.2939, 0.2967, 0.2995, 0.3023, 0.3051, 0.3078, 0.3106, 0.3133, 0.3159, 0.3186,
				0.3212, 0.3238, 0.3264, 0.3289, 0.3315, 0.334, 0.3365, 0.3389, 0.3413, 0.3438, 0.3461, 0.3485, 0.3508,
				0.3531, 0.3554, 0.3577, 0.3599, 0.3621, 0.3643, 0.3665, 0.3686, 0.3708, 0.3729, 0.3749, 0.377, 0.379,
				0.381, 0.383, 0.3849, 0.3869, 0.3888, 0.3907, 0.3925, 0.3944, 0.3962, 0.398, 0.3997, 0.4015, 0.4032,
				0.4049, 0.4066, 0.4082, 0.4099, 0.4115, 0.4131, 0.4147, 0.4162, 0.4177, 0.4192, 0.4207, 0.4222, 0.4236,
				0.4251, 0.4265, 0.4279, 0.4292, 0.4306, 0.4319, 0.4332, 0.4345, 0.4357, 0.437, 0.4382, 0.4394, 0.4406,
				0.4418, 0.4429, 0.4441, 0.4452, 0.4463, 0.4474, 0.4484, 0.4495, 0.4505, 0.4515, 0.4525, 0.4535, 0.4545,
				0.4554, 0.4564, 0.4573, 0.4582, 0.4591, 0.4599, 0.4608, 0.4616, 0.4625, 0.4633, 0.4641, 0.4649, 0.4656,
				0.4664, 0.4671, 0.4678, 0.4686, 0.4693, 0.4699, 0.4706, 0.4713, 0.4719, 0.4726, 0.4732, 0.4738, 0.4744,
				0.475, 0.4756, 0.4761, 0.4767, 0.4772, 0.4778, 0.4783, 0.4788, 0.4793, 0.4798, 0.4803, 0.4808, 0.4812,
				0.4817, 0.4821, 0.4826, 0.483, 0.4834, 0.4838, 0.4842, 0.4846, 0.485, 0.4854, 0.4857, 0.4861, 0.4864,
				0.4868, 0.4871, 0.4875, 0.4878, 0.4881, 0.4884, 0.4887, 0.489, 0.4893, 0.4896, 0.4898, 0.4901, 0.4904,
				0.4906, 0.4909, 0.4911, 0.4913, 0.4916, 0.4918, 0.492, 0.4922, 0.4925, 0.4927, 0.4929, 0.4931, 0.4932,
				0.4934, 0.4936, 0.4938, 0.494, 0.4941, 0.4943, 0.4945, 0.4946, 0.4948, 0.4949, 0.4951, 0.4952, 0.4953,
				0.4955, 0.4956, 0.4957, 0.4959, 0.496, 0.4961, 0.4962, 0.4963, 0.4964, 0.4965, 0.4966, 0.4967, 0.4968,
				0.4969, 0.497, 0.4971, 0.4972, 0.4973, 0.4974, 0.4974, 0.4975, 0.4976, 0.4977, 0.4977, 0.4978, 0.4979,
				0.4979, 0.498, 0.4981, 0.4981, 0.4982, 0.4982, 0.4983, 0.4984, 0.4984, 0.4985, 0.4985, 0.4986, 0.4986,
				0.4987, 0.4987, 0.4987, 0.4988, 0.4988, 0.4989, 0.4989, 0.4989, 0.499, 0.499,
			]
			let u = 0.5
			const p = 0.5 - this._percentile
			for (let i = 0; i < ifnorm.length - 1; i++) {
				if (ifnorm[i] <= p && p < ifnorm[i + 1]) {
					u = i * 0.01
					break
				}
			}
			for (let d = 0; d < dim; d++) {
				const mean = x.reduce((m, v) => m + v[d], 0) / n
				const variance = x.reduce((s, v) => s + (v[d] - mean) ** 2, 0) / n
				const std = Math.sqrt(variance)
				this._thresholds[d] = [mean - std * u, mean + std * u]
			}
		}
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
