class Point {
	constructor(p, value = null) {
		this._p = p
		this.value = value
	}

	get x() {
		return this._p[0]
	}

	get y() {
		return this._p[1]
	}
}

class Circle {
	constructor(c, r) {
		this._c = c
		this._r = r
	}

	get center() {
		return this._c
	}

	contains(p) {
		return (p.x - this._c.x) ** 2 + (p.y - this._c.y) ** 2 < this._r ** 2
	}
}

class Triangle {
	constructor(p1, p2, p3) {
		this.p = [p1, p2, p3]
		this.adjoin = [null, null, null]

		this._circumcircle = null
	}

	get p() {
		return this._p
	}

	set p(points) {
		this._p = points
		this._circumcircle = null
	}

	get circumcircle() {
		if (this._circumcircle) {
			return this._circumcircle
		}
		const [p1, p2, p3] = this._p

		const c = 2 * ((p2.x - p1.x) * (p3.y - p1.y) - (p2.y - p1.y) * (p3.x - p1.x)) + 1.0e-12
		const c21 = p2.x ** 2 - p1.x ** 2 + p2.y ** 2 - p1.y ** 2
		const c31 = p3.x ** 2 - p1.x ** 2 + p3.y ** 2 - p1.y ** 2
		const cx = ((p3.y - p1.y) * c21 + (p1.y - p2.y) * c31) / c
		const cy = ((p1.x - p3.x) * c21 + (p2.x - p1.x) * c31) / c

		this._circumcircle = new Circle(new Point([cx, cy]), Math.sqrt((cx - p1.x) ** 2 + (cy - p1.y) ** 2))
		return this._circumcircle
	}

	contains(p) {
		const outer = (p1, p2, p3) => {
			return (p1.x - p3.x) * (p2.y - p3.y) - (p2.x - p3.x) * (p1.y - p3.y)
		}

		const o = []
		for (let i = 0; i < 3; i++) {
			const oi = outer(p, this.p[i], this.p[(i + 1) % 3])
			if (oi === 0) {
				continue
			}
			if (o.length > 0 && o[o.length - 1] !== oi < 0) {
				return false
			}
			o.push(oi < 0)
		}

		return true
	}

	contains_circle(p) {
		return this.circumcircle.contains(p)
	}
}

