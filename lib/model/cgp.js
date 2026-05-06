const vectorize = (func, name, formatter) =>
	new Proxy(func, {
		apply(target, _, argArray) {
			if (argArray.every(v => !Array.isArray(v))) {
				return target(...argArray)
			}
			const length = argArray.reduce((l, v) => (Array.isArray(v) ? Math.max(l, v.length) : l), 1)
			const result = []
			for (let i = 0; i < length; i++) {
				result[i] = target(...argArray.map(v => (Array.isArray(v) ? v[i] : v)))
			}
			return result
		},
		get(target, p) {
			if (p === 'name') {
				return target.name || name
			} else if (p === 'format') {
				return formatter
			}
			return target[p]
		},
	})

class Program {
	constructor(funcs, n, m, r, c, levels_back = c) {
		this._funcs = funcs
		this._n_inputs = n
		this._n_outputs = m
		this._rows = r
		this._cols = c
		this._levels_back = levels_back
		this._nodes = []
		this._output_nodes = []
		this._active = Array(this._rows * this._cols).fill(false)
	}

	_init() {
		if (this._nodes.length > 0) {
			return
		}
		for (let i = 0; i < this._cols; i++) {
			for (let j = 0; j < this._rows; j++) {
				const f = this._funcs[Math.floor(Math.random() * this._funcs.length)]
				const parents = []
				for (let k = 0; k < f.length; k++) {
					parents.push(this._random_parent_index(i))
				}
				this._nodes.push({ f, parents })
			}
		}
		for (let i = 0; i < this._n_outputs; i++) {
			this._output_nodes[i] = Math.floor(Math.random() * (this._n_inputs + this._nodes.length))
		}
		this._check_active_nodes()
	}

	_check_active_nodes() {
		const stack = [...this._output_nodes]
		while (stack.length > 0) {
			const i = stack.shift()
			if (i < this._n_inputs || this._active[i - this._n_inputs]) {
				continue
			}
			this._active[i - this._n_inputs] = true
			stack.push(...this._nodes[i - this._n_inputs].parents)
		}
	}

	_random_parent_index(layer) {
		return layer < this._levels_back
			? Math.floor(Math.random() * (this._n_inputs + layer * this._rows))
			: Math.floor(Math.random() * (this._levels_back * this._rows)) +
					(this._n_inputs + (layer - this._levels_back) * this._rows)
	}

	mutate(rate = 0.03) {
		const prog = new Program(
			this._funcs,
			this._n_inputs,
			this._n_outputs,
			this._rows,
			this._cols,
			this._levels_back
		)
		prog._nodes = this._nodes.map(n => ({ f: n.f, parents: n.parents.concat() }))
		prog._output_nodes = this._output_nodes.concat()
		for (let i = 0; i < prog._nodes.length; i++) {
			const l = Math.floor(i / prog._rows)
			const ni = prog._nodes[i]
			if (Math.random() < rate) {
				const f = prog._funcs[Math.floor(Math.random() * prog._funcs.length)]
				ni.f = f
				ni.parents.length = f.length
			}
			for (let k = 0; k < ni.parents.length; k++) {
				if (ni.parents[k] == null || Math.random() < rate) {
					ni.parents[k] = prog._random_parent_index(l)
				}
			}
		}
		for (let i = 0; i < prog._n_outputs; i++) {
			if (Math.random() < rate) {
				prog._output_nodes[i] = Math.floor(Math.random() * (prog._n_inputs + prog._nodes.length))
			}
		}
		prog._check_active_nodes()
		return prog
	}

	evaluate(x) {
		this._init()
		const values = []
		for (let i = 0; i < x[0].length; i++) {
			values[i] = x.map(xi => xi[i])
		}
		for (let i = 0; i < this._rows * this._cols; i++) {
			if (!this._active[i]) {
				continue
			}
			const ni = this._nodes[i]
			values[i + this._n_inputs] = ni.f(...ni.parents.map(j => values[j]))
		}
		const y = []
		for (let i = 0; i < x.length; i++) {
			y[i] = this._output_nodes.map(k => values[k][i])
		}
		return y
	}

