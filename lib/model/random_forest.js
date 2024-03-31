import { DecisionTreeClassifier, DecisionTreeRegression } from './decision_tree.js'

/**
 * Bsae class for random forest models
 */
class RandomForest {
	// see https://ja.wikipedia.org/wiki/%E3%83%A9%E3%83%B3%E3%83%80%E3%83%A0%E3%83%95%E3%82%A9%E3%83%AC%E3%82%B9%E3%83%88
	/**
	 * @param {number} tree_num Number of trees
	 * @param {number} [sampling_rate] Sampling rate
	 * @param {DecisionTreeClassifier | DecisionTreeRegression} tree_class Tree class
	 * @param {*[]} [tree_class_args] Arguments for constructor of tree class
	 */
	constructor(tree_num, sampling_rate = 0.8, tree_class, tree_class_args = null) {
		this._samplingRate = sampling_rate

		this._trees = []
		for (let i = 0; i < tree_num; i++) {
			const tree = new tree_class(...(tree_class_args || []))
			this._trees.push(tree)
		}
	}

	/**
	 * The max depth among the trees.
	 *
	 * @type {number}
	 */
	get depth() {
		return Math.max(...this._trees.map(t => t.depth))
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
			this._trees[i].init(tdata, ttarget)
		}
	}

	/**
	 * Fit model.
	 */
	fit() {
		this._trees.forEach(t => t.fit())
	}

	/**
	 * Returns probability of the datas.
	 *
	 * @param {Array<Array<number>>} datas Sample data
	 * @returns {Map<number, number>[]} Predicted values
	 */
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
}

/**
 * Random forest classifier
 */
export class RandomForestClassifier extends RandomForest {
	// see https://ja.wikipedia.org/wiki/%E3%83%A9%E3%83%B3%E3%83%80%E3%83%A0%E3%83%95%E3%82%A9%E3%83%AC%E3%82%B9%E3%83%88
	/**
	 * @param {number} tree_num Number of trees
	 * @param {number} [sampling_rate] Sampling rate
	 * @param {'ID3' | 'CART'} [method] Method name
	 */
	constructor(tree_num, sampling_rate = 0.8, method = 'CART') {
		super(tree_num, sampling_rate, DecisionTreeClassifier, [method])
	}

	/**
	 * Returns predicted values.
	 *
	 * @param {Array<Array<number>>} datas Sample data
	 * @returns {*[]} Predicted values
	 */
	predict(datas) {
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
	}
}

/**
 * Random forest regressor
 */
export class RandomForestRegressor extends RandomForest {
	// see https://ja.wikipedia.org/wiki/%E3%83%A9%E3%83%B3%E3%83%80%E3%83%A0%E3%83%95%E3%82%A9%E3%83%AC%E3%82%B9%E3%83%88
	/**
	 * @param {number} tree_num Number of trees
	 * @param {number} [sampling_rate] Sampling rate
	 */
	constructor(tree_num, sampling_rate = 0.8) {
		super(tree_num, sampling_rate, DecisionTreeRegression)
	}

	/**
	 * Returns predicted values.
	 *
	 * @param {Array<Array<number>>} datas Sample data
	 * @returns {number[]} Predicted values
	 */
	predict(datas) {
		const pred = this._trees.map(t => t.predict(datas))
		const ret = []
		for (let i = 0; i < datas.length; i++) {
			ret.push(pred.reduce((acc, v) => acc + v[i], 0) / pred.length)
		}
		return ret
	}
}
