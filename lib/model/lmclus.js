import Matrix from '../util/matrix.js'

/**
 * Linear manifold clustering
 */
export default class LMCLUS {
	// Linear manifold clustering in high dimensional spaces by stochastic search
	// https://citeseerx.ist.psu.edu/document?repid=rep1&type=pdf&doi=76925699b88b9e3c599269f214b0b50fb02bb1f6
	/**
	 * @param {number} k Max LM dim
	 * @param {number} s Sampling level
	 * @param {number} gamma Sensitivity threshold
	 */
	constructor(k, s, gamma) {
		this._k = k
		this._s = s
		this._gamma = gamma
	}

	/**
	 * Number of clusters.
	 * @type {number}
	 */
	get size() {
		return this._c.length
	}

	/**
	 * Fit model
	 * @param {Array<Array<number>>} datas Training data
	 */
	fit(datas) {
		this._c = []
		this._dims = []
		const d = datas.concat()
		const labeled = Array(d.length).fill(false)
		while (labeled.some(v => !v)) {
			let ddIndexes = []
			for (let i = 0; i < labeled.length; i++) {
				if (!labeled[i]) {
					ddIndexes.push(i)
				}
			}
			let dd = ddIndexes.map(i => d[i])
			let lmDim = 1
			for (let k = 1; k <= this._k; k++) {
				const [g, tau, phi, beta] = this._findSeparation(dd, k, this._s)
				if (g <= this._gamma) {
					break
				}
				const newdd = []
				const newddidx = []
				for (let j = 0; j < dd.length; j++) {
					const xd = new Matrix(
						dd[j].length,
						1,
						dd[j].map((v, i) => v - phi[i])
					)
					const bxd = beta.dot(xd)
					const dist = xd.tDot(xd).toScaler() - bxd.tDot(bxd).toScaler()
					if (dist < tau) {
						newdd.push(dd[j])
						newddidx.push(ddIndexes[j])
					}
				}
				dd = newdd
				lmDim = k
				ddIndexes = newddidx
			}
			if (dd.length === 0) {
				continue
			}

			this._c.push(ddIndexes)
			this._dims.push(lmDim)
			for (let i = 0; i < ddIndexes.length; i++) {
				labeled[ddIndexes[i]] = true
			}
		}
	}

	_sampleidx(n, k) {
		const idx = []
		for (let i = 0; i < k; i++) {
			idx.push(Math.floor(Math.random() * (n - i)))
		}
		for (let i = idx.length - 1; i >= 0; i--) {
			for (let j = idx.length - 1; j > i; j--) {
				if (idx[i] <= idx[j]) {
					idx[j]++
				}
			}
		}
		return idx
	}

	_findSeparation(d, k, s) {
		let gamma = -Infinity
		let tau = -Infinity
		let phi = null
		let beta = null
		const eps = 1.0e-8
		const c = 1
		const N = Math.min(Math.log(eps) / Math.log(1 - (1 / s) ** k), c * d.length)

		for (let i = 0; i < N; i++) {
			const idxes = this._sampleidx(d.length, k + 1)
			const m = idxes.map(idx => d[idx])
			const [b] = Matrix.fromArray(m).qrGramSchmidt()
			const distances = []
			for (let j = 0; j < d.length; j++) {
				if (idxes.includes(j)) {
					continue
				}
				const xd = new Matrix(d[j].length, 1, d[j])
				const bxd = b.dot(xd)
				const dist = xd.tDot(xd).toScaler() - bxd.tDot(bxd).toScaler()
				distances.push(dist)
			}

			const [hist, ranges] = this._makeHistogram(distances)
			const [t, g] = this._findMinimumErrorThreshold(hist, ranges)
			if (g > gamma) {
				gamma = g
				tau = t
				phi = m[0]
				beta = b
			}
		}
		return [gamma, tau, phi, beta]
	}

	_makeHistogram(d) {
		let max = -Infinity
		let min = Infinity
		let sum = 0
		for (let i = 0; i < d.length; i++) {
			max = Math.max(max, d[i])
			min = Math.min(min, d[i])
			sum += d[i]
		}
		const mean = sum / d.length
		let vari = 0
		for (let i = 0; i < d.length; i++) {
			vari += (mean - d[i]) ** 2
		}
		vari /= d.length
		const std = Math.sqrt(vari)
		const step = std * Math.cbrt((24 * Math.sqrt(Math.PI)) / d.length)
		const ranges = [min]
		while (ranges[ranges.length - 1] < max) {
			ranges[ranges.length] = ranges[ranges.length - 1] + step
		}
		const count = ranges.length - 1

		const hist = Array(count).fill(0)
		for (let i = 0; i < d.length; i++) {
			if (d[i] === max) {
				hist[count - 1]++
			} else {
				hist[Math.floor((d[i] - min) / step)]++
			}
		}
		return [hist, ranges]
	}

	_findMinimumErrorThreshold(h, r) {
		let tau = -1
		let minj = Infinity
		let maxj = -Infinity
		let discriminability = 0
		for (let t = 0; t < h.length - 1; t++) {
			let p1 = 0
			let p2 = 0
			let m1 = 0
			let m2 = 0
			for (let i = 0; i < h.length; i++) {
				if (i <= t) {
					p1 += h[i]
					m1 += i * h[i]
				} else {
					p2 += h[i]
					m2 += i * h[i]
				}
			}
			m1 /= p1
			m2 /= p2
			let s1 = 0
			let s2 = 0
			for (let i = 0; i < h.length; i++) {
				if (i <= t) {
					s1 += (i - m1) ** 2 * h[i]
				} else {
					s2 += (i - m2) ** 2 * h[i]
				}
			}
			s1 /= p1
			s2 /= p2

			const j =
				1 +
				2 * (p1 * Math.log(Math.sqrt(s1)) + p2 * Math.log(Math.sqrt(s2))) -
				2 * (p1 * Math.log(p1) + p2 * Math.log(p2))
			if (j < minj) {
				minj = j
				tau = t
				discriminability = (m1 - m2) ** 2 / (s1 + s2)
			}
			maxj = Math.max(maxj, j)
		}
		const g = discriminability * (maxj - minj)
		return [r[tau + 1], g]
	}

	/**
	 * Returns predicted categories.
	 * @returns {number[]} Predicted values
	 */
	predict() {
		const pred = []
		for (let k = 0; k < this._c.length; k++) {
			for (let i = 0; i < this._c[k].length; i++) {
				pred[this._c[k][i]] = k
			}
		}
		return pred
	}
}
