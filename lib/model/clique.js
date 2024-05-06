/**
 * CLustering In QUEst
 */
export default class CLIQUE {
	// Automatic subspace clustering of high dimensional data for data mining applications
	// https://dl.acm.org/doi/pdf/10.1145/276304.276314
	/**
	 * @param {number | number[]} xi Intervals
	 * @param {number} t Density threshold
	 */
	constructor(xi, t) {
		this._xi = xi
		this._t = t
	}

	/**
	 * Number of clusters
	 * @type {number}
	 */
	get size() {
		return this._clusters.length
	}

	/**
	 * Fit model.
	 * @param {Array<Array<number>>} datas Training data
	 */
	fit(datas) {
		const n = datas.length
		const dim = datas[0].length
		const min = Array(dim).fill(Infinity)
		const max = Array(dim).fill(-Infinity)
		for (let i = 0; i < n; i++) {
			for (let d = 0; d < dim; d++) {
				min[d] = Math.min(min[d], datas[i][d])
				max[d] = Math.max(max[d], datas[i][d])
			}
		}
		this._u = []
		for (let d = 0; d < dim; d++) {
			this._u[d] = []
			let v = min[d]
			while (v <= max[d]) {
				const nv = v + (Array.isArray(this._xi) ? this._xi[d] : this._xi)
				this._u[d].push([v, nv])
				v = nv
			}
		}

		let dense = []
		for (let d = 0; d < dim; d++) {
			for (let k = 0; k < this._u[d].length; k++) {
				const den = { c: Array(dim).fill(-1), i: new Set() }
				den.c[d] = k
				for (let i = 0; i < n; i++) {
					if (this._u[d][k][0] <= datas[i][d] && datas[i][d] < this._u[d][k][1]) {
						den.i.add(i)
					}
				}
				if (den.i.size / n >= this._t) {
					dense.push(den)
				}
			}
		}

		for (let k = 0; k < dim; k++) {
			const nextDen = []
			for (let i = 0; i < dense.length; i++) {
				for (let j = 0; j < i; j++) {
					let diffi = -1
					let diffj = -1
					const c = []
					for (let d = 0; d < dim; d++) {
						if (dense[i].c[d] === dense[j].c[d]) {
							if (dense[i].c[d] >= 0 && (diffi >= 0 || diffj >= 0)) {
								break
							}
							c[d] = dense[i].c[d]
							continue
						}
						if (dense[i].c[d] < 0) {
							if (diffj >= 0) break
							diffj = d
							c[d] = dense[j].c[d]
						} else if (dense[j].c[d] < 0) {
							if (diffi >= 0) break
							diffi = d
							c[d] = dense[i].c[d]
						} else {
							break
						}
					}
					if (c.length < dim) {
						continue
					}
					const den = { c, i: new Set() }
					for (const s of dense[i].i) {
						if (dense[j].i.has(s)) {
							den.i.add(s)
						}
					}
					if (den.i.size / n >= this._t) {
						nextDen.push(den)
					}
				}
			}
			if (nextDen.length === 0) {
				break
			}
			dense = nextDen
		}

		const stack = []
		const clusters = []
		let curCluster = []
		while (dense.length > 0 || stack.length > 0) {
			if (stack.length === 0) {
				if (curCluster.length > 0) {
					clusters.push(curCluster)
					curCluster = []
				}
				stack.push(dense.pop())
			}
			const a = stack.pop()
			curCluster.push(a)
			for (let i = dense.length - 1; i >= 0; i--) {
				let neighborDims = 0
				for (let d = 0; d < dim && neighborDims < 2; d++) {
					if (a.c[d] < 0 || dense[i].c[d] < 0 || a.c[d] === dense[i].c[d]) {
						continue
					}
					if (Math.abs(a.c[d] - dense[i].c[d]) > 1) {
						neighborDims = 2
						break
					}
					neighborDims++
				}
				if (neighborDims < 2) {
					stack.push(dense.splice(i, 1)[0])
				}
			}
		}
		if (curCluster.length > 0) {
			clusters.push(curCluster)
		}

		this._clusters = clusters
	}

	/**
	 * Returns predicted categories.
	 * @param {Array<Array<number>>} x Sample data
	 * @returns {number[]} Predicted categories
	 */
	predict(x) {
		const p = Array(x.length).fill(-1)
		for (let i = 0; i < x.length; i++) {
			for (let k = 0; k < this._clusters.length; k++) {
				let isMatch = false
				for (let j = 0; j < this._clusters[k].length; j++) {
					const a = this._clusters[k][j]
					let isInside = true
					for (let d = 0; d < a.c.length; d++) {
						if (a.c[d] < 0) {
							continue
						}
						const u = this._u[d][a.c[d]]
						if (x[i][d] < u[0] || u[1] <= x[i][d]) {
							isInside = false
							break
						}
					}
					if (isInside) {
						isMatch = true
						break
					}
				}
				if (isMatch) {
					p[i] = k
					break
				}
			}
		}
		return p
	}
}
