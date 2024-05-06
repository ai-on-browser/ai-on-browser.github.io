/**
 * Statistical Region Merging
 */
export default class StatisticalRegionMerging {
	// http://www1.univ-ag.fr/~rnock/Articles/Drafts/tpami04-nn.pdf
	// https://en.wikipedia.org/wiki/Statistical_region_merging
	/**
	 * @param {number} t Threshold
	 */
	constructor(t) {
		this._t = t
	}

	_d(a, b) {
		return Math.sqrt(a.reduce((s, v, i) => s + (v - b[i]) ** 2, 0))
	}

	/**
	 * Fit model.
	 * @param {Array<Array<Array<number>>>} x Training data
	 * @returns {Array<Array<Array<number>>>} Predicted values
	 */
	predict(x) {
		this._values = []
		const checked = []
		const cons = []
		for (let i = 0; i < x.length; i++) {
			checked[i] = Array(x[i].length).fill(false)
			this._values[i] = Array(x[i].length).fill(0)
			cons[i] = []
			for (let j = 0; j < x[i].length; j++) {
				cons[i][j] = Array(4)
			}
		}
		for (let i = 0; i < x.length; i++) {
			for (let j = 0; j < x[i].length; j++) {
				if (i > 0) {
					cons[i - 1][j][0] = cons[i][j][2] = this._d(x[i][j], x[i - 1][j])
				}
				if (j > 0) {
					cons[i][j - 1][3] = cons[i][j][1] = this._d(x[i][j], x[i][j - 1])
				}
			}
		}

		while (true) {
			let root = null
			for (let i = 0; i < checked.length && !root; i++) {
				for (let j = 0; j < checked[i].length && !root; j++) {
					if (!checked[i][j]) {
						root = [i, j]
					}
				}
			}
			if (!root) {
				break
			}

			const stack = [root]
			const points = []
			const values = []
			while (stack.length > 0) {
				const p = stack.pop()
				const [pi, pj] = p
				if (!cons[pi][pj] || checked[pi][pj]) {
					continue
				}
				checked[pi][pj] = true
				points.push(p)
				values.push(x[pi][pj])

				if (cons[pi][pj][0] != null && cons[pi][pj][0] < this._t) {
					stack.push([pi + 1, pj])
				}
				if (cons[pi][pj][1] != null && cons[pi][pj][1] < this._t) {
					stack.push([pi, pj + 1])
				}
				if (cons[pi][pj][2] != null && cons[pi][pj][2] < this._t) {
					stack.push([pi - 1, pj])
				}
				if (cons[pi][pj][3] != null && cons[pi][pj][3] < this._t) {
					stack.push([pi, pj - 1])
				}
			}

			const m = values[0]
			for (let i = 1; i < values.length; i++) {
				for (let d = 0; d < m.length; d++) {
					m[d] += values[i][d]
				}
			}
			for (let d = 0; d < m.length; d++) {
				m[d] /= values.length
			}
			for (let i = 0; i < points.length; i++) {
				this._values[points[i][0]][points[i][1]] = m
			}
		}
		return this._values
	}
}
