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
 * Chebyshev filter
 */
export default class ChebyshevFilter {
	// https://ja.wikipedia.org/wiki/%E3%83%81%E3%82%A7%E3%83%93%E3%82%B7%E3%82%A7%E3%83%95%E3%83%95%E3%82%A3%E3%83%AB%E3%82%BF
	/**
	 * @param {1 | 2} [type] Type number
	 * @param {number} [ripple] Ripple factor
	 * @param {number} [n] Order
	 * @param {number} [c] Cutoff rate
	 */
	constructor(type = 1, ripple = 1, n = 2, c = 0.5) {
		this._c = c
		this._type = type
		this._n = n
		this._e = ripple
	}

	_chebyshev(n, x) {
		switch (n) {
			case 0:
				return 1
			case 1:
				return x
			case 2:
				return 2 * x ** 2 - 1
			case 3:
				return 4 * x ** 3 - 3 * x
		}
		return 2 * x * this._chebyshev(n - 1, x) - this._chebyshev(n - 2, x)
	}

	_cutoff(i, c, xr, xi) {
		const d =
			this._type === 1
				? Math.sqrt(1 + (this._e * this._chebyshev(this._n, i / c)) ** 2)
				: Math.sqrt(1 + 1 / (this._e * this._chebyshev(this._n, c / i)) ** 2)
		return [xr / d, xi / d]
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
			;[fr[i], fi[i]] = this._cutoff(i, c, fr[i], fi[i])
			if (i !== m) {
				;[fr[x.length - i], fi[x.length - i]] = this._cutoff(i, c, fr[x.length - i], fi[x.length - i])
			}
		}
		const [rr] = ift(fr, fi)
		return rr
	}
}
