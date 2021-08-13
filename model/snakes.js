export default class Snakes {
	// http://www.sanko-shoko.net/note.php?id=wc1z
	// https://www.slideshare.net/Arumaziro/ss-37035661
	// https://en.wikipedia.org/wiki/Active_contour_model
	constructor(alpha, beta, gamma, k = 100) {
		this._alpha = alpha
		this._beta = beta
		this._gamma = gamma
		this._k = k
		this._v = []
	}

	_convolute(x, kernel) {
		const a = []
		for (let i = 0; i < x.length; i++) {
			a[i] = []
			for (let j = 0; j < x[i].length; j++) {
				const v = Array(x[i][j].length).fill(0)
				for (let s = 0; s < kernel.length; s++) {
					let n = i + s - Math.floor(kernel.length / 2)
					n = Math.max(0, Math.min(x.length - 1, n))
					for (let t = 0; t < kernel[s].length; t++) {
						let m = j + t - Math.floor(kernel[s].length / 2)
						m = Math.max(0, Math.min(x[n].length - 1, m))
						for (let u = 0; u < x[n][m].length; u++) {
							v[u] += x[n][m][u] * kernel[s][t]
						}
					}
				}
				a[i][j] = v
			}
		}
		return a
	}

	init(x) {
		const gx = this._convolute(x, [
			[1, 0, -1],
			[2, 0, -2],
			[1, 0, -1],
		])
		const gy = this._convolute(x, [
			[1, 2, 1],
			[0, 0, 0],
			[-1, -2, -1],
		])

		this._g = []
		for (let i = 0; i < gx.length; i++) {
			this._g[i] = []
			for (let j = 0; j < gx[i].length; j++) {
				this._g[i][j] = 0
				for (let u = 0; u < gx[i][j].length; u++) {
					this._g[i][j] += Math.sqrt(gx[i][j][u] ** 2 + gy[i][j][u] ** 2)
				}
				this._g[i][j] /= gx[i][j].length
			}
		}

		this._v = []
		const r = []
		for (let k = 0; k < 4; k++) {
			r.push(Math.round((k * this._k) / 4))
		}
		r.push(this._k)
		for (let i = 0; i < r[1] - r[0]; i++) {
			this._v.push([0, Math.round((i * (this._g[0].length - 1)) / (r[1] - r[0]))])
		}
		for (let i = 0; i < r[2] - r[1]; i++) {
			this._v.push([Math.round((i * (this._g.length - 1)) / (r[2] - r[1])), this._g[0].length - 1])
		}
		for (let i = 0; i < r[3] - r[2]; i++) {
			this._v.push([
				this._g.length - 1,
				this._g[0].length - 1 - Math.round((i * (this._g[0].length - 1)) / (r[3] - r[2])),
			])
		}
		for (let i = 0; i < r[4] - r[3]; i++) {
			this._v.push([this._g.length - 1 - Math.round((i * (this._g.length - 1)) / (r[2] - r[1])), 0])
		}
	}

	_energy(v) {
		let elen = 0
		let ecurv = 0
		let eimg = 0
		for (let i = 0; i < v.length; i++) {
			const jb = i === 0 ? v.length - 1 : i - 1
			const ja = i === v.length - 1 ? 0 : i + 1
			elen += v[i].reduce((s, a, d) => s + (a - v[jb][d]) ** 2, 0)
			ecurv += v[i].reduce((s, a, d) => s + (v[ja][d] + v[jb][d] - 2 * a) ** 2, 0)
			eimg -= this._g[v[i][0]][v[i][1]]
		}
		return this._alpha * elen + this._beta * ecurv + this._gamma * eimg
	}

	fit() {
		const d = [
			[0, 1],
			[1, 1],
			[1, 0],
			[1, -1],
			[0, -1],
			[-1, -1],
			[-1, 0],
			[-1, 1],
		]
		for (let i = 0; i < this._v.length; i++) {
			let min_e = this._energy(this._v)
			let min_v = null
			for (let k = 0; k < d.length; k++) {
				const nv = this._v[i].map((a, t) => a + d[k][t])
				if (nv[0] < 0 || nv[1] < 0 || nv[0] >= this._g.length || nv[1] >= this._g[0].length) {
					continue
				}
				const v = this._v.concat()
				v[i] = nv
				const e = this._energy(v)
				if (e < min_e) {
					min_e = e
					min_v = nv
				}
			}
			if (min_v) {
				this._v[i] = min_v
			}
		}
	}

	predict() {
		const p = []
		for (let i = 0; i < this._g.length; i++) {
			p[i] = Array(this._g[i].length).fill(false)
		}
		for (let i = 0; i < this._v.length; i++) {
			const x0 = this._v[i][0]
			const y0 = this._v[i][1]
			const x1 = this._v[i === this._v.length - 1 ? 0 : i + 1][0]
			const y1 = this._v[i === this._v.length - 1 ? 0 : i + 1][1]
			const dx = Math.abs(x1 - x0)
			const dy = Math.abs(y1 - y0)
			p[x0][y0] = true
			if (dx > dy) {
				let d = 2 * dy - dx
				let y = y0
				const xs = x1 > x0 ? 1 : -1
				for (let x = x0 + xs; xs > 0 ? x < x1 : x > x1; x += xs) {
					if (d > 0) {
						y += y1 > y0 ? 1 : -1
						p[x][y] = true
						d += 2 * dy - 2 * dx
					} else {
						p[x][y] = true
						d += 2 * dy
					}
				}
			} else {
				let d = 2 * dx - dy
				let x = x0
				const ys = y1 > y0 ? 1 : -1
				for (let y = y0 + ys; ys > 0 ? y < y1 : y > y1; y += ys) {
					if (d > 0) {
						x += x1 > x0 ? 1 : -1
						p[x][y] = true
						d += 2 * dx - 2 * dy
					} else {
						p[x][y] = true
						d += 2 * dx
					}
				}
			}
		}
		return p
	}
}
