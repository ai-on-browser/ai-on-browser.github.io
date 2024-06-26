const f = (n, xr, xi, s, q, d) => {
	const m = n / 2
	const th0 = (2 * Math.PI) / n

	if (n > 1) {
		for (let p = 0; p < m; p++) {
			const wpr = Math.cos(p * th0)
			const wpi = -Math.sin(p * th0)
			const ar = xr[p + q]
			const ai = xi[p + q]
			const br = xr[p + q + m]
			const bi = xi[p + q + m]

			xr[p + q] = ar + br
			xi[p + q] = ai + bi
			xr[p + q + m] = (ar - br) * wpr - (ai - bi) * wpi
			xi[p + q + m] = (ai - bi) * wpr + (ar - br) * wpi
		}
		f(n / 2, xr, xi, 2 * s, q, d)
		f(n / 2, xr, xi, 2 * s, q + m, d + s)
	} else if (q > d) {
		;[xr[q], xr[d]] = [xr[d], xr[q]]
		;[xi[q], xi[d]] = [xi[d], xi[q]]
	}
}

const fft = (real, imag = null) => {
	// http://wwwa.pikara.ne.jp/okojisan/stockham/cooley-tukey.html
	const n = real.length
	if (!Number.isInteger(Math.log2(n))) {
		throw 'Invalid value length.'
	}
	if (!imag) {
		imag = Array(n).fill(0)
	}
	f(n, real, imag, 1, 0, 0)
	return [real, imag]
}

const ifft = (real, imag) => {
	imag = imag.map(v => -v)
	fft(real, imag)
	real = real.map(v => v / real.length)
	imag = imag.map(v => -v / real.length)
	return [real, imag]
}

const dft = (real, imag = null) => {
	// https://www.kazetest.com/vcmemo/dft/dft.htm
	const n = real.length
	if (!imag) {
		imag = Array(n).fill(0)
	}
	const ar = Array(n).fill(0)
	const ai = Array(n).fill(0)
	const t = (-2 * Math.PI) / n
	for (let i = 0; i < n; i++) {
		for (let j = 0; j < n; j++) {
			ar[i] += real[j] * Math.cos(j * i * t) - imag[j] * Math.sin(j * i * t)
			ai[i] += real[j] * Math.sin(j * i * t) + imag[j] * Math.cos(j * i * t)
		}
	}
	return [ar, ai]
}

const idft = (real, imag) => {
	imag = imag.map(v => -v)
	let [ar, ai] = dft(real, imag)
	ar = ar.map(v => v / real.length)
	ai = ai.map(v => -v / real.length)
	return [ar, ai]
}

const ft = (real, imag = null) => {
	const n = real.length
	return Number.isInteger(Math.log2(n)) ? fft(real, imag) : dft(real, imag)
}

const ift = (real, imag) => {
	const n = real.length
	return Number.isInteger(Math.log2(n)) ? ifft(real, imag) : idft(real, imag)
}

const t2 = (z, q) => {
	let v = 0
	for (let i = 0; i < 1000; i++) {
		const vi = q ** (i * (i + 1)) * Math.cos(z * (2 * i + 1))
		v += vi
		if (Math.abs(vi / v) < 1.0e-15) {
			break
		}
	}
	return v * 2 * q ** (1 / 4)
}

const t3 = (z, q) => {
	let v = 0
	for (let i = 1; i < 1000; i++) {
		const vi = q ** (i ** 2) * Math.cos(2 * i * z)
		v += vi
		if (Math.abs(vi / v) < 1.0e-15) {
			break
		}
	}
	return 1 + v * 2
}

/**
 * Elliptic filter
 */
export default class EllipticFilter {
	// https://ja.wikipedia.org/wiki/%E6%A5%95%E5%86%86%E6%9C%89%E7%90%86%E9%96%A2%E6%95%B0
	/**
	 * @param {number} [ripple] Ripple factor
	 * @param {number} [n] Order
	 * @param {number} [xi] Selectivity factor
	 * @param {number} [c] Cutoff rate
	 */
	constructor(ripple = 1, n = 2, xi = 1, c = 0.5) {
		this._c = c
		this._n = n
		this._xi = xi
		this._e = ripple
	}

	_K(k) {
		// Complete elliptic integral of the first kind
		// http://www.oishi.info.waseda.ac.jp/~samukawa/GaussLeg2.pdf
		if (k === 1) {
			return Infinity
		}
		let v = Math.PI / 2
		let k0 = k
		while (k0 > 1.0e-15) {
			k0 = (1 - Math.sqrt(1 - k0 ** 2)) / (1 + Math.sqrt(1 - k0 ** 2))
			v *= 1 + k0
		}
		return v
	}

