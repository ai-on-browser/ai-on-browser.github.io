/**
 * Decision tree
 */
class DecisionTree {
	constructor() {
		this._depth = 0
	}

	/**
	 * Depth of the tree
	 * @type {number}
	 */
	get depth() {
		return this._depth
	}

	/**
	 * Initialize model.
	 * @param {Array<Array<number>>} datas Training data
	 * @param {*[]} targets Target values
	 */
	init(datas, targets) {
		this._datas = datas.map((d, i) => ({
			value: d,
			target: targets[i],
		}))
		this._tree = {
			datas: this._datas,
			value: this._calcValue(this._datas),
			score: this._calcScore(this._datas),
			children: [],
			get leafs() {
				return this.children.length === 0 ? [this] : this.children.reduce((c, v) => c.concat(v.leafs), [])
			},
		}
		this._features = datas[0].length
		this._depth = 1
	}

	/**
	 * Fit model.
	 */
	fit() {
		this._tree.leafs.forEach(node => {
			let best_score = node.score
			let best_feature = -1
			let best_threshold = -1
			for (let i = 0; i < this._features; i++) {
				const values = node.datas.map(p => p.value[i])
				values.sort((a, b) => a - b)
				for (let vidx = 0; vidx < values.length - 1; vidx++) {
					const th = (values[vidx] + values[vidx + 1]) / 2
					const lt = node.datas.filter(p => p.value[i] < th)
					const rt = node.datas.filter(p => p.value[i] >= th)
					const score = (this._calcScore(lt) * lt.length + this._calcScore(rt) * rt.length) / values.length
					if (score < best_score) {
						best_score = score
						best_feature = i
						best_threshold = th
					}
				}
			}
			if (best_score < node.score) {
				node.feature = best_feature
				node.threshold = best_threshold
				const lt = node.datas.filter(p => p.value[best_feature] < best_threshold)
				const rt = node.datas.filter(p => p.value[best_feature] >= best_threshold)
				node.children.push({
					datas: lt,
					score: this._calcScore(lt),
					value: this._calcValue(lt),
					children: [],
					get leafs() {
						return this.children.length === 0
							? [this]
							: this.children.reduce((c, v) => c.concat(v.leafs), [])
					},
				})
				node.children.push({
					datas: rt,
					score: this._calcScore(rt),
					value: this._calcValue(rt),
					children: [],
					get leafs() {
						return this.children.length === 0
							? [this]
							: this.children.reduce((c, v) => c.concat(v.leafs), [])
					},
				})
			}
		})
		this._depth++
	}

	/**
	 * Returns importances of the features.
	 * @returns {number[]} Importances
	 */
	importance() {
		const imp = Array(this._features).fill(0)
		let s = 0
		const stack = [this._tree]
		while (stack.length > 0) {
			const node = stack.pop()
			if (node.children.length === 0) {
				continue
			}
			const pdata = node.datas
			const ldata = node.children[0].datas
			const rdata = node.children[1].datas
			const v =
				(this._calcScore(pdata) * pdata.length -
					this._calcScore(ldata) * ldata.length -
					this._calcScore(rdata) * rdata.length) /
				this._datas.length
			imp[node.feature] += v
			s += v
			stack.push(...node.children)
		}
		if (s === 0) {
			return imp
		}
		return imp.map(v => v / s)
	}

	/**
	 * Returns predicted values.
	 * @param {Array<Array<number>>} data Sample data
	 * @returns {number[]} Predicted values
	 */
	predict_value(data) {
		return data.map(d => {
			let t = this._tree
			while (t.children.length > 0) {
				t = d[t.feature] < t.threshold ? t.children[0] : t.children[1]
			}
			return t.value
		})
	}
}

/**
 * Decision tree classifier
 */
export class DecisionTreeClassifier extends DecisionTree {
	/**
	 * @param {'ID3' | 'CART'} method Method name
	 */
	constructor(method) {
		super()
		this._method = method
	}

	_calcValue(datas) {
		return this._classesRate(datas)
	}

	_calcScore(datas) {
		if (this._method === 'ID3') {
			return this._id3(datas)
		}
		return this._gini(datas)
	}

	_classesRate(datas) {
		const classes = new Map()
		datas.forEach(t => {
			classes.set(t.target, (classes.get(t.target) || 0) + 1)
		})
		classes.forEach((v, k) => {
			classes.set(k, v / datas.length)
		})
		return classes
	}

	_id3(datas) {
		const cr = this._classesRate(datas)
		let j = 0
		cr.forEach(v => {
			j -= v * Math.log(v)
		})
		return j
	}

	_gini(datas) {
		const cr = this._classesRate(datas)
		let j = 1
		cr.forEach(v => {
			j -= v ** 2
		})
		return j
	}

	/**
	 * Returns probability of the datas.
	 * @param {Array<Array<number>>} data Sample data
	 * @returns {number[]} Predicted values
	 */
	predict_prob(data) {
		return this.predict_value(data)
	}

	/**
	 * Returns predicted values.
	 * @param {Array<Array<number>>} data Sample data
	 * @returns {*[]} Predicted values
	 */
	predict(data) {
		const prob = this.predict_prob(data)
		return prob.map(d => {
			let max_c = 0,
				max_cls = -1
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
 * Decision tree regression
 */
export class DecisionTreeRegression extends DecisionTree {
	_calcValue(datas) {
		if (datas.length === 0) return 0
		if (Array.isArray(datas[0].target)) {
			const dim = datas[0].target.length
			return datas
				.reduce((acc, d) => acc.map((v, i) => v + d.target[i]), Array(dim).fill(0))
				.map(v => v / datas.length)
		} else {
			return datas.reduce((acc, d) => acc + d.target, 0) / datas.length
		}
	}

	_calcScore(datas) {
		if (datas.length === 0) return 0
		const m = this._calcValue(datas)
		if (Array.isArray(datas[0].target)) {
			return Math.sqrt(
				datas.reduce((acc, d) => acc + d.target.reduce((s, v, i) => s + (v - m[i]) ** 2, 0), 0) / datas.length
			)
		} else {
			return Math.sqrt(datas.reduce((acc, d) => acc + (d.target - m) ** 2, 0) / datas.length)
		}
	}

	/**
	 * Returns predicted values.
	 * @param {Array<Array<number>>} data Sample data
	 * @returns {number[]} Predicted values
	 */
	predict(data) {
		return this.predict_value(data)
	}
}
