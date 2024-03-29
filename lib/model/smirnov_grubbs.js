import Matrix from '../util/matrix.js'

const logGamma = z => {
	// https://ja.wikipedia.org/wiki/%E3%82%AC%E3%83%B3%E3%83%9E%E9%96%A2%E6%95%B0
	if (Number.isInteger(z) && z > 0) {
		let x = 0
		for (let i = 2; i < z; i++) {
			x += Math.log(i)
		}
		return x
	} else if (Number.isInteger(z - 0.5) && z > 0) {
		const n = z - 0.5
		let x = Math.log(Math.sqrt(Math.PI)) - Math.log(2) * n
		for (let i = 2 * n - 1; i > 0; i -= 2) {
			x += Math.log(i)
		}
		return x
	}
	throw ''
}

const beta = (p, q) => {
	// https://www2.math.kyushu-u.ac.jp/~snii/AdvancedCalculus/7-1.pdf
	// return gamma(p) * gamma(q) / gamma(p + q)
	return Math.exp(logGamma(p) + logGamma(q) - logGamma(p + q))
}

const ibeta = (x, a, b) => {
	// https://www.seijo.ac.jp/pdf/faeco/kenkyu/118/118-sekimoto.pdf
	// https://github.com/LUXOPHIA/t-Distribution
	if (x > (a + 1) / (a + b + 1)) {
		return 1 - ibeta(1 - x, b, a)
	}

	let c0,
		c1 = (-x * (a + b)) / (a + 1)
	let u0,
		u1 = 2,
		u2 = 1 + c1 / u1
	let v0,
		v1 = 1,
		v2 = 1 + c1 / v1
	let g0 = 1,
		g1 = (u1 / v1) * g0,
		g2 = (u2 / v2) * g1
	const e = 1.0e-12
	for (let n = 1; n < 1000; n++) {
		if (Math.abs(g2 - g0) < e) break
		const n2 = n * 2,
			n2a = n * 2 * a
		c0 = (x * n * (b - n)) / (n2a * (n2a - 1))
		c1 = (-x * (a + n) * (a + b + n)) / (n2a * (n2a + 1))

		u0 = u2
		u1 = 1 + c0 / u0
		u2 = 1 + c1 / u1
		v0 = v2
		v1 = 1 + c0 / v0
		v2 = 1 + c1 / v1
		g0 = g2
		g1 = (u1 / v1) * g0
		g2 = (u2 / v2) * g1
	}

	return (x ** a * (1 - x) ** b * (g2 - 1)) / (a * beta(a, b))
}

const ct = (t, n) => {
	// https://ja.wikipedia.org/wiki/T%E5%88%86%E5%B8%83#%E7%B4%AF%E7%A9%8D%E5%88%86%E5%B8%83%E9%96%A2%E6%95%B0
	if (n === 1) {
		return 1 / 2 + Math.atan(t) / Math.PI
	} else if (n === 2) {
		return (1 + t / Math.sqrt(2 + t ** 2)) / 2
	}
	const ttn = Math.sqrt(t ** 2 + n)
	const x = (t + ttn) / (2 * ttn)
	return ibeta(x, n / 2, n / 2)
}

const qt = (n, a) => {
	if (Math.abs(a) > 1) {
		throw "absolute of 'a' need less than or equals to 1."
	}
	if (Math.abs(a) === 1) {
		return Math.sign(a) * Infinity
	}
	if (a > 0.5) {
		return -qt(n, 1 - a)
	}
	a = 1 - a
	let v = 1
	let max = null,
		min = 0
	const e = 1.0e-5
	let maxcount = 1.0e4
	while (maxcount-- > 0) {
		const c = ct(v, n)
		if (isNaN(c)) {
			return c
		} else if (Math.abs(c - a) < e) {
			return v
		}
		if (c < a) {
			min = v
			if (max === null) {
				v *= 2
			} else {
				v = (v + max) / 2
			}
		} else {
			max = v
			v = (v + min) / 2
		}
	}
	throw 'qt not converged.'
}