	_nome(k) {
		return Math.exp((-Math.PI * this._K(Math.sqrt(1 - k ** 2))) / this._K(k))
	}

	_Ln(n, xi) {
		if (n === 1) {
			return xi
		} else if (n === 2) {
			return (xi + Math.sqrt(xi ** 2 - 1)) ** 2
		} else if (n === 3) {
			const xi2 = xi ** 2
			const g = Math.sqrt(4 * xi2 + (4 * xi2 * (xi2 - 1)) ** (2 / 3))
			const xp2 =
				(2 * xi2 * Math.sqrt(g)) / (Math.sqrt(8 * xi2 * (xi2 + 1) + 12 * g * xi2 - g ** 3) - g ** (3 / 2))
			return xi ** 3 * ((1 - xp2) / (xi ** 2 - xp2)) ** 2
		}
		if (Number.isInteger(n / 2)) {
			return this._Ln(2, this._Ln(n / 2, xi))
		} else if (Number.isInteger(n / 3)) {
			return this._Ln(3, this._Ln(n / 3, xi))
		}

		const q1_l = this._nome(1 / xi) ** n
		let h = 1
		let l = 0
		while (h - l > 1.0e-14) {
			const m = (h + l) / 2
			const qm = this._nome(m)
			if (q1_l === qm) {
				return 1 / m
			} else if (q1_l < qm) {
				h = m
			} else {
				l = m
			}
		}
		return 1 / h
	}

	_cd(z, k) {
		// http://math-functions-1.watson.jp/sub1_spec_100.html
		const q = this._nome(k)
		const zeta = (Math.PI * z) / (2 * this._K(k))
		return ((t3(0, q) / t2(0, q)) * t2(zeta, q)) / t3(zeta, q)
	}

	_elliptic(n, xi, x) {
		if (n === 1) {
			return x
		}
		if (x === 1) {
			return 1
		}
		const xi2 = xi ** 2
		if (n === 2) {
			const t = Math.sqrt(1 - 1 / xi2)
			return ((t + 1) * x ** 2 - 1) / ((t - 1) * x ** 2 + 1)
		} else if (n === 3) {
			const g = Math.sqrt(4 * xi2 + (4 * xi2 * (xi2 - 1)) ** (2 / 3))
			const xp2 =
				(2 * xi2 * Math.sqrt(g)) / (Math.sqrt(8 * xi2 * (xi2 + 1) + 12 * g * xi2 - g ** 3) - g ** (3 / 2))
			const xz2 = xi2 / xp2
			return (x * (1 - xp2) * (x ** 2 - xz2)) / (1 - xz2) / (x ** 2 - xp2)
		}
		if (Number.isInteger(n / 2)) {
			return this._elliptic(2, this._elliptic(n / 2, xi, xi), this._elliptic(n / 2, xi, x))
		} else if (Number.isInteger(n / 3)) {
			return this._elliptic(3, this._elliptic(n / 3, xi, xi), this._elliptic(n / 3, xi, x))
		}
		const k1zi = this._K(1 / xi)
		const xn = []
		for (let i = 1; i <= n; i++) {
			xn.push(this._cd((k1zi * (2 * i - 1)) / n, 1 / xi))
		}
		const lim = n % 2 === 0 ? n : n - 1
		let r0 = 1
		for (let i = 0; i < lim; i++) {
			r0 *= (1 - xn[i]) / (1 - xi / xn[i])
		}
		let v = (n % 2 === 0 ? 1 : x) / r0
		for (let i = 0; i < lim; i++) {
			v *= (x - xn[i]) / (x - xi / xn[i])
		}
		return v
	}

	_cutoff(i, c, xr, xi) {
		const d = Math.sqrt(1 + (this._e * this._elliptic(this._n, this._xi, i / c)) ** 2)
		return [xr / d, xi / d]
	}

	/**
	 * Returns predicted datas.
	 * @param {number[]} x Training data
	 * @returns {number[]} Predicted values
	 */
	predict(x) {
		const [fr, fi] = ft(x)
		const m = x.length / 2
		const c = Math.floor(m * (1 - this._c))
		for (let i = 1; i <= m; i++) {
			;[fr[i], fi[i]] = this._cutoff(i, c, fr[i], fi[i])
			if (i !== m) {
				;[fr[x.length - i], fi[x.length - i]] = this._cutoff(i, c, fr[x.length - i], fi[x.length - i])
			}
		}
		const [rr] = ift(fr, fi)
		return rr
	}
}
