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
		const n2a = n * 2 * a
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
