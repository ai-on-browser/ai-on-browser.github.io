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
	f(real.length, real, imag, 1, 0, 0)
	real = real.map(v => v / real.length)
	imag = imag.map(v => -v / real.length)
	return [real, imag]
}

/**
 * Lowpass filter
 */
export class LowpassFilter {
	/**
	 * @param {number} c Cutoff rate
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

	_lowpass(x) {
		const [fr, fi] = fft(x)
		const m = x.length / 2
		const c = Math.floor(m * (1 - this._c))
		for (let i = 1; i <= m; i++) {
			;[fr[i], fi[i]] = this._cutoff(i, c, fr[i], fi[i])
			if (i !== m) {
				;[fr[x.length - i], fi[x.length - i]] = this._cutoff(i, c, fr[x.length - i], fi[x.length - i])
			}
		}
		const [rr, ri] = ifft(fr, fi)
		return rr
	}

	/**
	 * Returns predicted datas.
	 * @param {number[]} x
	 * @returns {number[]}
	 */
	predict(x) {
		const n = x.length
		const k = Math.log2(n)
		if (Number.isInteger(k)) {
			return this._lowpass(x)
		}
		// The end result of trying to solve the edge jumping with LowpassFilter using only FFT.
		// Compute the FFT in three intervals and compute their weighted average.
		const l = 2 ** Math.floor(k)
		const offset = x.length - l
		const offset2 = Math.floor(offset / 2)
		const r0 = this._lowpass(x.slice(0, l))
		const r1 = this._lowpass(x.slice(offset2, offset2 + l))
		const r2 = this._lowpass(x.slice(offset))
		const w = []
		for (let i = 0; i < l / 2; i++) {
			w[i] = w[l - i - 1] = i + 1
		}
		const r = []
		for (let i = 0; i < n; i++) {
			if (i < offset2) {
				r[i] = r0[i]
			} else if (i < offset) {
				r[i] = (r0[i] * w[i] + r1[i - offset2] * w[i - offset2]) / (w[i] + w[i - offset2])
			} else if (i >= offset2 + l) {
				r[i] = r2[i - offset]
			} else if (i >= l) {
				r[i] =
					(r1[i - offset2] * w[i - offset2] + r2[i - offset] * w[i - offset]) /
					(w[i - offset2] + w[i - offset])
			} else {
				r[i] =
					(r0[i] * w[i] + r1[i - offset2] * w[i - offset2] + r2[i - offset] * w[i - offset]) /
					(w[i] + w[i - offset2] + w[i - offset])
			}
		}
		return r
	}
}
