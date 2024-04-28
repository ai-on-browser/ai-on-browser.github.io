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

/**
 * Bessel filter
 */
export default class BesselFilter {
	// https://ja.wikipedia.org/wiki/%E3%83%99%E3%83%83%E3%82%BB%E3%83%AB%E3%83%95%E3%82%A3%E3%83%AB%E3%82%BF
	// http://okawa-denshi.jp/blog/?th=2009012600
	/**
	 * @param {number} [n] Order
	 * @param {number} [c] Cutoff rate
	 */
	constructor(n = 2, c = 0.5) {
		this._c = c
		this._n = n

		this._coef = []
		for (let k = 0; k <= this._n; k++) {
			let c = 1
			for (let i = 0; i < this._n; i++) {
				c *= 2 * this._n - k - i
				if (i < k) {
					c /= i + 1
				} else {
					c /= 2
				}
			}
			this._coef[k] = c
		}
	}

	_reverse_bessel_polynomial(x) {
		let v = 0
		for (let k = 0; k <= this._n; k++) {
			v += this._coef[k] * x ** k
		}
		return v
	}

	_cutoff(i, c, xr, xi) {
		const d = this._reverse_bessel_polynomial(0) / this._reverse_bessel_polynomial(i / c)
		return [xr * d, xi * d]
	}

	/**
	 * Returns predicted datas.
	 *
	 * @param {number[]} x Training data
	 * @returns {number[]} Predicted values
	 */
	predict(x) {
		const [fr, fi] = ft(x)
		const m = x.length / 2
		const c = Math.floor(m * (1 - this._c))
		for (let i = 1; i <= m; i++) {
			if (i >= c) {
				fr[i] = fi[i] = 0
			}
			if (i !== m) {
				;[fr[x.length - i], fi[x.length - i]] = this._cutoff(i, c, fr[x.length - i], fi[x.length - i])
			}
		}
		const [rr] = ift(fr, fi)
		return rr
	}
}