class Delaunay2D {
	constructor(points) {
		this._points = points
		const n = this._points.length
		const min = [Infinity, Infinity]
		const max = [-Infinity, -Infinity]
		for (let i = 0; i < n; i++) {
			for (let d = 0; d < 2; d++) {
				min[d] = Math.min(min[d], this._points[i]._p[d])
				max[d] = Math.max(max[d], this._points[i]._p[d])
			}
		}
		for (let d = 0; d < 2; d++) {
			min[d] -= 1
			max[d] += 1
		}
		const rootPoints = [
			new Point([min[0] - (max[1] - min[1]), min[1]]),
			new Point([max[0] + (max[1] - min[1]), min[1]]),
			new Point([(min[0] + max[0]) / 2, max[1] + (max[0] - min[0]) / 2]),
		]

		const triangles = [new Triangle(...rootPoints)]

		for (let i = 0; i < n; i++) {
			const xi = this._points[i]
			let k = 0
			for (; k < triangles.length; k++) {
				if (triangles[k].contains(xi)) {
					break
				}
			}
			const t = triangles.splice(k, 1)[0]

			const nt1 = new Triangle(xi, t.p[1], t.p[2])
			const nt2 = new Triangle(xi, t.p[2], t.p[0])
			const nt3 = new Triangle(xi, t.p[0], t.p[1])

			nt1.adjoin = [t.adjoin[0], nt2, nt3]
			nt2.adjoin = [t.adjoin[1], nt3, nt1]
			nt3.adjoin = [t.adjoin[2], nt1, nt2]

			const nt = [nt1, nt2, nt3]
			for (let j = 0; j < t.adjoin.length; j++) {
				if (!t.adjoin[j]) {
					continue
				}
				const m = t.adjoin[j].adjoin.indexOf(t)
				t.adjoin[j].adjoin[m] = nt[j]
			}
			triangles.push(...nt)

			const checkFlip = nt.map(t => [t, 0])
			while (checkFlip.length > 0) {
				const [cf, j] = checkFlip.pop()
				const ad = cf.adjoin[j]
				if (!ad) {
					continue
				}
				const m = ad.adjoin.indexOf(cf)

				if (!cf.contains_circle(ad.p[m])) {
					continue
				}

				const j1 = (j + 1) % 3
				const j2 = (j + 2) % 3
				let m1 = (m + 1) % 3
				let m2 = (m + 2) % 3
				if (ad.p[m1].x !== cf.p[j1].x || ad.p[m1].y !== cf.p[j1].y) {
					;[m1, m2] = [m2, m1]
				}

				const cf_p = cf.p
				const cf_a = cf.adjoin
				const ad_a = ad.adjoin

				cf.p = [cf.p[j], cf.p[j1], ad.p[m]]
				cf.adjoin = [ad_a[m2], ad, cf_a[j2]]
				if (ad_a[m2]) {
					ad_a[m2].adjoin[ad_a[m2].adjoin.indexOf(ad)] = cf
				}

				ad.p = [cf_p[j], cf_p[j2], ad.p[m]]
				ad.adjoin = [ad_a[m1], cf, cf_a[j1]]
				if (cf_a[j1]) {
					cf_a[j1].adjoin[cf_a[j1].adjoin.indexOf(cf)] = ad
				}

				checkFlip.push([cf, 0])
				checkFlip.push([ad, 0])
			}
		}

		for (let i = triangles.length - 1; i >= 0; i--) {
			if (triangles[i].p.some(p => rootPoints.some(rp => p.x === rp.x && p.y === rp.y))) {
				triangles.splice(i, 1)
			}
		}

		this._triangles = triangles
	}
}

/**
 * Natural neighbor interpolation
 */
export default class NaturalNeighborInterpolation {
	// https://en.wikipedia.org/wiki/Natural_neighbor_interpolation
	// https://www.researchgate.net/profile/Christopher-Gold-3/publication/227220827_An_Efficient_Natural_Neighbour_Interpolation_Algorithm_for_Geoscientific_Modelling/links/0c96051bc609cee8b5000000/An-Efficient-Natural-Neighbour-Interpolation-Algorithm-for-Geoscientific-Modelling.pdf
	// https://gwlucastrig.github.io/TinfourDocs/NaturalNeighborTinfourAlgorithm/index.html
	/**
	 * Fit model.
	 *
	 * @param {Array<Array<number>>} x Training data
	 * @param {number[]} y Target values
	 */
	fit(x, y) {
		if (x[0].length === 1) {
			const d = x.map((v, i) => [v[0], y[i]])
			d.sort((a, b) => a[0] - b[0])
			this._x = d.map(v => v[0])
			this._y = d.map(v => v[1])
		} else if (x[0].length === 2) {
			const points = x.map((v, i) => new Point(v, y[i]))
			this._default_delaunay = new Delaunay2D(points)
		}
	}

