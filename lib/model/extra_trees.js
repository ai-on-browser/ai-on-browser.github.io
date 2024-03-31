/**
 * Bsae class for Extremely Randomized Trees
 */
class ExtraTrees {
	// https://yoshoku.hatenablog.com/entry/2019/05/02/005231
	// https://www.slideshare.net/itakigawa/ss-77062106
	/**
	 * @param {number} tree_num Number of trees
	 * @param {number} [sampling_rate] Sampling rate
	 */
	constructor(tree_num, sampling_rate = 1.0) {
		this._samplingRate = sampling_rate

		this._trees = []
		for (let i = 0; i < tree_num; i++) {
			const tree = {
				data: null,
				target: null,
				children: [],
			}
			this._trees.push(tree)
		}
		this._depth = 1
	}

	/**
	 * The max depth among the trees.
	 *
	 * @type {number}
	 */
	get depth() {
		return this._depth
	}

	_sample(n) {
		const arr = Array.from({ length: n }, (_, i) => i)
		for (let i = n - 1; i > 0; i--) {
			const r = Math.floor(Math.random() * (i + 1))
			;[arr[i], arr[r]] = [arr[r], arr[i]]
		}
		return arr.slice(0, Math.ceil(n * this._samplingRate))
	}

	/**
	 * Initialize model.
	 *
	 * @param {Array<Array<number>>} datas Training data
	 * @param {*[]} targets Target values
	 */
	init(datas, targets) {
		for (let i = 0; i < this._trees.length; i++) {
			const idx = this._sample(datas.length)
			const tdata = []
			const ttarget = []
			for (let k = 0; k < idx.length; k++) {
				tdata.push(datas[idx[k]])
				ttarget.push(targets[idx[k]])
			}
			this._trees[i].data = tdata
			this._trees[i].target = ttarget
		}
	}

	/**
	 * Fit model.
	 */
	fit() {
		let stack = this._trees
		while (true) {
			const nstack = []
			for (let i = 0; i < stack.length; i++) {
				if (stack[i].children.length === 0) {
					nstack.push(stack[i])
				} else {
					nstack.push(...stack[i].children)
				}
			}
			if (stack.length === nstack.length) {
				break
			}
			stack = nstack
		}
		stack.forEach(t => {
			const data = t.data
			if (data.length <= 1) {
				return
			}
			const feature = Math.floor(Math.random() * data[0].length)
			const fdata = data.map(v => v[feature])
			fdata.sort((a, b) => a - b)
			const tidx = Math.floor(Math.random() * (fdata.length - 1))
			const threshold = (fdata[tidx] + fdata[tidx + 1]) / 2

			t.feature = feature
			t.threshold = threshold
			t.children = [
				{
					data: data.filter(v => v[feature] < threshold),
					target: t.target.filter((v, i) => data[i][feature] < threshold),
					children: [],
				},
				{
					data: data.filter(v => v[feature] >= threshold),
					target: t.target.filter((v, i) => data[i][feature] >= threshold),
					children: [],
				},
			]
		})
		this._depth++
	}

	_predict_leafs(datas) {
		return datas.map(v => {
			return this._trees.map(t => {
				while (true) {
					if (t.children.length === 0) {
						return t
					}
					if (v[t.feature] < t.threshold) {
						t = t.children[0]
					} else {
						t = t.children[1]
					}
				}
			})
		})
	}
}

/**
 * Extra trees classifier
 */
export class ExtraTreesClassifier extends ExtraTrees {
	/**
	 * @param {number} tree_num Number of trees
	 * @param {number} [sampling_rate] Sampling rate
	 */
	constructor(tree_num, sampling_rate = 1.0) {
		super(tree_num, sampling_rate)
	}

	/**
	 * Returns predicted values.
	 *
	 * @param {Array<Array<number>>} datas Sample data
	 * @returns {*[]} Predicted values
	 */
	predict(datas) {
		const predLeafs = this._predict_leafs(datas)
		return predLeafs.map(leafs => {
			const counts = {}
			let label = null
			for (let k = 0; k < leafs.length; k++) {
				const leaf = leafs[k]
				const c = {}
				let llabel = null
				for (let i = 0; i < leaf.target.length; i++) {
					if (!c[leaf.target[i]]) {
						c[leaf.target[i]] = 0
					}
					c[leaf.target[i]]++
					if (llabel === null || c[llabel] < c[leaf.target[i]]) {
						llabel = leaf.target[i]
					}
				}

				if (!counts[llabel]) {
					counts[llabel] = 0
				}
				counts[llabel]++
				if (label === null || counts[label] < counts[llabel]) {
					label = llabel
				}
			}
			return label
		})
	}
}

/**
 * Extra trees regressor
 */
export class ExtraTreesRegressor extends ExtraTrees {
	/**
	 * @param {number} tree_num Number of trees
	 * @param {number} [sampling_rate] Sampling rate
	 */
	constructor(tree_num, sampling_rate = 1.0) {
		super(tree_num, sampling_rate)
	}

	/**
	 * Returns predicted values.
	 *
	 * @param {Array<Array<number>>} datas Sample data
	 * @returns {number[]} Predicted values
	 */
	predict(datas) {
		const predLeafs = this._predict_leafs(datas)
		return predLeafs.map(leafs => {
			let v = 0
			for (let k = 0; k < leafs.length; k++) {
				const leaf = leafs[k]

				v += leaf.target.reduce((s, v) => s + v, 0) / leaf.target.length
			}
			return v / leafs.length
		})
	}
}
