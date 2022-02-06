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

/**
 * Lowpass filter
 */
export class LowpassFilter {
	/**
	 * @param {number} [c=0.5] Cutoff rate
	 */
	constructor(c = 0.5) {
		this._c = c
	}

	_cutoff(i, c, xr, xi) {
		if (i >= c) {
			return [0, 0]
		}
		return [xr, xi]
	}

	/**
	 * Returns predicted datas.
	 *
	 * @param {number[]} x
	 * @returns {number[]}
	 */
	predict(x) {
		const n = x.length
		let ft = dft
		let ift = idft
		if (Number.isInteger(Math.log2(n))) {
			ft = fft
			ift = ifft
		}
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