	/**
	 * Returns probabilities of the datas.
	 *
	 * @param {Array<Array<number>>} x Sample data
	 * @returns {number[]} Predicted values
	 */
	predict(x) {
		if (x[0].length === 1) {
			return x.map(v => {
				const n = this._x.length
				if (v[0] <= this._x[0]) {
					return this._y[0]
				} else if (v[0] >= this._x[n - 1]) {
					return this._y[n - 1]
				}
				let i = 1
				for (; i < n && v[0] > this._x[i]; i++);
				if (v[0] === this._x[i]) {
					return this._y[i]
				}

				const mid = (this._x[i - 1] + this._x[i]) / 2
				const mid0 = (this._x[i - 1] + v[0]) / 2
				const mid1 = (v[0] + this._x[i]) / 2

				const w0 = mid - mid0
				const w1 = mid1 - mid
				return (w0 * this._y[i - 1] + w1 * this._y[i]) / (w0 + w1)
			})
		} else if (x[0].length === 2) {
			return x.map(v => {
				const xp = new Point(v)
				for (const point of this._default_delaunay._points) {
					if (xp.x === point.x && xp.y === point.y) {
						return point.value
					}
				}
				const dp = new Set()
				for (const triangle of this._default_delaunay._triangles) {
					if (triangle.contains_circle(xp)) {
						for (let i = 0; i < triangle.p.length; i++) {
							dp.add(triangle.p[i])
						}
					}
				}
				if (dp.size === 0) {
					return null
				}

				const newDelaunay = new Delaunay2D([xp, ...dp])
				const newTriangles = newDelaunay._triangles.filter(t => t.p.indexOf(xp) >= 0)

				const neighborPoints = new Set()
				for (const triangle of newTriangles) {
					for (const point of triangle.p) {
						neighborPoints.add(point)
					}
				}
				neighborPoints.delete(xp)
				for (const point of neighborPoints) {
					if (newTriangles.filter(t => t.p.indexOf(point) >= 0).length < 2) {
						return null
					}
				}

				const triangles = this._default_delaunay._triangles.filter(t => {
					return t.p.every(p => neighborPoints.has(p))
				})

				const w = []
				for (const point of neighborPoints) {
					const newPTri = newTriangles.filter(t => t.p.indexOf(point) >= 0)
					const adPoints = []
					const m = []
					for (let i = 0; i < newPTri.length; i++) {
						for (let k = 0; k < newPTri[i].p.length; k++) {
							if (newPTri[i].p[k] !== xp && newPTri[i].p[k] !== point) {
								adPoints[i] = newPTri[i].p[k]
								break
							}
						}
						if (!newPTri[i].contains(newPTri[i].circumcircle.center)) {
							m[i] = newPTri[i].circumcircle.center
						} else {
							m[i] = new Point([(adPoints[i].x + point.x) / 2, (adPoints[i].y + point.y) / 2])
						}
					}

					const basePath = [m[1], point, m[0]]
					const base =
						basePath.slice(1).reduce((s, p, i) => s + basePath[i].x * p.y - p.x * basePath[i].y, 0) / 2

					const g = newPTri.map(t => t.circumcircle.center)
					const newPath = [m[0], g[0], g[1], m[1]]
					const a = newPath.slice(1).reduce((s, p, i) => s + newPath[i].x * p.y - p.x * newPath[i].y, 0) / 2

					const pTri = triangles.filter(t => t.p.indexOf(point) >= 0)
					const c = []
					let oPoint = adPoints[0]
					while (pTri.length > 0) {
						let i = 0
						for (; i < pTri.length; i++) {
							if (pTri[i].p.indexOf(oPoint) >= 0) {
								break
							}
						}
						const tri = pTri.splice(i, 1)[0]
						if (!tri) {
							break
						}
						c.push(tri.circumcircle.center)

						for (let k = 0; k < tri.p.length; k++) {
							if (tri.p[k] !== oPoint && tri.p[k] !== point) {
								oPoint = tri.p[k]
								break
							}
						}
					}
					const oldPath = [m[0], ...c, m[1]]
					const t = oldPath.slice(1).reduce((s, p, i) => s + oldPath[i].x * p.y - p.x * oldPath[i].y, 0) / 2

					w.push([Math.abs(t + base) - Math.abs(a + base), point.value])
				}

				const wsum = w.reduce((s, v) => s + v[0], 0)
				return w.reduce((s, v) => s + v[0] * v[1], 0) / wsum
			})
		}
	}
}
