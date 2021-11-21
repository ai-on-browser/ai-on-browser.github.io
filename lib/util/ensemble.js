/**
 * Ensemble binary models
 */
export default class EnsembleBinaryModel {
	/**
	 * @param {*} model Binary model
	 * @param {'oneone' | 'onerest'} type
	 * @param {*[]} [classes]
	 * @param {*[]} [init_args]
	 */
	constructor(model, type, classes, init_args) {
		if (type === 'oneone') {
			return new OneVsOneModel(model, classes, init_args)
		} else if (type === 'onerest') {
			return new OneVsRestModel(model, classes, init_args)
		}
		return null
	}

	/**
	 * Initialize model.
	 * @param {Array<Array<number>>} train_x
	 * @param {Array<number | [number]>} train_y
	 */
	init(train_x, train_y) {}

	/**
	 * Fit model.
	 * @param {Array<Array<number>>} x
	 * @param {Array<number | [number]>} y
	 * @param {...*} args
	 */
	fit(x, y, ...args) {}

	/**
	 * Returns predicted values.
	 * @param {Array<Array<number>>} data
	 * @returns {number[]}
	 */
	predict(data) {}
}

const argmax = function (arr, key) {
	if (arr.length === 0) {
		return -1
	}
	arr = key ? arr.map(key) : arr
	return arr.indexOf(Math.max(...arr))
}

class OneVsRestModel {
	// one vs rest
	constructor(model, classes, init_args) {
		if (classes && !Array.isArray(classes)) {
			classes = [...classes]
		}
		this._modelcls = model
		this._classes = classes
		this._model = []
		this._n = 0
		this._init_args = init_args || []
		if (classes) {
			this._n = classes.length
			for (let i = 0; i < this._n; i++) {
				this._model[i] = new model(...this._init_args)
			}
		}
	}

	init(train_x, train_y) {
		train_y = train_y.flat()
		if (!this._classes) {
			this._classes = [...new Set(train_y)]
			this._n = this._classes.length
			for (let i = 0; i < this._n; i++) {
				this._model[i] = new this._modelcls(...this._init_args)
			}
		}
		for (let i = 0; i < this._n; i++) {
			if (this._model[i].init) {
				const dy = train_y.map(c => (c === this._classes[i] ? 1 : -1))
				this._model[i].init(train_x, dy)
			}
		}
	}

	fit(x, y, ...args) {
		if (!this._classes) {
			this.init(x, y)
		}
		for (let i = 0; i < this._n; i++) {
			if (this._model[i].init) {
				this._model[i].fit(x, y, ...args)
			} else {
				const dy = y.flat().map(c => (c === this._classes[i] ? 1 : -1))
				this._model[i].fit(x, dy, ...args)
			}
		}
	}

	predict(data) {
		let pred = []
		for (let i = 0; i < this._n; i++) {
			this._model[i].predict(data).map((v, k) => {
				if (!pred[k]) {
					pred[k] = []
				}
				pred[k][i] = Array.isArray(v) ? v[0] : v
			})
		}
		return pred.map(p => this._classes[argmax(p)])
	}
}

class OneVsOneModel {
	// one vs one
	constructor(model, classes, init_args) {
		if (classes && !Array.isArray(classes)) {
			classes = [...classes]
		}
		this._modelcls = model
		this._classes = classes
		this._model = []
		this._n = 0
		this._init_args = init_args || []
		if (classes) {
			this._n = classes.length
			for (let i = 0; i < this._n; i++) {
				this._model[i] = []
				for (let j = 0; j < i; j++) {
					this._model[i][j] = new model(...this._init_args)
				}
			}
		}
	}

	init(train_x, train_y) {
		train_y = train_y.flat()
		if (!this._classes) {
			this._classes = [...new Set(train_y)]
			this._n = this._classes.length
			for (let i = 0; i < this._n; i++) {
				this._model[i] = []
				for (let j = 0; j < i; j++) {
					this._model[i][j] = new this._modelcls(...this._init_args)
				}
			}
		}
		let d = {}
		train_y.forEach((c, i) => {
			if (!d[c]) d[c] = []
			d[c].push(train_x[i])
		})
		let lbl = []
		for (let i = 0; i < this._n; i++) {
			lbl[i] = Array(d[this._classes[i]].length).fill(1)
			for (let j = 0; j < i; j++) {
				if (this._model[i][j].init) {
					const dx = d[this._classes[i]].concat(d[this._classes[j]])
					const dy = lbl[i].concat(lbl[j])
					this._model[i][j].init(dx, dy)
				}
			}
			lbl[i].fill(-1)
		}
	}

	fit(x, y, ...args) {
		if (!this._classes) {
			this.init(x, y)
		}
		const d = {}
		y?.flat().forEach((c, i) => {
			if (!d[c]) d[c] = []
			d[c].push(x[i])
		})
		const lbl = []
		for (let i = 0; i < this._n; i++) {
			lbl[i] = Array(d[this._classes[i]]?.length ?? 0).fill(1)
			for (let j = 0; j < i; j++) {
				if (this._model[i][j].init) {
					this._model[i][j].fit(x, y, ...args)
				} else {
					const dx = d[this._classes[i]].concat(d[this._classes[j]])
					const dy = lbl[i].concat(lbl[j])
					this._model[i][j].fit(dx, dy, ...args)
				}
			}
			lbl[i].fill(-1)
		}
	}

	predict(data) {
		let pred = []
		for (let i = 0; i < data.length; i++) {
			pred.push(Array(this._n).fill(0))
		}
		for (let i = 0; i < this._n; i++) {
			for (let j = 0; j < i; j++) {
				this._model[i][j].predict(data).map((v, k) => {
					pred[k][v > 0 ? i : j]++
				})
			}
		}
		return pred.map(p => this._classes[argmax(p)])
	}
}
