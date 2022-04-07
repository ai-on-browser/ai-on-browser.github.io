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
		const [p1, p2, p3] = (this._p = points)
		this._circumcircle = null

		this._h = [
			(p2.y - p1.y) * (p3.value - p1.value) - (p2.value - p1.value) * (p3.y - p1.y),
			(p2.value - p1.value) * (p3.x - p1.x) - (p2.x - p1.x) * (p3.value - p1.value),
			(p2.x - p1.x) * (p3.y - p1.y) - (p2.y - p1.y) * (p3.x - p1.x),
		]
		this._h[3] = -(this._h[0] * p1.x + this._h[1] * p1.y + this._h[2] * p1.value)
	}

	get circumcircle() {
		if (this._circumcircle) {
			return this._circumcircle
		}
		const [p1, p2, p3] = this.p

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

	value(p) {
		return -(this._h[0] * p.x + this._h[1] * p.y + this._h[3]) / this._h[2]
	}
}

/**
 * Delaunay interpolation
 */
export default class DelaunayInterpolation {
	// https://ja.wikipedia.org/wiki/%E3%83%89%E3%83%AD%E3%83%8D%E3%83%BC%E5%9B%B3
	// https://qiita.com/edo_m18/items/7b3c70ed97bac52b2203
	// https://www.slideshare.net/Kinokkory/ss-25736696
	/**
	 * Fit model.
	 *
	 * @param {Array<Array<number>>} x Training data
	 * @param {number[]} y Target values
	 */
	fit(x, y) {
		const n = x.length
		const min = [Infinity, Infinity]
		const max = [-Infinity, -Infinity]
		for (let i = 0; i < n; i++) {
			for (let d = 0; d < 2; d++) {
				min[d] = Math.min(min[d], x[i][d])
				max[d] = Math.max(max[d], x[i][d])
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
			const xi = new Point(x[i], y[i])
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

	/**
	 * Returns probabilities of the datas.
	 *
	 * @param {Array<Array<number>>} x Sample data
	 * @returns {number[]} Predicted values
	 */
	predict(x) {
		const p = Array(x.length).fill(null)
		for (let i = 0; i < x.length; i++) {
			const xi = new Point(x[i])
			for (let k = 0; k < this._triangles.length; k++) {
				if (this._triangles[k].contains(xi)) {
					p[i] = this._triangles[k].value(xi)
					break
				}
			}
		}
		return p
	}
}
