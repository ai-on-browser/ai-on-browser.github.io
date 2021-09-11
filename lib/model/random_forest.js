export default class RandomForest {
	// see https://ja.wikipedia.org/wiki/%E3%83%A9%E3%83%B3%E3%83%80%E3%83%A0%E3%83%95%E3%82%A9%E3%83%AC%E3%82%B9%E3%83%88
	constructor(tree_num, sampling_rate = 0.8, tree_class = DecisionTreeClassifierSub) {
		this._trees = []
		this._treenum = tree_num
		this._samplingRate = sampling_rate
		this._treeclass = tree_class
	}

	get depth() {
		return Math.max(...this._trees.map(t => t.depth))
	}

	_sample(n) {
		const arr = []
		for (let i = 0; i < n; i++) {
			arr[i] = i
		}
		for (let i = n - 1; i > 0; i--) {
			const r = Math.floor(Math.random() * (i + 1))
			;[arr[i], arr[r]] = [arr[r], arr[i]]
		}
		return arr.slice(0, Math.ceil(n * this._samplingRate))
	}

	init(datas, targets) {
		this._trees = []
		for (let i = 0; i < this._treenum; i++) {
			const idx = this._sample(datas.length)
			const tdata = []
			const ttarget = []
			for (let k = 0; k < idx.length; k++) {
				tdata.push(datas[idx[k]])
				ttarget.push(targets[idx[k]])
			}
			const tree = new this._treeclass()
			tree.init(tdata, ttarget)
			this._trees.push(tree)
		}
	}

	fit(depth = 1) {
		this._trees.forEach(t => t.fit(depth))
	}

	predict_prob(datas) {
		const preds = this._trees.map(t => t.predict_prob(datas))
		const ret = []
		for (let i = 0; i < datas.length; i++) {
			const prob = new Map()
			for (let n = 0; n < preds.length; n++) {
				preds[n][i].forEach((v, k) => {
					prob.set(k, (prob.get(k) || 0) + v)
				})
			}
			prob.forEach((v, k) => {
				prob.set(k, v / preds.length)
			})
			ret.push(prob)
		}
		return ret
	}

	predict(datas) {
		if (this._trees[0].predict_prob) {
			const prob = this.predict_prob(datas)
			return prob.map(d => {
				let max_c = 0
				let max_cls = -1
				d.forEach((v, k) => {
					if (v > max_c) {
						max_c = v
						max_cls = k
					}
				})
				return max_cls
			})
		} else {
			const pred = this._trees.map(t => t.predict(datas))
			const ret = []
			for (let i = 0; i < datas.length; i++) {
				ret.push(pred.reduce((acc, v) => acc + v[i], 0) / pred.length)
			}
			return ret
		}
	}
}
