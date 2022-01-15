import Tree from '../util/tree.js'

const shuffle = function (arr) {
	for (let i = arr.length - 1; i > 0; i--) {
		let r = Math.floor(Math.random() * (i + 1))
		;[arr[i], arr[r]] = [arr[r], arr[i]]
	}
	return arr
}

class IsolationTree {
	// https://www.slideshare.net/kataware/isolation-forest
	// https://cs.nju.edu.cn/zhouzh/zhouzh.files/publication/icdm08b.pdf
	constructor() {
		this._tree = new Tree({})
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
			if (node.isLeaf()) {
				const sep = this._separate(data)
				if (!sep) {
					continue
				}
				const [f, th] = sep
				node.value.feature = f
				node.value.threshold = th
				node.push({})
				node.push({})
			}
			const leftData = []
			const rightData = []
			for (let i = 0; i < data.length; i++) {
				if (data[i][node.value.feature] <= node.value.threshold) {
					leftData.push(data[i])
				} else {
					rightData.push(data[i])
				}
			}
			nodes.push([node.at(0), leftData])
			nodes.push([node.at(1), rightData])
		}
	}

	depth(data) {
		return data.map(d => {
			let t = this._tree
			let depth = 0
			while (!t.isLeaf()) {
				t = d[t.value.feature] <= t.value.threshold ? t.at(0) : t.at(1)
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
	 * @param {number} [tree_num=100]
	 * @param {number} [sampling_rate=0.8]
	 */
	constructor(tree_num = 100, sampling_rate = 0.8) {
		this._tree_num = tree_num
		this._rate = sampling_rate
		this._trees = []
	}

	/**
	 * Fit model.
	 *
	 * @param {Array<Array<number>>} datas
	 */
	fit(datas) {
		this._trees = []
		const en = Math.ceil(datas.length * this._rate)
		const idx = []
		for (let i = 0; i < datas.length; idx.push(i++));
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
	 *
	 * @param {Array<Array<number>>} datas
	 * @returns {number[]}
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