// https://bellcurve.jp/statistics/course/8970.html
// http://www.geisya.or.jp/~mwm48961/statistics/sample3.htm
// https://ai-trend.jp/basic-study/t-distribution/t-table/
const tTable = [
	[3.078, 6.314, 12.706, 31.821, 63.657],
	[1.886, 2.92, 4.303, 6.965, 9.925],
	[1.638, 2.353, 3.182, 4.541, 5.841],
	[1.533, 2.132, 2.776, 3.747, 4.604],
	[1.476, 2.015, 2.571, 3.365, 4.032],
	[1.44, 1.943, 2.447, 3.143, 3.707],
	[1.415, 1.895, 2.365, 2.998, 3.499],
	[1.397, 1.86, 2.306, 2.896, 3.355],
	[1.383, 1.833, 2.262, 2.821, 3.25],
	[1.372, 1.812, 2.228, 2.764, 3.169],
	[1.363, 1.796, 2.201, 2.718, 3.106],
	[1.356, 1.782, 2.179, 2.681, 3.055],
	[1.35, 1.771, 2.16, 2.65, 3.012],
	[1.345, 1.761, 2.145, 2.624, 2.977],
	[1.341, 1.753, 2.131, 2.602, 2.947],
	[1.337, 1.746, 2.12, 2.583, 2.921],
	[1.333, 1.74, 2.11, 2.567, 2.898],
	[1.33, 1.734, 2.101, 2.552, 2.878],
	[1.328, 1.729, 2.093, 2.539, 2.861],
	[1.325, 1.725, 2.086, 2.528, 2.845],
	[1.323, 1.721, 2.08, 2.518, 2.831],
	[1.321, 1.717, 2.074, 2.508, 2.819],
	[1.319, 1.714, 2.069, 2.5, 2.807],
	[1.318, 1.711, 2.064, 2.492, 2.797],
	[1.316, 1.708, 2.06, 2.485, 2.787],
	[1.315, 1.706, 2.056, 2.479, 2.779],
	[1.314, 1.703, 2.052, 2.473, 2.771],
	[1.313, 1.701, 2.048, 2.467, 2.763],
	[1.311, 1.699, 2.045, 2.462, 2.756],
	[1.31, 1.697, 2.042, 2.457, 2.75],
]
const v40 = [1.303, 1.684, 2.021, 2.423, 2.704]
const v60 = [1.296, 1.671, 2.0, 2.39, 2.66]
const v80 = [1.292, 1.664, 1.99, 2.374, 2.639]
const v120 = [1.289, 1.658, 1.98, 2.358, 2.617]
const v180 = [1.286, 1.653, 1.973, 2.347, 2.603]
const v240 = [1.285, 1.651, 1.97, 2.342, 2.596]
const vinf = [1.258, 1.645, 1.96, 2.326, 2.576]
const p = [0.1, 0.05, 0.025, 0.01, 0.005]

/**
 * SmirnovGrubbs test
 */
export default class SmirnovGrubbs {
	// http://aoki2.si.gunma-u.ac.jp/lecture/Grubbs/Grubbs.html
	// https://en.wikipedia.org/wiki/Grubbs%27s_test_for_outliers
	/**
	 * @param {number} alpha Significance level
	 */
	constructor(alpha) {
		this._alpha = alpha
	}

	/**
	 * Returns a list of the data predicted as outliers or not.
	 *
	 * @param {Array<Array<number>>} data Training data
	 * @returns {boolean[]} Predicted values
	 */
	predict(data) {
		const x = Matrix.fromArray(data)
		const n = x.rows
		const outliers = Array(data.length).fill(false)
		if ((n <= 2) | (this._alpha > n)) return outliers

		const mean = x.mean(0)
		const std = x.std(0)

		x.sub(mean)
		x.abs()
		x.div(std)
		const gs = x.max(1)
		const gidx = gs.argmax(0).toScaler()
		const g = gs.at(gidx, 0)

		const p = this._alpha / n
		const t = qt(n - 2, p)
		const gc = ((n - 1) * t) / Math.sqrt(n * (n - 2 + t ** 2))

		if (g > gc) {
			outliers[gidx] = true
		}

		return outliers
	}
}
