import Matrix from '../util/matrix.js'

/**
 * Split and merge segmentation
 */
export default class SplitAndMerge {
	// https://en.wikipedia.org/wiki/Split_and_merge_segmentation
	/**
	 * @param {'variance' | 'uniformity'} [method=variance] Method name
	 * @param {number} [threshold=0.1] Threshold
	 */
	constructor(method = 'variance', threshold = 0.1) {
		this._method = method
		this._threshold = threshold
	}

	_shouldSplit(data) {
		data = Matrix.fromArray(data.flat())
		if (this._method === 'variance') {
			const variance = data.variance(0).mean()
			if (variance > this._threshold) {
				return true
			}
		} else if (this._method === 'uniformity') {
			const mean = data.mean(1)
			mean.sub(mean.mean())
			mean.map(Math.abs)
			if (mean.max() > this._threshold) {
				return true
			}
		}
		return false
	}

	/**
	 * Returns predicted segments.
	 *
	 * @param {Array<Array<Array<number>>>} x Training data
	 * @returns {Array<Array<number>>} Predicted values
	 */
	predict(x) {
		this._x = x

		let category = 0
		const tree = {
			data: x,
			category: category++,
			range: [
				[0, x.length],
				[0, x[0].length],
			],
			children: [],
			get leafs() {
				return this.children.length === 0 ? [this] : this.children.reduce((c, v) => c.concat(v.leafs), [])
			},
		}
		const stack = [tree]
		while (stack.length > 0) {
			const node = stack.pop()
			const xd = node.data
			if (xd.length <= 1 || xd[0].length <= 1) {
				continue
			}
			const range = node.range

			if (this._shouldSplit(xd)) {
				const n = range.map(r => r[1] - r[0])
				const c = n.map(v => Math.floor(v / 2))
				const r = []
				for (let i = 0; i < 2 ** n.length; i++) {
					const p = i
						.toString(2)
						.padStart(n.length, '0')
						.split('')
						.map(v => !!+v)
					r.push(p.map((v, i) => (v ? [0, c[i]] : [c[i], n[i]])))
				}

				for (const [r1, r2] of r) {
					const d = []
					for (let i = r1[0]; i < r1[1]; i++) {
						const dr = []
						for (let j = r2[0]; j < r2[1]; j++) {
							dr.push(xd[i][j])
						}
						d.push(dr)
					}
					const child = {
						data: d,
						category: category++,
						range: [
							[range[0][0] + r1[0], range[0][0] + r1[1]],
							[range[1][0] + r2[0], range[1][0] + r2[1]],
						],
						children: [],
						get leafs() {
							return this.children.length === 0
								? [this]
								: this.children.reduce((c, v) => c.concat(v.leafs), [])
						},
					}
					node.children.push(child)
					stack.push(child)
				}
			}
		}

		const segments = tree.leafs
		for (let i = 0; i < segments.length; i++) {
			const range = segments[i].range
			for (let j = 0; j < segments.length; j++) {
				if (segments[i].category === segments[j].category) {
					continue
				}
				const r = segments[j].range
				let adjust = false
				for (let k = 0; k < r.length; k++) {
					if (r[k][0] === range[k][1] || r[k][1] === range[k][0]) {
						if (r.every((v, d) => d === k || (r[d][0] < range[d][1] && range[d][0] < r[d][1]))) {
							adjust = true
						}
					}
				}

				if (!adjust) {
					continue
				}

				const segs = segments.filter(
					s => s.category === segments[i].category || s.category === segments[j].category
				)
				const data = []
				for (const seg of segs) {
					data.push(...seg.data.flat())
				}

				if (!this._shouldSplit(data)) {
					const c = Math.min(segments[i].category, segments[j].category)
					for (const seg of segs) {
						seg.category = c
					}
				}
			}
		}

		const pred = []
		for (let i = 0; i < this._x.length; pred[i++] = []);
		tree.leafs.forEach(node => {
			const r = node.range
			for (let i = r[0][0]; i < r[0][1]; i++) {
				for (let j = r[1][0]; j < r[1][1]; j++) {
					pred[i][j] = node.category
				}
			}
		})
		return pred
	}
}