	toString() {
		this._init()
		const strs = Array.from({ length: this._n_inputs }, (_, i) => `x[${i}]`)
		strs[strs.length - 1] = 1
		for (let i = 0; i < this._rows * this._cols; i++) {
			if (!this._active[i]) {
				continue
			}
			const ni = this._nodes[i]
			const args = ni.parents.map(j => strs[j])
			strs[i + this._n_inputs] = ni.f.format ? ni.f.format(...args) : `${ni.f.name}(${args.join(', ')})`
		}
		return this._output_nodes.map(i => strs[i])
	}
}

const functions = {
	'+': vectorize(
		(a, b) => a + b,
		'+',
		(...args) => `(${args.join(' + ')})`
	),
	'-': vectorize(
		(a, b) => a - b,
		'-',
		(...args) => `(${args.join(' - ')})`
	),
	'*': vectorize(
		(a, b) => a * b,
		'*',
		(...args) => `(${args.join(' * ')})`
	),
	'/': vectorize(
		(a, b) => (b === 0 ? 1 : a / b),
		'/',
		(...args) => `(${args.join(' / ')})`
	),
}

/**
 * Cartesian genetic programming
 */
export default class CartesianGeneticProgramming {
	// An empirical study of the efficiency of learning boolean functions using a Cartesian Genetic Programming approach
	// https://www.researchgate.net/profile/Julian-Miller/publication/2849892_An_Empirical_Study_of_the_Efficiency_of_Learning_Boolean_Functions/links/547c567d0cf2a961e48a0208/An-Empirical-Study-of-the-Efficiency-of-Learning-Boolean-Functions.pdf
	// https://qiita.com/shinjikato/items/f482637d1976a0ca6b7c
	// https://en.wikipedia.org/wiki/Cartesian_genetic_programming
	// https://cs.ijs.si/ppsn2014/files/slides/ppsn2014-tutorial3-miller.pdf
	/**
	 * @param {number} rows Number of nodes for each layer
	 * @param {number} cols Number of layers
	 * @param {('+' | '-' | '*' | '/' | function (number, number): number)[]} [funcs] Functions to use
	 * @param {number} [size] Number of populations per generation
	 */
	constructor(rows, cols, funcs = ['+', '-', '*', '/'], size = 100) {
		this._rows = rows
		this._cols = cols
		this._progs = []
		this._funcs = funcs.map(func => {
			if (typeof func === 'string') {
				return functions[func]
			}
			return vectorize(func)
		})
		this._variables = []
		this._size = size
		this._loss = (y, y_pred) => {
			let err = 0
			for (let i = 0; i < y.length; i++) {
				const ei = y[i].reduce((s, v, j) => s + (v - y_pred[i][j]) ** 2, 0)
				err += Math.sqrt(ei)
			}
			return err / y.length
		}
	}

	/**
	 * @returns {Program} Best programs for each outputs
	 */
	get bestProgram() {
		return this._progs[0].p
	}

	/**
	 * Initialize model.
	 * @param {Array<Array<number>>} x Training data
	 * @param {Array<Array<number>>} y Target values
	 */
	init(x, y) {
		this._x = x.map(v => [...v, 1])
		this._y = y

		this._progs = []
		for (let i = 0; i < this._size * 2; i++) {
			const p = new Program(this._funcs, this._x[0].length, this._y[0].length, this._rows, this._cols)
			this._progs.push({
				p,
				loss: this._loss(this._y, p.evaluate(this._x)),
			})
		}
		this._progs.sort((a, b) => a.loss - b.loss)
		this._progs = this._progs.slice(0, this._size)
	}

	/**
	 * Fit model.
	 */
	fit() {
		for (let i = 0; i < this._size; i++) {
			const p = this._progs[i].p.mutate()
			this._progs.push({
				p,
				loss: this._loss(this._y, p.evaluate(this._x)),
			})
		}
		this._progs.sort((a, b) => a.loss - b.loss)
		this._progs = this._progs.slice(0, this._size)
		return this._progs[0].loss
	}

	/**
	 * Returns predicted values.
	 * @param {Array<Array<number>>} x Sample data
	 * @returns {Array<Array<number>>} Predicted values
	 */
	predict(x) {
		x = x.map(v => [...v, 1])
		return this._progs[0].p.evaluate(x)
	}
}
