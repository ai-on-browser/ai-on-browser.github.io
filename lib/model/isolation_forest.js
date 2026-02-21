const shuffle = arr => {
	for (let i = arr.length - 1; i > 0; i--) {
		const r = Math.floor(Math.random() * (i + 1))
		;[arr[i], arr[r]] = [arr[r], arr[i]]
	}
	return arr
}

class IsolationTree {
	// https://www.slideshare.net/kataware/isolation-forest
	// https://cs.nju.edu.cn/zhouzh/zhouzh.files/publication/icdm08b.pdf
	constructor() {
		this._tree = {}
	}

	get c() {
		const n = this._n
		return 2 * Math.log(n - 1) + 0.5772156649 - (2 * (n - 1)) / n
	}

	_separate(d) {
		const n = d.length
		if (n <= 1) {
			return
		}
		const separatables = []
		const minmax = []
		for (let i = 0; i < d[0].length; i++) {
			let min = Infinity,
				max = -Infinity
			for (let k = 0; k < n; k++) {
				min = Math.min(min, d[k][i])
				max = Math.max(max, d[k][i])
			}
			if (min < max) {
				minmax.push([min, max])
				separatables.push(i)
			}
		}
		if (separatables.length === 0) {
			return
		}
		const idx = Math.floor(Math.random() * separatables.length)
		const sepF = separatables[idx]
		const sepV = Math.random() * (minmax[idx][1] - minmax[idx][0]) + minmax[idx][0]
		return [sepF, sepV]
	}

	fit(datas) {
		this._n = datas.length
		const nodes = [[this._tree, datas]]
		while (nodes.length > 0) {
			const [node, data] = nodes.pop()
			const sep = this._separate(data)
			if (!sep) {
				continue
			}
			;[node.feature, node.threshold] = sep

			const leftData = []
			const rightData = []
			for (let i = 0; i < data.length; i++) {
				if (data[i][node.feature] <= node.threshold) {
					leftData.push(data[i])
				} else {
					rightData.push(data[i])
				}
			}
			node.left = {}
			node.right = {}
			nodes.push([node.left, leftData])
			nodes.push([node.right, rightData])
		}
	}

	depth(data) {
		return data.map(d => {
			let t = this._tree
			let depth = 0
			while (t.left) {
				t = d[t.feature] <= t.threshold ? t.left : t.right
				depth++
			}
			return depth
		})
	}
}

/**
 * Isolation forest
 */
export default class IsolationForest {
	/**
	 * @param {number} [tree_num] Number of trees
	 * @param {number} [sampling_rate] Sampling rate
	 */
	constructor(tree_num = 100, sampling_rate = 0.8) {
		this._tree_num = tree_num
		this._rate = sampling_rate
		this._trees = []
	}

	/**
	 * Fit model.
	 * @param {Array<Array<number>>} datas Training data
	 */
	fit(datas) {
		this._trees = []
		const en = Math.ceil(datas.length * this._rate)
		const idx = datas.map((_, i) => i)
		for (let i = 0; i < this._tree_num; i++) {
			shuffle(idx)
			const tdata = []
			for (let k = 0; k < en; k++) {
				tdata.push(datas[idx[k]])
			}
			const tree = new IsolationTree()
			tree.fit(tdata)
			this._trees.push(tree)
		}
	}

	/**
	 * Returns anomaly degrees.
	 * @param {Array<Array<number>>} datas Sample data
	 * @returns {number[]} Predicted values
	 */
	predict(datas) {
		const n = datas.length
		const depthes = this._trees.map(t => t.depth(datas))
		const c = this._trees.reduce((s, t) => s + t.c, 0) / this._trees.length
		const outliers = []
		for (let i = 0; i < n; i++) {
			let e = 0
			for (let k = 0; k < depthes.length; k++) {
				e += depthes[k][i]
			}
			e /= depthes.length
			outliers.push(2 ** (-e / c))
		}
		return outliers
	}
}
