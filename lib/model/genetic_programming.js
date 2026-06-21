class Node {
	constructor(value) {
		this.value = value
		this.children = []
	}

	get length() {
		if (typeof this.value === 'function') {
			return this.value.length
		}
		return 0
	}

	addChild(child) {
		this.children.push(child)
	}

	copy() {
		const node = new Node(this.value)
		node.children = this.children.map(c => c.copy())
		return node
	}

	evaluate(env) {
		if (typeof this.value === 'function') {
			return this.value(...this.children.map(child => child.evaluate(env)))
		}
		if (Object.hasOwn(env, this.value)) {
			return env[this.value]
		}
		return this.value
	}

	toString() {
		if (typeof this.value === 'function') {
			const args = this.children.map(child => child.toString())
			if (this.value.format) {
				return this.value.format(...args)
			}
			return `${this.value.name}(${args.join(', ')})`
		}
		return `${this.value}`
	}
}

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
	constructor(root) {
		this._p = root
	}

	static create(funcs, variables, depth = 2) {
		const root = new Node(funcs[Math.floor(Math.random() * funcs.length)])
		let stack = [root]
		for (let i = 0; i < depth; i++) {
			const newStack = []
			for (const node of stack) {
				for (let j = 0; j < node.length; j++) {
					const child = new Node(funcs[Math.floor(Math.random() * funcs.length)])
					node.addChild(child)
					newStack.push(child)
				}
			}
			stack = newStack
		}
		for (const node of stack) {
			for (let j = 0; j < node.length; j++) {
				if (Math.random() < 0.5) {
					node.addChild(new Node(variables[Math.floor(Math.random() * variables.length)]))
				} else {
					const x = Math.random()
					const y = Math.random()
					const X = Math.sqrt(-2 * Math.log(x)) * Math.cos(2 * Math.PI * y)
					node.addChild(new Node(X))
				}
			}
		}
		const p = new Program(root)
		p.normalize()
		return p
	}

	*nodes() {
		const stack = [this._p]
		while (stack.length > 0) {
			const node = stack.shift()
			stack.push(...node.children)
			yield node
		}
	}

	normalize() {
		const nodes = [...this.nodes()]
		for (let i = nodes.length - 1; i >= 0; i--) {
			const node = nodes[i]
			if (node.children.some(c => typeof c.value !== 'number')) {
				continue
			}
			node.value = node.evaluate({})
		}
	}

	mix(other) {
		const cp = new Program(this._p.copy())
		const thisNodes = [...cp.nodes()]
		const otherNodes = [...other.nodes()]
		const thisIdx = Math.floor(Math.random() * thisNodes.length)
		const otherIdx = Math.floor(Math.random() * otherNodes.length)
		thisNodes[thisIdx].value = otherNodes[otherIdx].value
		thisNodes[thisIdx].children = otherNodes[otherIdx].children.map(c => c.copy())
		cp.normalize()
		return cp
	}

	evaluate(env) {
		return this._p.evaluate(env)
	}

	toString() {
		return this._p.toString()
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
 * Genetic Programming
 */
export default class GeneticProgramming {
	// Genetic Programming as a Means for Programming Computers by Natural Selection
	// https://www.genetic-programming.com/jkpdf/scjournallong.pdf
	// https://qiita.com/shinjikato/items/f482637d1976a0ca6b7c
	/**
	 * @param {('+' | '-' | '*' | '/' | function (number, number): number)[]} [funcs] Functions to use
	 * @param {number} [size] Number of populations per generation
	 */
	constructor(funcs = ['+', '-', '*', '/'], size = 100) {
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
			if (Array.isArray(y_pred)) {
				return y.reduce((s, v, i) => s + (v - y_pred[i]) ** 2, 1) / y.length
			}
			return y.reduce((s, v) => s + (v - y_pred) ** 2, 1) / y.length
		}
	}

	/**
	 * @returns {Program[]} Best programs for each outputs
	 */
	get bestPrograms() {
		return this._progs.map(p => p[0].p)
	}

	/**
	 * Initialize model.
	 * @param {Array<Array<number>>} x Training data
	 * @param {Array<Array<number>>} y Target values
	 */
	init(x, y) {
		this._x = x
		this._y = y
		this._variables = Array.from(this._x[0], (_, i) => `x[${i}]`)
		this._outDim = y[0].length

		this._inputs = {}
		for (let i = 0; i < this._variables.length; i++) {
			this._inputs[this._variables[i]] = this._x.map(xi => xi[i])
		}
		this._outputs = []
		for (let i = 0; i < this._outDim; i++) {
			this._outputs[i] = this._y.map(v => v[i])
		}
		for (let d = 0; d < this._outDim; d++) {
			this._progs[d] = []
			for (let i = 0; i < this._size * 2; i++) {
				const p = Program.create(this._funcs, this._variables)
				this._progs[d].push({
					p,
					loss: this._loss(this._outputs[d], p.evaluate(this._inputs)),
				})
			}
			this._progs[d].sort((a, b) => a.loss - b.loss)
			this._progs[d] = this._progs[d].slice(0, this._size)
		}
	}

	/**
	 * Fit model.
	 */
	fit() {
		for (let d = 0; d < this._outDim; d++) {
			const newProgs = [...this._progs[d]]
			for (let i = 0; i < this._size; i++) {
				const sump = this._progs[d].reduce((s, p) => s + 1 / p.loss, 0)
				let r = Math.random() * sump
				for (let j = 0; j < this._size; j++) {
					r -= 1 / this._progs[d][i].loss
					if (r <= 0) {
						const p = this._progs[d][i].p.mix(this._progs[d][j].p)
						newProgs.push({
							p,
							loss: this._loss(this._outputs[d], p.evaluate(this._inputs)),
						})
						break
					}
				}
			}
			newProgs.sort((a, b) => a.loss - b.loss)
			this._progs[d] = newProgs.slice(0, this._size)
		}
		return this._progs.reduce((s, v) => s + v[0].loss, 0) / this._outDim
	}

	/**
	 * Returns predicted values.
	 * @param {Array<Array<number>>} x Sample data
	 * @returns {Array<Array<number>>} Predicted values
	 */
	predict(x) {
		const inputs = {}
		for (let i = 0; i < x[0].length; i++) {
			inputs[`x[${i}]`] = x.map(xi => xi[i])
		}
		const result = Array.from({ length: x.length }, () => [])
		for (let d = 0; d < this._outDim; d++) {
			const od = this._progs[d][0].p.evaluate(inputs)
			for (let i = 0; i < x.length; i++) {
				result[i][d] = Array.isArray(od) ? od[i] : od
			}
		}
		return result
	}
}
